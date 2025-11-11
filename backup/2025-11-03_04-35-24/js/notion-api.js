// ===== Notion API Client =====
// Unified Notion API integration for all pages

// Configuration - Database IDs
const NOTION_DATABASES = {
  note: {
    dataSourceId: 'd05ba52d-48de-4a27-8642-408dbacf4798', // 📝 Note記事管理
    apiVersion: '2022-06-28'
  },
  affiling: {
    dataSourceId: 'd3a13abc-8b66-4154-9f30-715c69570d6d', // 📰 Affiling記事管理
    apiVersion: '2022-06-28'
  },
  projects: {
    dataSourceId: '3a78c6cd-3554-4fd3-bcca-99962e0510cd', // 🚀 プロジェクト管理
    apiVersion: '2022-06-28'
  },
  siteContent: {
    dataSourceId: 'a73a112c-d717-4a00-8481-8de54bb6ad7c', // 🔧 サイトコンテンツ管理
    apiVersion: '2022-06-28'
  },
  projectsDetails: {
    dataSourceId: 'cd2203c6-b691-42c4-8581-28a635c8edc4', // 📋 Projects詳細管理
    apiVersion: '2022-06-28'
  },
  sectionElements: {
    dataSourceId: '52797e2a-f2f2-4cd9-b772-3a9fa9bbc46d', // 📦 セクション要素管理
    apiVersion: '2022-06-28'
  }
};

// Cache settings
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = {
  note: { data: null, timestamp: 0 },
  affiling: { data: null, timestamp: 0 },
  projects: { data: null, timestamp: 0 },
  projectsDetails: { data: null, timestamp: 0 },
  siteContent: { data: null, timestamp: 0 },
  sectionElements: { data: null, timestamp: 0 }
};

// ===== Notion API Functions =====

/**
 * Search Notion database using MCP
 * @param {string} dbType - 'note', 'affiling', or 'projects'
 * @param {object} filters - Optional filters
 * @returns {Promise<Array>} Array of pages
 */
async function fetchNotionDatabase(dbType, filters = {}) {
  const config = NOTION_DATABASES[dbType];
  if (!config) {
    console.error(`Unknown database type: ${dbType}`);
    return [];
  }

  // Check cache
  const now = Date.now();
  if (cache[dbType].data && (now - cache[dbType].timestamp) < CACHE_DURATION) {
    return cache[dbType].data;
  }

  try {
    // Use Notion MCP search function
    const searchQuery = filters.query || '';
    const searchFilters = {
      ...filters,
      data_source_url: `collection://${config.dataSourceId}`
    };

    const results = await window.notionMCP?.search?.(searchQuery, searchFilters) || [];
    
    // Cache results
    cache[dbType].data = results;
    cache[dbType].timestamp = now;

    return results;
  } catch (error) {
    console.error(`Error fetching ${dbType} database:`, error);
    return [];
  }
}

/**
 * Fetch a specific page by ID using MCP
 * @param {string} pageId - Notion page ID
 * @returns {Promise<Object>} Page data
 */
async function fetchNotionPage(pageId) {
  try {
    const page = await window.notionMCP?.fetch?.(pageId);
    return page || null;
  } catch (error) {
    console.error(`Error fetching page ${pageId}:`, error);
    return null;
  }
}

/**
 * Convert Notion rich text blocks to HTML
 * @param {Array} blocks - Notion rich text blocks
 * @returns {string} HTML string
 */
function convertNotionRichTextToHTML(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';

  return blocks.map(block => {
    if (typeof block === 'string') return block;

    let html = '';
    
    // Handle text with annotations
    if (block.type === 'text') {
      let text = block.text?.content || block.content || '';
      
      // Apply annotations
      if (block.annotations) {
        if (block.annotations.bold) text = `<strong>${text}</strong>`;
        if (block.annotations.italic) text = `<em>${text}</em>`;
        if (block.annotations.strikethrough) text = `<s>${text}</s>`;
        if (block.annotations.underline) text = `<u>${text}</u>`;
        if (block.annotations.code) text = `<code>${text}</code>`;
      }
      
      // Handle links
      if (block.text?.link) {
        text = `<a href="${block.text.link.url}" target="_blank" rel="noopener">${text}</a>`;
      }
      
      html = text;
    }
    
    // Handle mentions
    if (block.type === 'mention') {
      if (block.mention?.type === 'page') {
        html = `<a href="#" class="notion-page-mention">${block.plain_text || 'Page'}</a>`;
      } else if (block.mention?.type === 'user') {
        html = `<span class="notion-user-mention">@${block.plain_text || 'User'}</span>`;
      }
    }
    
    // Handle equations
    if (block.type === 'equation') {
      html = `<span class="notion-equation">${block.equation?.expression || ''}</span>`;
    }

    return html || block.plain_text || '';
  }).join('');
}

