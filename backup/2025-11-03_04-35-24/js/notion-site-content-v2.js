// ===== Notion Site Content V2 =====
// 固定セクションとグリッドセクションの統合管理システム

document.addEventListener('DOMContentLoaded', function() {
  initSiteContentV2();
});

/**
 * サイトコンテンツV2を初期化
 */
async function initSiteContentV2() {
  const currentPage = getCurrentPageName();
  if (!currentPage) {
    console.warn('Could not determine current page');
    return;
  }

  // 固定セクション（グリッドなし）の編集
  await loadFixedElements(currentPage);
  
  // グリッドセクション（要素追加可能）の読み込み
  await loadGridElements(currentPage);
}

/**
 * 現在のページ名を取得
 * @returns {string} ページ名
 */
function getCurrentPageName() {
  const path = window.location.pathname;
  const fileName = path.split('/').pop() || 'index.html';
  const pageName = fileName.replace('.html', '');
  
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
 * 固定セクションの要素を読み込み（編集のみ）
 * @param {string} pageName - ページ名
 */
async function loadFixedElements(pageName) {
  try {
    if (!window.NotionAPI) {
      console.warn('NotionAPI not available');
      return;
    }

    // サイトコンテンツ管理から固定要素を取得
    const results = await window.NotionAPI.fetchNotionDatabase('siteContent', {
      query: '',
      filters: {
        Page: pageName
      }
    });

    if (!results || results.length === 0) return;

    // 変換とフィルタリング
    const contentItems = results
      .map(page => transformNotionPageToContentItem(page))
      .filter(item => item && item.active);

    // ソート
    contentItems.sort((a, b) => (a.order || 0) - (b.order || 0));

    // 各アイテムを適用
    contentItems.forEach(item => {
      // グリッドセクションの場合はスキップ（loadGridElementsで処理）
      if (window.NotionSiteConfig && window.NotionSiteConfig.isGridSection(item.sectionId)) {
        return;
      }
      
      applyFixedElement(item);
    });

    console.log(`Applied ${contentItems.length} fixed elements for ${pageName}`);
  } catch (error) {
    console.error('Error loading fixed elements:', error);
  }
}

/**
 * グリッドセクションの要素を読み込み（要素追加/削除）
 * @param {string} pageName - ページ名
 */
async function loadGridElements(pageName) {
  try {
    if (!window.NotionAPI || !window.NotionSiteConfig || !window.NotionContentRenderer) {
      console.warn('Required APIs not available');
      return;
    }

    // セクション要素管理からグリッド要素を取得
    const results = await window.NotionAPI.fetchNotionDatabase('sectionElements', {
      query: '',
      filters: {
        Page: pageName,
        Published: true
      }
    });

    if (!results || results.length === 0) return;

    // セクションIDごとにグループ化
    const sectionGroups = {};
    
    results.forEach(page => {
      const item = transformNotionPageToGridElement(page);
      if (!item || !item.published) return;
      
      const sectionId = item.sectionId;
      if (!sectionId) return;
      
      // グリッドセクションかどうかチェック
      if (!window.NotionSiteConfig.isGridSection(sectionId)) {
        console.warn(`Section ${sectionId} is not a grid section, skipping`);
        return;
      }
      
      if (!sectionGroups[sectionId]) {
        sectionGroups[sectionId] = [];
      }
      sectionGroups[sectionId].push(item);
    });

    // 各セクションをレンダリング
    Object.keys(sectionGroups).forEach(sectionId => {
      const elements = sectionGroups[sectionId];
      elements.sort((a, b) => (a.order || 0) - (b.order || 0));
      renderGridSection(sectionId, elements);
    });

    console.log(`Rendered grid sections: ${Object.keys(sectionGroups).join(', ')}`);
  } catch (error) {
    console.error('Error loading grid elements:', error);
  }
}

/**
 * 固定要素を適用（既存HTML要素の内容を置換）
 * @param {Object} item - コンテンツアイテム
 */
function applyFixedElement(item) {
  const { elementSelector, contentType, content, imageFile, imageUrl, attributeName } = item;
  
  if (!elementSelector) {
    console.warn('Missing element selector:', item);
    return;
  }

  const element = document.querySelector(elementSelector);
  if (!element) {
    console.warn(`Element not found: ${elementSelector}`);
    return;
  }

  switch (contentType) {
    case 'text':
      element.textContent = content || '';
      break;
    case 'html':
      element.innerHTML = content || '';
      break;
    case 'image':
      applyImageContent(element, imageFile, imageUrl);
      break;
    case 'attribute':
      if (attributeName && content) {
        element.setAttribute(attributeName, content);
      }
      break;
    default:
      element.textContent = content || '';
  }
}

/**
 * グリッドセクションをレンダリング
 * @param {string} sectionId - セクションID
 * @param {Array} elements - 要素配列
 */
function renderGridSection(sectionId, elements) {
  const config = window.NotionSiteConfig.getGridSectionConfig(sectionId);
  if (!config) {
    console.warn(`No config found for section: ${sectionId}`);
    return;
  }

  const section = document.getElementById(sectionId);
  if (!section) {
    console.warn(`Section not found: #${sectionId}`);
    return;
  }

  const container = section.querySelector(config.containerSelector);
  if (!container) {
    console.warn(`Container not found: ${config.containerSelector} in #${sectionId}`);
    return;
  }

  // 既存の静的要素を削除（動的要素は保持）
  const existingStaticElements = container.querySelectorAll(
    `.project-card:not(.notion-card), .brand-item:not(.notion-card), .dev-card:not(.notion-card), .channel-card:not(.notion-card), .area-card:not(.notion-card), .article-card:not(.notion-card)`
  );
  existingStaticElements.forEach(el => el.remove());

  // 各要素をレンダリング
  elements.forEach(elementData => {
    const card = window.NotionContentRenderer.createCardElement(elementData, config.template);
    if (card) {
      container.appendChild(card);
    }
  });

  console.log(`Rendered ${elements.length} elements in section: ${sectionId}`);
}

/**
 * Notionページをコンテンツアイテムに変換（固定要素用）
 * @param {Object} notionPage - Notionページ
 * @returns {Object} コンテンツアイテム
 */
function transformNotionPageToContentItem(notionPage) {
  if (!notionPage) return null;

  const props = notionPage.properties || {};
  
  return {
    id: notionPage.id,
    title: extractTitle(props),
    page: extractPage(props),
    sectionId: extractSectionId(props),
    elementSelector: extractElementSelector(props),
    contentType: extractContentType(props),
    content: extractContent(props),
    imageFile: extractImageFile(props),
    imageUrl: extractImageUrl(props),
    attributeName: extractAttributeName(props),
    order: extractOrder(props),
    active: extractActive(props)
  };
}

/**
 * Notionページをグリッド要素に変換
 * @param {Object} notionPage - Notionページ
 * @returns {Object} グリッド要素
 */
function transformNotionPageToGridElement(notionPage) {
  if (!notionPage) return null;

  const props = notionPage.properties || {};
  
  return {
    id: notionPage.id,
    title: extractTitle(props),
    page: extractPage(props),
    sectionId: extractSectionId(props),
    elementType: extractElementType(props),
    content: extractContent(props),
    description: extractDescription(props),
    imageFile: extractImageFile(props),
    imageUrl: extractImageUrl(props),
    containerSelector: extractContainerSelector(props),
    order: extractOrder(props),
    status: extractStatus(props),
    published: extractPublished(props),
    href: extractHref(props)
  };
}

// プロパティ抽出関数
function extractTitle(props) {
  const titleProp = props.Title;
  return titleProp?.type === 'title' ? titleProp.title.map(t => t.plain_text).join('') : '';
}

function extractPage(props) {
  const pageProp = props.Page;
  return pageProp?.type === 'select' ? pageProp.select?.name : '';
}

function extractSectionId(props) {
  const sectionProp = props['Section ID'];
  return sectionProp?.type === 'rich_text' ? sectionProp.rich_text.map(t => t.plain_text).join('') : '';
}

function extractElementSelector(props) {
  const selectorProp = props['Element Selector'];
  return selectorProp?.type === 'rich_text' ? selectorProp.rich_text.map(t => t.plain_text).join('') : '';
}

function extractContentType(props) {
  const typeProp = props['Content Type'];
  return typeProp?.type === 'select' ? typeProp.select?.name : 'text';
}

function extractContent(props) {
  const contentProp = props.Content;
  return contentProp?.type === 'rich_text' ? contentProp.rich_text.map(t => t.plain_text).join('') : '';
}

function extractDescription(props) {
  const descProp = props.Description;
  return descProp?.type === 'rich_text' ? descProp.rich_text.map(t => t.plain_text).join('') : '';
}

function extractImageFile(props) {
  const fileProp = props['Image File'] || props.Image;
  if (fileProp?.type === 'files' && fileProp.files && fileProp.files.length > 0) {
    return fileProp.files[0];
  }
  return null;
}

function extractImageUrl(props) {
  const urlProp = props['Image URL'];
  return urlProp?.type === 'url' ? urlProp.url : null;
}

function extractAttributeName(props) {
  const attrProp = props['Attribute Name'];
  return attrProp?.type === 'rich_text' ? attrProp.rich_text.map(t => t.plain_text).join('') : '';
}

function extractOrder(props) {
  const orderProp = props.Order;
  return orderProp?.type === 'number' ? orderProp.number : 0;
}

function extractActive(props) {
  const activeProp = props.Active;
  return activeProp?.type === 'checkbox' ? activeProp.checkbox : false;
}

function extractElementType(props) {
  const typeProp = props['Element Type'];
  return typeProp?.type === 'select' ? typeProp.select?.name : 'card';
}

function extractContainerSelector(props) {
  const selectorProp = props['Container Selector'];
  return selectorProp?.type === 'rich_text' ? selectorProp.rich_text.map(t => t.plain_text).join('') : '';
}

function extractStatus(props) {
  const statusProp = props.Status;
  return statusProp?.type === 'select' ? statusProp.select?.name : '';
}

function extractPublished(props) {
  const publishedProp = props.Published;
  return publishedProp?.type === 'checkbox' ? publishedProp.checkbox : false;
}

function extractHref(props) {
  const hrefProp = props.Href || props.Link;
  return hrefProp?.type === 'url' ? hrefProp.url : null;
}

/**
 * 画像コンテンツを適用
 * @param {HTMLElement} element - 要素
 * @param {Object} imageFile - 画像ファイル
 * @param {string} imageUrl - 画像URL
 */
function applyImageContent(element, imageFile, imageUrl) {
  if (!element) return;

  // img要素の場合
  if (element.tagName === 'IMG') {
    if (imageUrl) {
      element.src = imageUrl;
    } else if (imageFile) {
      // NotionファイルURLを取得して設定
      loadNotionImageFile(imageFile, element);
    }
    return;
  }

  // コンテナ要素の場合
  if (imageUrl) {
    element.innerHTML = `<img src="${imageUrl}" alt="" loading="lazy">`;
  } else if (imageFile) {
    element.innerHTML = '<img src="" alt="" loading="lazy">';
    loadNotionImageFile(imageFile, element.querySelector('img'));
  }
}

/**
 * Notionファイルから画像をロード
 * @param {Object} imageFile - 画像ファイル
 * @param {HTMLElement} imgElement - img要素
 */
async function loadNotionImageFile(imageFile, imgElement) {
  if (!imageFile || !imgElement) return;

  try {
    // NotionファイルURLを取得
    const fileId = imageFile.id || imageFile;
    const fileUrl = await getNotionFileUrl(fileId);
    
    if (fileUrl) {
      imgElement.src = fileUrl;
    } else {
      // フォールバック: ファイル名から推測
      if (imageFile.name) {
        console.warn('Could not get file URL, using fallback');
      }
    }
  } catch (error) {
    console.error('Error loading Notion image file:', error);
  }
}

/**
 * NotionファイルURLを取得
 * @param {string} fileId - ファイルID
 * @returns {Promise<string|null>} ファイルURL
 */
async function getNotionFileUrl(fileId) {
  // TODO: Notion API経由でファイルURLを取得
  // 現在はプレースホルダー
  return null;
}

// Export
if (typeof window !== 'undefined') {
  window.NotionSiteContentV2 = {
    initSiteContentV2,
    loadFixedElements,
    loadGridElements,
    renderGridSection
  };
}

