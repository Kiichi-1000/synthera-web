// ===== Notion Site Content Manager =====
// Manages all site content (text, images, HTML) from Notion

// Configuration
const NOTION_SITE_CONTENT_CONFIG = {
  dataSourceId: 'a73a112c-d717-4a00-8481-8de54bb6ad7c', // 🔧 サイトコンテンツ管理
  apiVersion: '2022-06-28'
};

// Cache
let contentCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Initialize site content loading
 */
document.addEventListener('DOMContentLoaded', function() {
  initSiteContent();
});

/**
 * Initialize site content
 */
async function initSiteContent() {
  // V2システムが利用可能な場合はそちらを使用
  if (window.NotionSiteContentV2) {
    // V2システムに処理を委譲
    return;
  }

  // Get current page name
  const currentPage = getCurrentPageName();
  
  if (!currentPage) {
    console.warn('Could not determine current page');
    return;
  }

  // Load content for current page
  await loadAndApplySiteContent(currentPage);
}

/**
 * Get current page name from URL
 * @returns {string} Page name (index, about, projects, etc.)
 */
function getCurrentPageName() {
  const path = window.location.pathname;
  const fileName = path.split('/').pop() || 'index.html';
  
  // Remove .html extension
  const pageName = fileName.replace('.html', '');
  
  // Map to Notion page values
  const pageMap = {
    '': 'index',
    'index': 'index',
    'about': 'about',
    'projects': 'projects',
    'note': 'note',
    'affiling': 'affiling',
    'affiling-article': 'affiling'
  };
  
  return pageMap[pageName] || 'index';
}

/**
 * Load and apply site content from Notion
 * @param {string} pageName - Page name
 */
async function loadAndApplySiteContent(pageName) {
  try {
    // Load content from Notion
    const contentItems = await loadSiteContentFromNotion(pageName);
    
    if (!contentItems || contentItems.length === 0) {
      console.log(`No content found for page: ${pageName}`);
      return;
    }

    // Sort by order
    contentItems.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Apply each content item
    contentItems.forEach(item => {
      applyContentItem(item);
    });

    console.log(`Applied ${contentItems.length} content items for ${pageName}`);
  } catch (error) {
    console.error('Error loading site content:', error);
  }
}

/**
 * Load site content from Notion
 * @param {string} pageName - Page name
 * @returns {Promise<Array>} Array of content items
 */
async function loadSiteContentFromNotion(pageName) {
  // Check cache
  const now = Date.now();
  if (contentCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return contentCache.filter(item => item.page === pageName && item.active);
  }

  try {
    let results = [];
    
    // Use unified Notion API
    if (typeof window !== 'undefined' && window.NotionAPI) {
      results = await window.NotionAPI.fetchNotionDatabase('siteContent', {
        query: '',
        filters: {
          Page: pageName
        }
      });
    } else {
      // Fallback: try API endpoint
      try {
        const response = await fetch(`/api/notion/site-content?page=${pageName}`);
        if (response.ok) {
          const data = await response.json();
          results = data.results || [];
        }
      } catch (apiError) {
        console.warn('API endpoint not available:', apiError);
        return [];
      }
    }

    // Transform results
    const contentItems = results
      .map(page => transformNotionPageToContentItem(page))
      .filter(item => item && item.active);

    // Cache results
    contentCache = contentItems;
    cacheTimestamp = now;

    return contentItems;
  } catch (error) {
    console.error('Error loading site content from Notion:', error);
    return [];
  }
}

/**
 * Transform Notion page to content item
 * @param {Object} page - Notion page
 * @returns {Object} Content item
 */
function transformNotionPageToContentItem(page) {
  const props = page.properties || {};
  
  return {
    id: page.id,
    title: extractTitle(props),
    page: extractPage(props),
    sectionId: extractSectionId(props),
    elementSelector: extractElementSelector(props),
    contentType: extractContentType(props),
    content: extractContent(props),
    image: extractImage(props),
    attributeName: extractAttributeName(props),
    order: extractOrder(props),
    active: extractActive(props)
  };
}

/**
 * Apply content item to DOM
 * @param {Object} item - Content item
 */
function applyContentItem(item) {
  if (!item.active) return;

  // Find target element
  let targetElement = null;

  // Try element selector first
  if (item.elementSelector) {
    try {
      targetElement = document.querySelector(item.elementSelector);
    } catch (e) {
      console.warn(`Invalid selector: ${item.elementSelector}`, e);
    }
  }

  // Fallback to section ID
  if (!targetElement && item.sectionId) {
    targetElement = document.getElementById(item.sectionId);
  }

  if (!targetElement) {
    // Don't warn for missing elements during initial load (elements may not exist yet)
    if (document.readyState === 'complete') {
      console.warn(`Element not found: ${item.elementSelector || item.sectionId}`);
    }
    return;
  }

  // Apply content based on type
  switch (item.contentType) {
    case 'text':
      applyTextContent(targetElement, item.content);
      break;
    case 'html':
      applyHTMLContent(targetElement, item.content);
      break;
    case 'image':
      applyImageContent(targetElement, item.image, item.content);
      break;
    case 'attribute':
      applyAttributeContent(targetElement, item.attributeName, item.content);
      break;
    default:
      console.warn(`Unknown content type: ${item.contentType}`);
  }
}

/**
 * Apply text content
 * @param {HTMLElement} element - Target element
 * @param {string} content - Text content
 */
function applyTextContent(element, content) {
  if (!content) return;
  
  // If element has specific child elements for text, update them
  const textElement = element.querySelector('.title-word, .subtitle-text, .card-title, .card-description, .intro-description, .vm-description, p, h1, h2, h3, h4, span') || element;
  
  // Preserve data attributes and classes
  if (textElement === element) {
    element.textContent = content;
  } else {
    // For title-word elements, preserve data-word attribute
    if (textElement.classList.contains('title-word')) {
      textElement.setAttribute('data-word', content);
      textElement.textContent = content;
    } else {
      textElement.textContent = content;
    }
  }
}