/**
 * Convert Notion page blocks to HTML
 * @param {Object} page - Notion page object
 * @returns {string} HTML string
 */
function convertNotionPageToHTML(page) {
  if (!page || !page.content) return '';

  // If content is a string, return as is
  if (typeof page.content === 'string') {
    return page.content;
  }

  // If content is blocks array, convert each block
  if (Array.isArray(page.content)) {
    return page.content.map(block => {
      switch (block.type) {
        case 'heading_1':
          return `<h1>${convertNotionRichTextToHTML(block.heading_1?.rich_text || [])}</h1>`;
        case 'heading_2':
          return `<h2>${convertNotionRichTextToHTML(block.heading_2?.rich_text || [])}</h2>`;
        case 'heading_3':
          return `<h3>${convertNotionRichTextToHTML(block.heading_3?.rich_text || [])}</h3>`;
        case 'paragraph':
          return `<p>${convertNotionRichTextToHTML(block.paragraph?.rich_text || [])}</p>`;
        case 'bulleted_list_item':
          return `<li>${convertNotionRichTextToHTML(block.bulleted_list_item?.rich_text || [])}</li>`;
        case 'numbered_list_item':
          return `<li>${convertNotionRichTextToHTML(block.numbered_list_item?.rich_text || [])}</li>`;
        case 'quote':
          return `<blockquote>${convertNotionRichTextToHTML(block.quote?.rich_text || [])}</blockquote>`;
        case 'code':
          const code = convertNotionRichTextToHTML(block.code?.rich_text || []);
          const language = block.code?.language || '';
          return `<pre><code class="language-${language}">${code}</code></pre>`;
        case 'image':
          const imageUrl = block.image?.file?.url || block.image?.external?.url || '';
          const imageCaption = convertNotionRichTextToHTML(block.image?.caption || []);
          return `<figure><img src="${imageUrl}" alt="${imageCaption}"><figcaption>${imageCaption}</figcaption></figure>`;
        default:
          return '';
      }
    }).join('');
  }

  return '';
}

/**
 * Transform Notion page to article format
 * @param {Object} notionPage - Notion page object
 * @param {string} dbType - Database type
 * @returns {Object} Transformed article object
 */
function transformNotionPageToArticle(notionPage, dbType = 'note') {
  if (!notionPage) return null;

  // Extract properties from page
  const props = notionPage.properties || {};
  
  const article = {
    id: notionPage.id?.replace(/-/g, '') || notionPage.id,
    title: extractTitle(props),
    slug: extractSlug(props),
    category: extractCategory(props, dbType),
    excerpt: extractExcerpt(props),
    content: notionPage.content || '',
    date: extractDate(props),
    image: extractImage(props),
    published: extractPublished(props),
    readTime: extractReadTime(props),
    productCount: extractProductCount(props),
    metaDescription: extractMetaDescription(props)
  };

  return article;
}

/**
 * Transform Notion page to project format
 * @param {Object} notionPage - Notion page object
 * @returns {Object} Transformed project object
 */
function transformNotionPageToProject(notionPage) {
  if (!notionPage) return null;

  const props = notionPage.properties || {};
  
  const project = {
    id: notionPage.id?.replace(/-/g, '') || notionPage.id,
    title: extractTitle(props),
    projectType: extractProjectType(props),
    description: notionPage.content || '',
    image: extractImage(props),
    status: extractStatus(props),
    link: extractLink(props),
    order: extractOrder(props),
    published: extractPublished(props),
    tags: extractTags(props)
  };

  return project;
}

