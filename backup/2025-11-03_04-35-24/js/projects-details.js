// ===== Projects Details Notion Integration =====
// Load SNS channels, Brand items, and Development apps from Notion

// Configuration
const NOTION_PROJECTS_DETAILS_CONFIG = {
  dataSourceId: 'cd2203c6-b691-42c4-8581-28a635c8edc4', // 📋 Projects詳細管理
  apiVersion: '2022-06-28'
};

document.addEventListener('DOMContentLoaded', function() {
  initProjectsDetails();
});

/**
 * Initialize projects details loading
 */
async function initProjectsDetails() {
  // Only on projects page
  if (!window.location.pathname.includes('projects.html')) return;

  // Load SNS channels
  await loadSNSChannels();
  
  // Load Brand items
  await loadBrandItems();
  
  // Load Development apps
  await loadDevelopmentApps();
}

/**
 * Load SNS channels from Notion
 */
async function loadSNSChannels() {
  try {
    const channels = await fetchProjectsDetails('SNSチャンネル');
    if (channels.length === 0) return;

    const container = document.querySelector('#sns-content .project-grid');
    if (!container) return;

    // Clear existing static content and render from Notion
    const existingCards = container.querySelectorAll('.project-card:not(.project-card-dynamic)');
    existingCards.forEach(card => card.remove());

    // Render channels
    channels.forEach(channel => {
      const card = createSNSChannelCard(channel);
      if (card) {
        card.classList.add('project-card-dynamic');
        container.appendChild(card);
      }
    });
  } catch (error) {
    console.error('Error loading SNS channels:', error);
  }
}

/**
 * Load Brand items from Notion
 */
async function loadBrandItems() {
  try {
    const items = await fetchProjectsDetails('Brand項目');
    if (items.length === 0) return;

    const container = document.querySelector('#brand-content .brand-showcase');
    if (!container) return;

    // Clear existing static content and render from Notion
    const existingItems = container.querySelectorAll('.brand-item:not(.brand-item-dynamic)');
    existingItems.forEach(item => item.remove());

    // Render brand items
    items.forEach(item => {
      const brandItem = createBrandItem(item);
      if (brandItem) {
        brandItem.classList.add('brand-item-dynamic');
        container.appendChild(brandItem);
      }
    });
  } catch (error) {
    console.error('Error loading Brand items:', error);
  }
}

/**
 * Load Development apps from Notion
 */
async function loadDevelopmentApps() {
  try {
    const apps = await fetchProjectsDetails('開発アプリ');
    if (apps.length === 0) return;

    const container = document.querySelector('#development-content .development-grid');
    if (!container) return;

    // Clear existing static content and render from Notion
    const existingCards = container.querySelectorAll('.dev-card:not(.dev-card-dynamic)');
    existingCards.forEach(card => card.remove());

    // Render development apps
    apps.forEach(app => {
      const card = createDevelopmentAppCard(app);
      if (card) {
        card.classList.add('dev-card-dynamic');
        container.appendChild(card);
      }
    });
  } catch (error) {
    console.error('Error loading Development apps:', error);
  }
}

/**
 * Fetch projects details from Notion
 * @param {string} category - Category filter
 * @returns {Promise<Array>} Array of items
 */
