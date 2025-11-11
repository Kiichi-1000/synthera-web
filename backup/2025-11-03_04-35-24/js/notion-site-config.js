// ===== Notion Site Configuration =====
// グリッドセクションの明示的設定管理

/**
 * グリッドセクション設定（明示的リスト）
 * これらのセクションIDは、セクション内にグリッドコンテナが存在するため、
 * 「セクション要素管理」データベースから要素を追加/削除可能
 */
const GRID_SECTIONS_CONFIG = {
  // projects.html
  'sns-content': {
    containerSelector: '.project-grid',
    elementType: 'card',
    template: 'sns_card'
  },
  'brand-content': {
    containerSelector: '.brand-showcase',
    elementType: 'brand_item',
    template: 'brand_item'
  },
  'development-content': {
    containerSelector: '.development-grid',
    elementType: 'dev_card',
    template: 'dev_card'
  },
  'writing-content': {
    containerSelector: '.writing-grid',
    elementType: 'article_card',
    template: 'article_card'
  },
  'ec-content': {
    containerSelector: '.project-grid',
    elementType: 'card',
    template: 'ec_card'
  },
  
  // index.html
  'channels-showcase': {
    containerSelector: '.channels-grid',
    elementType: 'channel_card',
    template: 'channel_card'
  },
  'business-areas': {
    containerSelector: '.areas-grid',
    elementType: 'area_card',
    template: 'area_card'
  }
};

/**
 * セクションがグリッドセクションかどうかを判定
 * @param {string} sectionId - セクションID
 * @returns {boolean} グリッドセクションの場合true
 */
function isGridSection(sectionId) {
  return sectionId in GRID_SECTIONS_CONFIG;
}

/**
 * グリッドセクションの設定を取得
 * @param {string} sectionId - セクションID
 * @returns {Object|null} 設定オブジェクト（存在しない場合null）
 */
function getGridSectionConfig(sectionId) {
  return GRID_SECTIONS_CONFIG[sectionId] || null;
}

/**
 * すべてのグリッドセクションIDを取得
 * @returns {Array<string>} グリッドセクションIDの配列
 */
function getAllGridSectionIds() {
  return Object.keys(GRID_SECTIONS_CONFIG);
}

// Export
if (typeof window !== 'undefined') {
  window.NotionSiteConfig = {
    GRID_SECTIONS_CONFIG,
    isGridSection,
    getGridSectionConfig,
    getAllGridSectionIds
  };
}

