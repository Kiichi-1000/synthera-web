// ===== Notion Content Renderer =====
// Notion Rich Textブロックとカード要素のレンダリング

/**
 * NotionブロックをHTMLに変換
 * @param {Array} blocks - Notionブロック配列
 * @returns {string} HTML文字列
 */
function renderNotionBlocks(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  return blocks.map(block => {
    if (!block || typeof block !== 'object') return '';
    
    const type = block.type;
    
    switch (type) {
      case 'paragraph':
        return renderParagraph(block);
      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
        return renderHeading(block, type);
      case 'bulleted_list_item':
        return renderBulletedListItem(block);
      case 'numbered_list_item':
        return renderNumberedListItem(block);
      case 'image':
        return renderImage(block);
      case 'code':
        return renderCode(block);
      case 'quote':
        return renderQuote(block);
      case 'divider':
        return '<hr class="notion-divider">';
      case 'toggle':
        return renderToggle(block);
      default:
        return '';
    }
  }).join('');
}

/**
 * Notion Rich TextをHTMLに変換
 * @param {Array} richText - Notion Rich Text配列
 * @returns {string} HTML文字列
 */
function renderNotionRichText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  
  return richText.map(item => {
    if (typeof item === 'string') return item;
    
    let text = item.plain_text || item.text?.content || '';
    const annotations = item.annotations || {};
    
    // Apply text formatting
    if (annotations.bold) text = `<strong>${text}</strong>`;
    if (annotations.italic) text = `<em>${text}</em>`;
    if (annotations.strikethrough) text = `<s>${text}</s>`;
    if (annotations.underline) text = `<u>${text}</u>`;
    if (annotations.code) text = `<code>${text}</code>`;
    
    // Handle links
    if (item.href || item.text?.link?.url) {
      const url = item.href || item.text?.link?.url;
      text = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    
    // Handle color
    if (annotations.color && annotations.color !== 'default') {
      text = `<span class="notion-color-${annotations.color}">${text}</span>`;
    }
    
    return text;
  }).join('');
}

// Block renderers
function renderParagraph(block) {
  const content = block.paragraph?.rich_text ? 
    renderNotionRichText(block.paragraph.rich_text) : '';
  return `<p>${content}</p>`;
}

function renderHeading(block, type) {
  const level = type === 'heading_1' ? 1 : type === 'heading_2' ? 2 : 3;
  const content = block[type]?.rich_text ? 
    renderNotionRichText(block[type].rich_text) : '';
  return `<h${level}>${content}</h${level}>`;
}

function renderBulletedListItem(block) {
  const content = block.bulleted_list_item?.rich_text ? 
    renderNotionRichText(block.bulleted_list_item.rich_text) : '';
  return `<li>${content}</li>`;
}

function renderNumberedListItem(block) {
  const content = block.numbered_list_item?.rich_text ? 
    renderNotionRichText(block.numbered_list_item.rich_text) : '';
  return `<li>${content}</li>`;
}

function renderImage(block) {
  const image = block.image;
  if (!image) return '';
  
  const url = image.file?.url || image.external?.url || '';
  const caption = image.caption ? renderNotionRichText(image.caption) : '';
  
  return `
    <figure class="notion-image">
      <img src="${url}" alt="${caption}" loading="lazy">
      ${caption ? `<figcaption>${caption}</figcaption>` : ''}
    </figure>
  `;
}

function renderCode(block) {
  const code = block.code;
  if (!code) return '';
  
  const codeText = code.rich_text.map(item => item.plain_text || '').join('');
  const language = code.language || '';
  
  return `<pre><code class="language-${language}">${escapeHtml(codeText)}</code></pre>`;
}

function renderQuote(block) {
  const content = block.quote?.rich_text ? 
    renderNotionRichText(block.quote.rich_text) : '';
  return `<blockquote class="notion-quote">${content}</blockquote>`;
}

function renderToggle(block) {
  const content = block.toggle?.rich_text ? 
    renderNotionRichText(block.toggle.rich_text) : '';
  const children = block.children ? renderNotionBlocks(block.children) : '';
  return `<details class="notion-toggle"><summary>${content}</summary>${children}</details>`;
}