async function fetchProjectsDetails(category) {
  try {
    if (typeof window !== 'undefined' && window.NotionAPI) {
      const results = await window.NotionAPI.fetchNotionDatabase('projectsDetails', {
        query: '',
        filters: {
          Category: category,
          Published: true
        }
      });

      // Transform and sort
      return results
        .map(page => transformNotionPageToItem(page))
        .filter(item => item && item.published)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch (error) {
    console.error('Error fetching projects details:', error);
  }
  return [];
}

/**
 * Transform Notion page to item object
 * @param {Object} page - Notion page
 * @returns {Object} Item object
 */
function transformNotionPageToItem(page) {
  const props = page.properties || {};
  
  return {
    id: page.id,
    title: extractTitle(props),
    category: extractCategory(props),
    description: extractDescription(props),
    imageUrl: extractImageUrl(props),
    status: extractStatus(props),
    order: extractOrder(props),
    published: extractPublished(props)
  };
}

/**
 * Create SNS channel card
 * @param {Object} channel - Channel data
 * @returns {HTMLElement} Card element
 */
function createSNSChannelCard(channel) {
  const card = document.createElement('div');
  card.className = 'project-card';

  card.innerHTML = `
    <div class="card-image">
      ${channel.imageUrl ? 
        `<img src="${channel.imageUrl}" alt="${channel.title}" loading="lazy">` :
        `<div class="image-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>`
      }
    </div>
    <div class="card-content">
      <h3 class="card-title">${escapeHtml(channel.title)}</h3>
      <p class="card-description">${escapeHtml(channel.description || '')}</p>
    </div>
  `;

  return card;
}

/**
 * Create Brand item
 * @param {Object} item - Brand item data
 * @returns {HTMLElement} Brand item element
 */
function createBrandItem(item) {
  const brandItem = document.createElement('div');
  brandItem.className = 'brand-item';

  // Determine visual type based on title
  let visualHTML = '';
  if (item.title.includes('ロゴ')) {
    visualHTML = `<div class="logo-preview"><span class="logo-text">SYNTHERA</span></div>`;
  } else if (item.title.includes('カラー')) {
    visualHTML = `
      <div class="color-palette">
        <div class="color-item" style="background: #00d4ff;"></div>
        <div class="color-item" style="background: #ffd700;"></div>
        <div class="color-item" style="background: #1a1a1a;"></div>
      </div>
    `;
  } else if (item.title.includes('タイポ')) {
    visualHTML = `<div class="typography-sample"><span class="font-sample">ABCDEFGHIJKLMNOPQRSTUVWXYZ</span></div>`;
  } else if (item.imageUrl) {
    visualHTML = `<img src="${item.imageUrl}" alt="${item.title}" class="brand-image">`;
  } else {
    visualHTML = `<div class="brand-placeholder"><span>${escapeHtml(item.title)}</span></div>`;
  }

  brandItem.innerHTML = `
    <div class="brand-visual">${visualHTML}</div>
    <div class="brand-info">
      <h3 class="brand-title">${escapeHtml(item.title)}</h3>
      <p class="brand-description">${escapeHtml(item.description || '')}</p>
    </div>
  `;

  return brandItem;
}

/**
 * Create Development app card
 * @param {Object} app - App data
 * @returns {HTMLElement} Card element
 */
function createDevelopmentAppCard(app) {
  const card = document.createElement('div');
  card.className = 'dev-card';

  const statusBadge = app.status === '開発中' ? '<span class="status-badge">開発中</span>' : '';
  
  card.innerHTML = `
    <div class="dev-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H6.5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6.5V4h13v16z"/>
      </svg>
    </div>
    <h3 class="dev-title">${escapeHtml(app.title)}</h3>
    <p class="dev-description">${escapeHtml(app.description || '')}</p>
    ${statusBadge ? `<div class="dev-status">${statusBadge}</div>` : ''}
  `;

  return card;
}

// ===== Property Extractors =====

function extractTitle(props) {
  const titleProp = props.Title || props.title;
  if (!titleProp) return '';
  
  if (titleProp.type === 'title' && titleProp.title) {
    return titleProp.title.map(t => t.plain_text || '').join('');
  }
  
  return titleProp || '';
}

function extractCategory(props) {
  const catProp = props.Category || props.category;
  if (catProp?.type === 'select') {
    return catProp.select?.name || '';
  }
  return catProp || '';
}

function extractDescription(props) {
  const descProp = props.Description || props.description;
  if (!descProp) return '';
  
  if (descProp.type === 'rich_text' && descProp.rich_text) {
    return descProp.rich_text.map(t => t.plain_text || '').join('');
  }
  
  if (descProp.type === 'text') {
    return descProp.text || '';
  }
  
  return descProp || '';
}

function extractImageUrl(props) {
  const urlProp = props['Image URL'] || props.imageUrl;
  if (urlProp?.type === 'url') {
    return urlProp.url || '';
  }
  return urlProp || '';
}

function extractStatus(props) {
  const statusProp = props.Status || props.status;
  if (statusProp?.type === 'select') {
    return statusProp.select?.name || '';
  }
  return statusProp || '';
}

function extractOrder(props) {
  const orderProp = props.Order || props.order;
  if (orderProp?.type === 'number') {
    return orderProp.number || 0;
  }
  return orderProp || 0;
}

function extractPublished(props) {
  const pubProp = props.Published || props.published;
  if (pubProp?.type === 'checkbox') {
    return pubProp.checkbox === true || pubProp.checkbox === '__YES__';
  }
  return pubProp === true || pubProp === '__YES__';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export
window.loadSNSChannels = loadSNSChannels;
window.loadBrandItems = loadBrandItems;
window.loadDevelopmentApps = loadDevelopmentApps;

