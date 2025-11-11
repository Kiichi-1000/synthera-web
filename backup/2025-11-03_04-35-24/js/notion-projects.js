// ===== Notion Projects Integration =====
// Load projects from Notion database

// Configuration
const NOTION_PROJECTS_CONFIG = {
  dataSourceId: '3a78c6cd-3554-4fd3-bcca-99962e0510cd', // 🚀 プロジェクト管理
  apiVersion: '2022-06-28',
  maxResults: 100
};

/**
 * Load projects from Notion
 * @param {string} projectType - Filter by project type (sns, brand, development, writing, affiliate, ec)
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<Array>} Array of projects
 */
async function loadNotionProjects(projectType = null, status = null) {
  try {
    const searchFilters = {
      data_source_url: `collection://${NOTION_PROJECTS_CONFIG.dataSourceId}`
    };

    // Add project type filter
    if (projectType) {
      searchFilters.filters = {
        property: 'Project Type',
        select: { equals: projectType.charAt(0).toUpperCase() + projectType.slice(1) }
      };
    }

    // Add status filter if specified
    if (status) {
      if (searchFilters.filters) {
        searchFilters.filters = {
          and: [
            searchFilters.filters,
            { property: 'Status', select: { equals: status } }
          ]
        };
      } else {
        searchFilters.filters = {
          property: 'Status',
          select: { equals: status }
        };
      }
    }

    // Perform search using Notion MCP
    let results = [];
    
    if (typeof window !== 'undefined' && window.notionMCP) {
      results = await window.notionMCP.search('', searchFilters);
    } else {
      try {
        const response = await fetch(`/api/notion/projects?type=${projectType || ''}&status=${status || ''}`);
        if (response.ok) {
          const data = await response.json();
          results = data.results || [];
        }
      } catch (apiError) {
        console.warn('API endpoint not available, using fallback:', apiError);
        return [];
      }
    }

    // Transform Notion pages to projects
    const projects = results
      .filter(page => {
        const published = extractPublished(page);
        return published === true;
      })
      .map(page => transformNotionPageToProject(page))
      .filter(Boolean)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return projects;
  } catch (error) {
    console.error('Error loading projects from Notion:', error);
    return [];
  }
}

// Helper functions
function extractPublished(page) {
  if (typeof window !== 'undefined' && window.NotionAPI?.extractPublished) {
    return window.NotionAPI.extractPublished(page.properties || {});
  }
  
  const props = page.properties || {};
  const pubProp = props.Published || props.published;
  if (pubProp?.type === 'checkbox') {
    return pubProp.checkbox === true || pubProp.checkbox === '__YES__';
  }
  return pubProp === true || pubProp === '__YES__';
}

function transformNotionPageToProject(page) {
  if (typeof window !== 'undefined' && window.NotionAPI?.transformNotionPageToProject) {
    return window.NotionAPI.transformNotionPageToProject(page);
  }
  
  // Fallback implementation
  const props = page.properties || {};
  
  return {
    id: page.id?.replace(/-/g, '') || page.id,
    title: extractTitle(props),
    projectType: extractProjectType(props),
    description: page.content || '',
    image: extractImage(props),
    status: extractStatus(props),
    link: extractLink(props),
    order: extractOrder(props),
    published: extractPublished(page),
    tags: extractTags(props)
  };
}

function extractTitle(props) {
  const titleProp = props.Title || props.title || props.Name;
  if (!titleProp) return 'Untitled';
  
  if (titleProp.type === 'title' && titleProp.title) {
    return titleProp.title.map(t => t.plain_text || t.text?.content || '').join('') || 'Untitled';
  }
  
  if (Array.isArray(titleProp)) {
    return titleProp.map(t => t.plain_text || t.text?.content || '').join('') || 'Untitled';
  }
  
  return titleProp || 'Untitled';
}

function extractProjectType(props) {
  const typeProp = props['Project Type'] || props.projectType;
  if (typeProp?.type === 'select') {
    return typeProp.select?.name?.toLowerCase() || 'sns';
  }
  return (typeProp || 'sns').toLowerCase();
}

function extractStatus(props) {
  const statusProp = props.Status || props.status;
  if (statusProp?.type === 'select') {
    return statusProp.select?.name || '運営中';
  }
  return statusProp || '運営中';
}

function extractImage(props) {
  const imageProp = props.Image || props.image || props['Project Image'];
  if (!imageProp) return null;
  
  if (imageProp.type === 'files' && imageProp.files && imageProp.files.length > 0) {
    const file = imageProp.files[0];
    return file.file?.url || file.external?.url || null;
  }
  
  return imageProp || null;
}

function extractLink(props) {
  const linkProp = props.Link || props.link || props.URL || props.url;
  if (linkProp?.type === 'url') {
    return linkProp.url || '';
  }
  return linkProp || '';
}

function extractOrder(props) {
  const orderProp = props.Order || props.order;
  if (orderProp?.type === 'number') {
    return orderProp.number || 0;
  }
  return orderProp || 0;
}

function extractTags(props) {
  const tagsProp = props.Tags || props.tags;
  if (tagsProp?.type === 'multi_select' && tagsProp.multi_select) {
    return tagsProp.multi_select.map(t => t.name || t).filter(Boolean);
  }
  if (Array.isArray(tagsProp)) {
    return tagsProp;
  }
  return [];
}

// Export
if (typeof window !== 'undefined') {
  window.loadNotionProjects = loadNotionProjects;
}