/**
 * Apply HTML content
 * @param {HTMLElement} element - Target element
 * @param {string} content - HTML content
 */
function applyHTMLContent(element, content) {
  if (!content) return;
  element.innerHTML = content;
}

/**
 * Apply image content
 * @param {HTMLElement} element - Target element
 * @param {string} imageUrl - Image URL
 * @param {string} altText - Alt text
 */
function applyImageContent(element, imageUrl, altText) {
  if (!imageUrl) return;

  // Check if element is an img tag
  if (element.tagName === 'IMG') {
    element.src = imageUrl;
    if (altText) element.alt = altText;
    return;
  }

  // Check if element contains an img tag
  const imgElement = element.querySelector('img');
  if (imgElement) {
    imgElement.src = imageUrl;
    if (altText) imgElement.alt = altText;
    return;
  }

  // Check if element is a background image container
  if (element.classList.contains('hero-background') || 
      element.classList.contains('image-container') ||
      element.style.backgroundImage) {
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
    return;
  }

  // Replace placeholder with image
  const placeholder = element.querySelector('.image-placeholder, .article-placeholder');
  if (placeholder) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = altText || '';
    img.loading = 'lazy';
    placeholder.parentElement.replaceChild(img, placeholder);
    return;
  }

  // Create new img element
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = altText || '';
  img.loading = 'lazy';
  element.appendChild(img);
}

/**
 * Apply attribute content
 * @param {HTMLElement} element - Target element
 * @param {string} attributeName - Attribute name
 * @param {string} content - Attribute value
 */
function applyAttributeContent(element, attributeName, content) {
  if (!attributeName || !content) return;
  element.setAttribute(attributeName, content);
}

// ===== Property Extractors =====

function extractTitle(props) {
  const titleProp = props.Title || props.title || props.Name;
  if (!titleProp) return '';
  
  if (titleProp.type === 'title' && titleProp.title) {
    return titleProp.title.map(t => t.plain_text || '').join('');
  }
  
  return titleProp || '';
}

function extractPage(props) {
  const pageProp = props.Page || props.page;
  if (pageProp?.type === 'select') {
    return pageProp.select?.name || '';
  }
  return pageProp || '';
}

function extractSectionId(props) {
  const sectionProp = props['Section ID'] || props.sectionId;
  if (sectionProp?.type === 'rich_text' && sectionProp.rich_text) {
    return sectionProp.rich_text.map(t => t.plain_text || '').join('');
  }
  return sectionProp || '';
}

function extractElementSelector(props) {
  const selectorProp = props['Element Selector'] || props.elementSelector;
  if (selectorProp?.type === 'rich_text' && selectorProp.rich_text) {
    return selectorProp.rich_text.map(t => t.plain_text || '').join('');
  }
  if (selectorProp?.type === 'text') {
    return selectorProp.text || '';
  }
  return selectorProp || '';
}

function extractContentType(props) {
  const typeProp = props['Content Type'] || props.contentType;
  if (typeProp?.type === 'select') {
    return typeProp.select?.name || 'text';
  }
  return (typeProp || 'text').toLowerCase();
}

function extractContent(props) {
  const contentProp = props.Content || props.content;
  if (!contentProp) return '';
  
  if (contentProp.type === 'rich_text' && contentProp.rich_text) {
    // Convert rich text to HTML if contentType is html
    return contentProp.rich_text.map(t => {
      let text = t.plain_text || '';
      if (t.annotations) {
        if (t.annotations.bold) text = `<strong>${text}</strong>`;
        if (t.annotations.italic) text = `<em>${text}</em>`;
        if (t.annotations.code) text = `<code>${text}</code>`;
      }
      if (t.text?.link) {
        text = `<a href="${t.text.link.url}" target="_blank" rel="noopener">${text}</a>`;
      }
      return text;
    }).join('');
  }
  
  if (contentProp.type === 'text') {
    return contentProp.text || '';
  }
  
  return contentProp || '';
}

function extractImage(props) {
  const imageProp = props.Image || props.image;
  if (!imageProp) return null;
  
  if (imageProp.type === 'files' && imageProp.files && imageProp.files.length > 0) {
    const file = imageProp.files[0];
    return file.file?.url || file.external?.url || null;
  }
  
  return imageProp || null;
}

function extractAttributeName(props) {
  const attrProp = props['Attribute Name'] || props.attributeName;
  if (attrProp?.type === 'rich_text' && attrProp.rich_text) {
    return attrProp.rich_text.map(t => t.plain_text || '').join('');
  }
  return attrProp || '';
}

function extractOrder(props) {
  const orderProp = props.Order || props.order;
  if (orderProp?.type === 'number') {
    return orderProp.number || 0;
  }
  return orderProp || 0;
}

function extractActive(props) {
  const activeProp = props.Active || props.active;
  if (activeProp?.type === 'checkbox') {
    return activeProp.checkbox === true || activeProp.checkbox === '__YES__';
  }
  return activeProp === true || activeProp === '__YES__';
}

/**
 * Clear content cache
 */
function clearSiteContentCache() {
  contentCache = null;
  cacheTimestamp = 0;
}

// Export
window.SiteContentManager = {
  loadAndApplySiteContent,
  clearSiteContentCache,
  getCurrentPageName
};

// Export for external use
if (typeof window !== 'undefined') {
  window.NotionSiteContent = {
    initSiteContent,
    loadAndApplySiteContent,
    clearSiteContentCache
  };
}