/**
 * Notion画像を処理（ファイル添付対応）
 * @param {Object} imageBlock - Notion画像ブロック
 * @param {string} fallbackUrl - フォールバックURL
 * @returns {Promise<string>} HTML文字列
 */
async function processNotionImage(imageBlock, fallbackUrl = null) {
  if (!imageBlock) return '';
  
  let imageUrl = null;
  
  // Try file attachment first
  if (imageBlock.file?.url) {
    imageUrl = imageBlock.file.url;
  } else if (imageBlock.external?.url) {
    imageUrl = imageBlock.external.url;
  } else if (fallbackUrl) {
    imageUrl = fallbackUrl;
  }
  
  if (!imageUrl) return '';
  
  const caption = imageBlock.caption ? renderNotionRichText(imageBlock.caption) : '';
  
  return `
    <figure class="notion-image">
      <img src="${imageUrl}" alt="${caption}" loading="lazy">
      ${caption ? `<figcaption>${caption}</figcaption>` : ''}
    </figure>
  `;
}

/**
 * カード要素を作成
 * @param {Object} elementData - 要素データ
 * @param {string} templateType - テンプレートタイプ
 * @returns {HTMLElement} 作成された要素
 */
function createCardElement(elementData, templateType) {
  const {
    title = '',
    description = '',
    content = '',
    imageUrl = null,
    imageFile = null,
    status = '',
    order = 0,
    href = null
  } = elementData;
  
  const card = document.createElement('div');
  card.classList.add('notion-card', `notion-card-${templateType}`);
  if (order) card.style.order = order;
  
  switch (templateType) {
    case 'sns_card':
      card.innerHTML = createSNSCardHTML(title, description, imageUrl, imageFile, href);
      break;
    case 'brand_item':
      card.innerHTML = createBrandItemHTML(title, description, imageUrl, imageFile);
      break;
    case 'dev_card':
      card.innerHTML = createDevCardHTML(title, description, content, status);
      break;
    case 'channel_card':
      card.innerHTML = createChannelCardHTML(title, description, imageUrl, imageFile, href);
      break;
    case 'area_card':
      card.innerHTML = createAreaCardHTML(title, description, content);
      break;
    case 'article_card':
      card.innerHTML = createArticleCardHTML(title, description, imageUrl, imageFile, href);
      break;
    case 'ec_card':
      card.innerHTML = createECCardHTML(title, description, imageUrl, imageFile, href);
      break;
    default:
      card.innerHTML = createDefaultCardHTML(title, description, imageUrl, imageFile);
  }
  
  // Load image if file attachment
  if (imageFile && !imageUrl) {
    loadNotionImageFile(imageFile, card.querySelector('img')).catch(err => {
      console.warn('Failed to load image file:', err);
    });
  }
  
  return card;
}

// Card templates
function createSNSCardHTML(title, description, imageUrl, imageFile, href) {
  const imageHTML = imageUrl || imageFile ?
    `<div class="card-image">
      <img src="${imageUrl || ''}" alt="${title}" loading="lazy">
    </div>` :
    `<div class="card-image">
      <div class="image-placeholder">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
        </svg>
      </div>
    </div>`;
  
  const wrapperTag = href ? 'a' : 'div';
  const wrapperAttrs = href ? `href="${href}" class="project-card"` : 'class="project-card"';
  
  return `
    <${wrapperTag} ${wrapperAttrs}>
      ${imageHTML}
      <div class="card-content">
        <h3 class="card-title">${escapeHtml(title)}</h3>
        <p class="card-description">${escapeHtml(description)}</p>
      </div>
    </${wrapperTag}>
  `;
}

function createBrandItemHTML(title, description, imageUrl, imageFile) {
  const imageHTML = imageUrl || imageFile ?
    `<img src="${imageUrl || ''}" alt="${title}" class="brand-image" loading="lazy">` :
    `<div class="logo-preview">
      <span class="logo-text">${escapeHtml(title)}</span>
    </div>`;
  
  return `
    <div class="brand-visual">
      ${imageHTML}
    </div>
    <div class="brand-info">
      <h3 class="brand-title">${escapeHtml(title)}</h3>
      <p class="brand-description">${escapeHtml(description)}</p>
    </div>
  `;
}