// ===== Property Extractors =====

function extractTitle(props) {
  const titleProp = props.Title || props.title || props['名前'] || props.Name;
  if (!titleProp) return 'Untitled';
  
  if (titleProp.type === 'title' && titleProp.title) {
    return titleProp.title.map(t => t.plain_text || t.text?.content || '').join('') || 'Untitled';
  }
  
  if (Array.isArray(titleProp)) {
    return titleProp.map(t => t.plain_text || t.text?.content || '').join('') || 'Untitled';
  }
  
  return titleProp || 'Untitled';
}

function extractSlug(props) {
  const slugProp = props.Slug || props.slug;
  if (!slugProp) return '';
  
  if (slugProp.type === 'rich_text' && slugProp.rich_text) {
    return slugProp.rich_text.map(t => t.plain_text || '').join('');
  }
  
  return slugProp || '';
}

function extractCategory(props, dbType) {
  if (dbType === 'affiling') {
    const catProp = props.Category || props.category;
    if (catProp?.type === 'select') {
      return catProp.select?.name || '';
    }
    return catProp || 'comparison';
  } else {
    const catProp = props.Category || props.category;
    if (catProp?.type === 'select') {
      return catProp.select?.name?.toLowerCase() || 'technology';
    }
    return (catProp || 'technology').toLowerCase();
  }
}

function extractExcerpt(props) {
  const excerptProp = props.Excerpt || props.excerpt || props.Description || props.description;
  if (!excerptProp) return '';
  
  if (excerptProp.type === 'rich_text' && excerptProp.rich_text) {
    return excerptProp.rich_text.map(t => t.plain_text || '').join('');
  }
  
  if (excerptProp.type === 'text') {
    return excerptProp.text || '';
  }
  
  return excerptProp || '';
}

function extractDate(props) {
  const dateProp = props['Published Date'] || props.publishedDate || props.date || props.Date;
  if (!dateProp) return new Date();
  
  if (dateProp.type === 'date' && dateProp.date) {
    return new Date(dateProp.date.start || dateProp.date);
  }
  
  return new Date(dateProp || Date.now());
}

function extractImage(props) {
  const imageProp = props['Featured Image'] || props.image || props.Image || props['Project Image'];
  if (!imageProp) return null;
  
  if (imageProp.type === 'files' && imageProp.files && imageProp.files.length > 0) {
    const file = imageProp.files[0];
    return file.file?.url || file.external?.url || null;
  }
  
  return imageProp || null;
}

function extractPublished(props) {
  const pubProp = props.Published || props.published;
  if (pubProp?.type === 'checkbox') {
    return pubProp.checkbox === true || pubProp.checkbox === '__YES__';
  }
  return pubProp === true || pubProp === '__YES__';
}

function extractReadTime(props) {
  const readTimeProp = props['Read Time'] || props.readTime;
  if (readTimeProp?.type === 'number') {
    return readTimeProp.number || 5;
  }
  return readTimeProp || 5;
}

function extractProductCount(props) {
  const countProp = props['Product Count'] || props.productCount;
  if (countProp?.type === 'number') {
    return countProp.number || 0;
  }
  return countProp || 0;
}

function extractMetaDescription(props) {
  const metaProp = props['Meta Description'] || props.metaDescription;
  if (metaProp?.type === 'rich_text' && metaProp.rich_text) {
    return metaProp.rich_text.map(t => t.plain_text || '').join('');
  }
  return metaProp || '';
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

// ===== Clear Cache =====
function clearCache(dbType = null) {
  if (dbType) {
    cache[dbType] = { data: null, timestamp: 0 };
  } else {
    Object.keys(cache).forEach(key => {
      cache[key] = { data: null, timestamp: 0 };
    });
  }
}

// ===== Export =====
window.NotionAPI = {
  fetchNotionDatabase,
  fetchNotionPage,
  convertNotionRichTextToHTML,
  convertNotionPageToHTML,
  transformNotionPageToArticle,
  transformNotionPageToProject,
  clearCache,
  NOTION_DATABASES
};

