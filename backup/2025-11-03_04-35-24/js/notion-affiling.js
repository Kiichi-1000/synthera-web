// ===== Notion Affiling Integration =====
// Updated to use Notion MCP for real data fetching

// Configuration
const NOTION_AFFILING_CONFIG = {
  dataSourceId: 'd3a13abc-8b66-4154-9f30-715c69570d6d', // 📰 Affiling記事管理
  apiVersion: '2022-06-28',
  maxResults: 20
};

/**
 * Load articles from Notion using MCP
 * @param {string} filter - Category filter
 * @param {string} searchQuery - Search query
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of articles
 */
async function loadNotionArticles(filter = 'all', searchQuery = '', page = 1) {
  try {
    // Use Notion MCP search
    const searchFilters = {
      data_source_url: `collection://${NOTION_AFFILING_CONFIG.dataSourceId}`
    };

    // Add category filter
    if (filter !== 'all') {
      const categoryMap = {
        'comparison': '商品比較',
        'ranking': 'ランキング',
        'review': 'レビュー',
        'guide': 'ガイド'
      };
      searchFilters.filters = {
        property: 'Category',
        select: { equals: categoryMap[filter] || filter }
      };
    }

    // Perform search using Notion MCP
    let results = [];
    
    // Try to use MCP if available (server-side)
    if (typeof window !== 'undefined' && window.notionMCP) {
      results = await window.notionMCP.search(searchQuery, searchFilters);
    } else {
      // Fallback: try to fetch via API endpoint
      try {
        const response = await fetch(`/api/notion/affiling?filter=${filter}&search=${encodeURIComponent(searchQuery)}&page=${page}`);
        if (response.ok) {
          const data = await response.json();
          results = data.results || [];
        }
      } catch (apiError) {
        console.warn('API endpoint not available, using fallback:', apiError);
        return [];
      }
    }

    // Transform Notion pages to articles
    const articles = results
      .filter(page => {
        // Filter by published status
        const published = extractPublished(page);
        return published === true;
      })
      .map(page => transformNotionPageToArticle(page, 'affiling'))
      .filter(Boolean);

    return articles;
  } catch (error) {
    console.error('Error loading articles from Notion:', error);
    return [];
  }
}

/**
 * Load a specific article by ID
 * @param {string} articleId - Article ID
 * @returns {Promise<Object>} Article object
 */
async function loadNotionArticle(articleId) {
  try {
    // Fetch page using Notion MCP
    let page = null;
    
    if (typeof window !== 'undefined' && window.notionMCP) {
      page = await window.notionMCP.fetch(articleId);
    } else {
      try {
        const response = await fetch(`/api/notion/affiling/${articleId}`);
        if (response.ok) {
          const data = await response.json();
          page = data;
        }
      } catch (apiError) {
        console.warn('API endpoint not available:', apiError);
        return null;
      }
    }

    if (!page) return null;

    // Transform and return
    const article = transformNotionPageToArticle(page, 'affiling');
    
    // Convert content to HTML if needed
    if (page.content && typeof page.content !== 'string') {
      article.content = convertNotionPageToHTML(page);
    }

    return article;
  } catch (error) {
    console.error('Error loading article from Notion:', error);
    return null;
  }
}

// Helper functions (use from notion-api.js if available)
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

function transformNotionPageToArticle(page, dbType = 'affiling') {
  if (typeof window !== 'undefined' && window.NotionAPI?.transformNotionPageToArticle) {
    return window.NotionAPI.transformNotionPageToArticle(page, dbType);
  }
  
  // Fallback implementation
  const props = page.properties || {};
  
  return {
    id: page.id?.replace(/-/g, '') || page.id,
    title: extractTitle(props),
    slug: extractSlug(props),
    category: extractCategory(props, dbType),
    excerpt: extractExcerpt(props),
    content: page.content || '',
    date: extractDate(props),
    image: extractImage(props),
    published: extractPublished(page),
    readTime: extractReadTime(props),
    productCount: extractProductCount(props),
    metaDescription: extractMetaDescription(props)
  };
}

function convertNotionPageToHTML(page) {
  if (typeof window !== 'undefined' && window.NotionAPI?.convertNotionPageToHTML) {
    return window.NotionAPI.convertNotionPageToHTML(page);
  }
  return page.content || '';
}

// Property extractors (fallback)
function extractTitle(props) {
  const titleProp = props.Title || props.title || props.Name || props['名前'];
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
  const catProp = props.Category || props.category;
  if (catProp?.type === 'select') {
    const catName = catProp.select?.name || '';
    if (dbType === 'affiling') {
      // Map Japanese category names to English keys
      const categoryMap = {
        '商品比較': 'comparison',
        'ランキング': 'ranking',
        'レビュー': 'review',
        'ガイド': 'guide'
      };
      return categoryMap[catName] || catName.toLowerCase();
    }
    return catName.toLowerCase();
  }
  return (catProp || (dbType === 'affiling' ? 'comparison' : 'technology')).toLowerCase();
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
  const imageProp = props['Featured Image'] || props.image || props.Image;
  if (!imageProp) return null;
  
  if (imageProp.type === 'files' && imageProp.files && imageProp.files.length > 0) {
    const file = imageProp.files[0];
    return file.file?.url || file.external?.url || null;
  }
  
  return imageProp || null;
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

// Export for use in affiling.js
if (typeof window !== 'undefined') {
  window.loadNotionArticles = loadNotionArticles;
  window.loadNotionArticle = loadNotionArticle;
  window.transformNotionArticle = transformNotionPageToArticle;
}