function createDevCardHTML(title, description, content, status) {
  const statusBadge = status === '開発中' ? `<span class="status-badge">開発中</span>` : '';
  
  return `
    <div class="dev-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H6.5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6.5V4h13v16z"/>
      </svg>
    </div>
    <h3 class="dev-title">${escapeHtml(title)}</h3>
    <p class="dev-description">${escapeHtml(description || content)}</p>
    ${statusBadge ? `<div class="dev-status">${statusBadge}</div>` : ''}
  `;
}

function createChannelCardHTML(title, description, imageUrl, imageFile, href) {
  const wrapperTag = href ? 'a' : 'div';
  const wrapperAttrs = href ? `href="${href}" class="channel-card"` : 'class="channel-card"';
  
  return `
    <${wrapperTag} ${wrapperAttrs}>
      <div class="channel-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h3 class="channel-title">${escapeHtml(title)}</h3>
      <p class="channel-description">${escapeHtml(description)}</p>
    </${wrapperTag}>
  `;
}

function createAreaCardHTML(title, description, content) {
  return `
    <div class="card-background">
      <div class="card-gradient"></div>
    </div>
    <div class="card-content">
      <div class="card-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <h3 class="card-title">${escapeHtml(title)}</h3>
      <p class="card-description">${escapeHtml(description)}</p>
      <div class="card-hover-content">
        <p>${escapeHtml(content || description)}</p>
      </div>
    </div>
  `;
}

function createArticleCardHTML(title, description, imageUrl, imageFile, href) {
  const imageHTML = imageUrl || imageFile ?
    `<div class="article-image">
      <img src="${imageUrl || ''}" alt="${title}" loading="lazy">
    </div>` : '';
  
  const wrapperTag = href ? 'a' : 'div';
  const wrapperAttrs = href ? `href="${href}" class="article-card"` : 'class="article-card"';
  
  return `
    <${wrapperTag} ${wrapperAttrs}>
      ${imageHTML}
      <div class="article-content">
        <h3 class="article-title">${escapeHtml(title)}</h3>
        <p class="article-description">${escapeHtml(description)}</p>
      </div>
    </${wrapperTag}>
  `;
}

function createECCardHTML(title, description, imageUrl, imageFile, href) {
  return createSNSCardHTML(title, description, imageUrl, imageFile, href);
}

function createDefaultCardHTML(title, description, imageUrl, imageFile) {
  return `
    <div class="card-image">
      ${imageUrl || imageFile ? 
        `<img src="${imageUrl || ''}" alt="${title}" loading="lazy">` :
        `<div class="image-placeholder"></div>`
      }
    </div>
    <div class="card-content">
      <h3 class="card-title">${escapeHtml(title)}</h3>
      <p class="card-description">${escapeHtml(description)}</p>
    </div>
  `;
}

/**
 * Notionファイルから画像URLを取得してロード
 * @param {string|Object} imageFile - NotionファイルIDまたはオブジェクト
 * @param {HTMLElement} imgElement - 画像要素
 * @returns {Promise<void>}
 */
async function loadNotionImageFile(imageFile, imgElement) {
  if (!imageFile || !imgElement) return;
  
  try {
    // Notion API経由でファイルURLを取得
    const fileId = typeof imageFile === 'string' ? imageFile : imageFile.id;
    const fileUrl = await getNotionFileUrl(fileId);
    
    if (fileUrl) {
      imgElement.src = fileUrl;
      imgElement.style.display = '';
    }
  } catch (error) {
    console.error('Error loading Notion image file:', error);
  }
}

/**
 * NotionファイルURLを取得（プレースホルダー）
 * @param {string} fileId - ファイルID
 * @returns {Promise<string|null>} ファイルURL
 */
async function getNotionFileUrl(fileId) {
  // TODO: Implement via Notion API
  // For now, return null (fallback to Image URL)
  return null;
}

/**
 * HTMLエスケープ
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープされたテキスト
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export
if (typeof window !== 'undefined') {
  window.NotionContentRenderer = {
    renderNotionBlocks,
    renderNotionRichText,
    processNotionImage,
    createCardElement,
    loadNotionImageFile,
    getNotionFileUrl
  };
}

