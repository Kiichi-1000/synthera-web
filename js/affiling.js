// ===== Affiling - Simple JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
  initAffiling();
});

// Handle browser back/forward button (restore from cache)
window.addEventListener('pageshow', function(event) {
  // If page was restored from cache, reinitialize
  if (event.persisted) {
    initAffiling();
  }
});

// Global state
let currentFilter = 'all';
let currentSearchQuery = '';
let currentPage = 1;
let isLoading = false;
let hasMorePages = true;
let articles = [];
const DEFAULT_OG_IMAGE = 'https://synthera.jp/assets/og/affiling-default.jpg';
const CATEGORY_NAME_MAP = {
  comparison: '商品比較',
  ranking: 'ランキング',
  review: 'レビュー',
  guide: 'ガイド'
};

// Initialize
function initAffiling() {
  if (!document.querySelector('.affiling-main')) return;
  
  initFilters();
  initSearch();
  loadArticles();
  loadSidebarContent();
  
  // Handle category hash in URL
  handleCategoryHash();
}

function handleCategoryHash() {
  const hash = window.location.hash.replace('#', '');
  if (hash && ['comparison', 'ranking', 'review', 'guide'].includes(hash)) {
    setFilter(hash);
  }
}

// Filter Functions
function initFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      setFilter(filter);
    });
  });
}

function setFilter(filter) {
  if (currentFilter === filter) return;
  
  currentFilter = filter;
  currentPage = 1;
  hasMorePages = true;
  
  // Update active tab
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.filter === filter) {
      tab.classList.add('active');
    }
  });
  
  // Update sidebar active state
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
    const category = link.dataset.category;
    if (category === filter || (filter === 'all' && !category) || (filter === 'all' && category === 'all')) {
      link.classList.add('active');
    }
  });
  
  // Update URL hash
  if (filter === 'all') {
    history.pushState(null, '', window.location.pathname);
  } else {
    history.pushState(null, '', `${window.location.pathname}#${filter}`);
  }
  
  // Reload articles
  loadArticles();
}

// Search Functions
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      currentSearchQuery = e.target.value.toLowerCase();
      currentPage = 1;
      hasMorePages = true;
      loadArticles();
    }, 300));
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        currentSearchQuery = e.target.value.toLowerCase();
        currentPage = 1;
        hasMorePages = true;
        loadArticles();
      }
    });
  }
  
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const input = document.getElementById('search-input');
      if (input) {
        currentSearchQuery = input.value.toLowerCase();
        currentPage = 1;
        hasMorePages = true;
        loadArticles();
      }
    });
  }
}

// Article Loading
let loadedArticleDatabase = {};

async function loadArticles() {
  if (isLoading) return;
  
  isLoading = true;
  showLoadingState();
  
  try {
    // Load articles from JSON file
    const response = await fetch('data/affiling_articles.json');
    if (response.ok) {
      const articlesList = await response.json();
      
      // Convert array to object for compatibility with existing code
      loadedArticleDatabase = {};
      if (Array.isArray(articlesList)) {
        articlesList.forEach((article, index) => {
          // Convert date string to Date object
          if (article.date) {
            article.date = new Date(article.date);
          }
          // Use article.id as key, fallback to array index
          const key = article.id || index.toString();
          loadedArticleDatabase[key] = article;
        });
      }
      
      console.log(`[Affiling] ${Object.keys(loadedArticleDatabase).length}件の記事を読み込みました`);
      
      // Merge with static database (for backward compatibility)
      const mergedDatabase = { ...articleDatabase, ...loadedArticleDatabase };
      
      // Load articles from merged database
      loadArticlesFromDatabase(mergedDatabase);
    } else {
      console.warn('[Affiling] JSONファイルの読み込みに失敗しました。ステータス:', response.status);
      // Fallback to static database if JSON doesn't exist
      loadArticlesFromDatabase(articleDatabase);
    }
  } catch (error) {
    console.error('[Affiling] 記事の読み込み中にエラーが発生しました:', error);
    // Fallback to static database
    loadArticlesFromDatabase(articleDatabase);
  } finally {
    isLoading = false;
    hideLoadingState();
  }
}

function loadArticlesFromDatabase(database) {
  // Initialize tag system
  initTagSystem();
  
  // Get all articles from database
  const allArticles = Object.values(database).filter(article => {
    // 必須フィールドがあることを確認
    return article && article.id && article.title;
  });
  
  console.log(`[Affiling] データベースから ${allArticles.length}件の記事を取得しました`);
  
  // Sort by date (newest first)
  allArticles.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date || 0);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date || 0);
    return dateB - dateA;
  });
  
  if (currentPage === 1) {
    articles = allArticles;
  } else {
    articles = [...articles, ...allArticles];
  }
  
  console.log(`[Affiling] ${articles.length}件の記事を表示します`);
  renderArticles(articles);
  hasMorePages = false;
  
  // Update sidebar content
  loadSidebarContentFromDatabase(database);
}

function loadSampleArticles() {
  loadArticlesFromDatabase(articleDatabase);
  loadSidebarContentFromDatabase(articleDatabase);
}

// Article data with full content
// Static articles are removed - articles are loaded from Notion via JSON
const articleDatabase = {};
function loadSampleArticles() {
  // Initialize tag system
  initTagSystem();
  
  // Get all articles from database
  const allArticles = Object.values(articleDatabase);
  
  // Sort by date (newest first)
  allArticles.sort((a, b) => b.date - a.date);
  
  if (currentPage === 1) {
    articles = allArticles;
  } else {
    articles = [...articles, ...allArticles];
  }
  
  renderArticles(articles);
  hasMorePages = false;
}

function renderArticles(articlesToRender) {
  const articlesGrid = document.getElementById('articles-grid');
  if (!articlesGrid) {
    console.error('[Affiling] articles-grid要素が見つかりません');
    return;
  }
  
  console.log(`[Affiling] ${articlesToRender.length}件の記事をレンダリングします`);
  
  // Clear existing articles if it's the first page
  if (currentPage === 1) {
    articlesGrid.innerHTML = '';
  }
  
  // Filter articles
  let filteredArticles = articlesToRender;
  
  if (currentFilter !== 'all') {
    filteredArticles = articlesToRender.filter(article => article.category === currentFilter);
    console.log(`[Affiling] フィルタ後: ${filteredArticles.length}件（フィルタ: ${currentFilter}）`);
  }
  
  if (currentSearchQuery) {
    filteredArticles = filteredArticles.filter(article => {
      const titleMatch = article.title && article.title.toLowerCase().includes(currentSearchQuery);
      const excerptMatch = article.excerpt && article.excerpt.toLowerCase().includes(currentSearchQuery);
      const tagsMatch = article.tags && article.tags.some(tag => 
        tag && tag.toLowerCase().includes(currentSearchQuery)
      );
      return titleMatch || excerptMatch || tagsMatch;
    });
    console.log(`[Affiling] 検索後: ${filteredArticles.length}件（検索: ${currentSearchQuery}）`);
  }
  
  // Render articles
  if (filteredArticles.length === 0) {
    console.warn('[Affiling] 表示する記事がありません');
  } else {
    console.log(`[Affiling] ${filteredArticles.length}件の記事を表示します`);
  }
  
  filteredArticles.forEach((article, index) => {
    try {
      const articleElement = createArticleElement(article);
      articlesGrid.appendChild(articleElement);
      console.log(`[Affiling] 記事 ${index + 1}/${filteredArticles.length} を追加: ${article.title}`);
    } catch (error) {
      console.error(`[Affiling] 記事のレンダリングに失敗しました (${article.title}):`, error);
    }
  });
  
  // Show/hide no results message
  const noResults = document.getElementById('no-results');
  if (filteredArticles.length === 0 && currentPage === 1) {
    if (noResults) noResults.style.display = 'block';
  } else {
    if (noResults) noResults.style.display = 'none';
  }
  
  // Update load more button
  updateLoadMoreButton();
}

function createArticleElement(article) {
  const articleCard = document.createElement('article');
  articleCard.className = 'article-card';
  articleCard.setAttribute('data-category', article.category);
  articleCard.setAttribute('data-article-id', article.id);

  const formattedDate = formatDate(article.date);
  const tags = getArticleTags(article);
  const tagsHTML = tags.slice(0, 3).map(tag => 
    `<span class="article-tag">${tag}</span>`
  ).join('');
  
  articleCard.innerHTML = `
    <div class="article-image">
      ${article.image ? 
        `<img src="${article.image}" alt="${article.title}" loading="lazy">` :
        `<div class="article-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        </div>`
      }
    </div>
    <div class="article-content">
      <div class="article-meta">
        <span class="article-category">${getCategoryLabel(article.category)}</span>
        <span class="article-date">${formattedDate}</span>
      </div>
      <h3 class="article-title">${article.title || 'タイトルなし'}</h3>
      <p class="article-excerpt">${article.excerpt || ''}</p>
      ${tagsHTML ? `<div class="article-tags">${tagsHTML}</div>` : ''}
      <div class="article-stats">
        <span class="article-stat">読了時間: ${article.readTime}分</span>
        ${article.productCount ? `<span class="article-stat">商品数: ${article.productCount}</span>` : ''}
        <span class="affiliate-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          アフィリエイト
        </span>
      </div>
    </div>
  `;
  
  // Add click event
  articleCard.addEventListener('click', () => {
    window.location.href = `affiling-article.html?id=${article.id}`;
  });
  
  // Add tag click handlers
  const tagElements = articleCard.querySelectorAll('.article-tag');
  tagElements.forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const tagText = tag.textContent.trim();
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.value = tagText;
        currentSearchQuery = tagText.toLowerCase();
        currentPage = 1;
        hasMorePages = true;
        loadArticles();
      }
    });
  });
  
  return articleCard;
}

function formatDate(date) {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
}

// Loading State
function showLoadingState() {
  const loadingState = document.getElementById('loading-state');
  const articlesGrid = document.getElementById('articles-grid');
  
  if (loadingState) loadingState.style.display = 'block';
  if (articlesGrid && currentPage === 1) articlesGrid.style.display = 'none';
}

function hideLoadingState() {
  const loadingState = document.getElementById('loading-state');
  const articlesGrid = document.getElementById('articles-grid');
  
  if (loadingState) loadingState.style.display = 'none';
  if (articlesGrid) articlesGrid.style.display = 'grid';
}

// Load More
function updateLoadMoreButton() {
  const loadMoreButton = document.getElementById('load-more-button');
  const loadMoreWrapper = document.querySelector('.load-more-wrapper');
  
  if (loadMoreButton && loadMoreWrapper) {
    if (hasMorePages) {
      loadMoreWrapper.style.display = 'block';
      loadMoreButton.style.display = 'block';
      loadMoreButton.disabled = false;
      
      // Remove existing listeners
      const newButton = loadMoreButton.cloneNode(true);
      loadMoreButton.parentNode.replaceChild(newButton, loadMoreButton);
      
      // Add new listener
      newButton.addEventListener('click', () => {
        currentPage++;
        loadArticles();
      });
    } else {
      loadMoreWrapper.style.display = 'none';
    }
  }
}

// Article Detail Page Functions
async function initArticleDetail() {
  if (!document.querySelector('.article-content')) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  
  if (!articleId) {
    showArticleError();
    return;
  }
  
  // Try to load from JSON first
  try {
    console.log('[Affiling] 記事を読み込み中... ID:', articleId);
    const response = await fetch('data/affiling_articles.json');
    if (response.ok) {
      const articlesList = await response.json();
      console.log('[Affiling] JSONファイルから', articlesList.length, '件の記事を読み込みました');
      const article = articlesList.find(a => a.id === articleId);
      
      if (article) {
        console.log('[Affiling] 記事が見つかりました:', {
          id: article.id,
          title: article.title,
          contentLength: article.content ? article.content.length : 0,
          hasContent: !!article.content
        });
        // Convert date string to Date object
        if (article.date) {
          article.date = new Date(article.date);
        }
        loadArticleDetail(article);
        return;
      } else {
        console.warn('[Affiling] 記事が見つかりませんでした。検索したID:', articleId);
        console.log('[Affiling] 利用可能な記事ID:', articlesList.map(a => a.id));
      }
    } else {
      console.error('[Affiling] JSONファイルの読み込みに失敗:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('[Affiling] 記事の読み込みエラー:', error);
  }
  
  // Fallback to static database
  if (articleDatabase[articleId]) {
    loadArticleDetail(articleDatabase[articleId]);
  } else {
    showArticleError();
  }
}

function loadArticleDetail(article) {
  // Update header
  const categoryEl = document.getElementById('article-category');
  const dateEl = document.getElementById('article-date');
  const titleEl = document.getElementById('article-title');
  const excerptEl = document.getElementById('article-excerpt');
  const readTimeEl = document.getElementById('article-read-time');
  const breadcrumbCategoryEl = document.getElementById('breadcrumb-category');
  const breadcrumbCategoryLink = document.getElementById('breadcrumb-category-link');
  const breadcrumbCurrentEl = document.getElementById('breadcrumb-current');
  
  const categoryLabel = getCategoryLabel(article.category);
  
  if (categoryEl) categoryEl.textContent = categoryLabel;
  if (dateEl) dateEl.textContent = formatDate(article.date);
  if (titleEl) titleEl.textContent = article.title;
  if (excerptEl) excerptEl.textContent = article.excerpt;
  if (readTimeEl) readTimeEl.textContent = `読了時間: ${article.readTime}分`;
  if (breadcrumbCategoryEl) breadcrumbCategoryEl.textContent = categoryLabel;
  if (breadcrumbCategoryLink) {
    const categoryHash = article.category ? `#${article.category}` : '';
    breadcrumbCategoryLink.href = `affiling.html${categoryHash}`;
  }
  if (breadcrumbCurrentEl) breadcrumbCurrentEl.textContent = article.title;
  updateArticleMetaTags(article);
  updateArticleStructuredData(article);
  setupShareButtons(article);
  
  // Update body
  const bodyEl = document.getElementById('article-body');
  if (bodyEl) {
    // Check if content exists and is not empty
    if (article.content && article.content.trim().length > 0) {
      bodyEl.innerHTML = article.content;
      // Generate TOC after content is loaded
      generateTOC();
      // Add anchor links to headings
      addHeadingAnchors();
      // Enhance comparison tables
      enhanceComparisonTables();
      // Enhance ratings in content
      enhanceRatingsInContent();
    } else {
      console.warn('[Affiling] 記事内容が空です:', {
        id: article.id,
        title: article.title,
        contentLength: article.content ? article.content.length : 0
      });
      bodyEl.innerHTML = '<p>記事の内容を読み込めませんでした。</p>';
    }
  }
  
  // Load related articles
  loadRelatedArticles(article);
  
  // Update page title
  document.title = `${article.title} | Affiling`;
}

function updateArticleMetaTags(article) {
  const pageUrl = window.location.href;
  const description = article.excerpt || truncateText(stripHTML(article.content || ''), 150);
  const imageUrl = article.image || DEFAULT_OG_IMAGE;
  
  setMetaContent('meta-og-title', `${article.title} | Affiling`);
  setMetaContent('meta-og-description', description);
  setMetaContent('meta-og-url', pageUrl);
  setMetaContent('meta-og-image', imageUrl);
  setMetaContent('meta-og-site-name', 'Affiling');
  setMetaContent('meta-og-type', 'article');
  
  setMetaContent('meta-twitter-title', `${article.title} | Affiling`);
  setMetaContent('meta-twitter-description', description);
  setMetaContent('meta-twitter-url', pageUrl);
  setMetaContent('meta-twitter-image', imageUrl);
  setMetaContent('meta-twitter-card', 'summary_large_image');
}

function updateArticleStructuredData(article) {
  const script = document.getElementById('article-json-ld');
  if (!script) return;
  
  const pageUrl = window.location.href;
  const origin = getSiteOrigin();
  const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  const homeUrl = `${normalizedOrigin}/`;
  const affilingUrl = `${normalizedOrigin}/affiling.html`;
  const categoryUrl = article.category ? `${affilingUrl}#${article.category}` : affilingUrl;
  const description = article.excerpt || truncateText(stripHTML(article.content || ''), 150);
  const imageUrl = article.image || DEFAULT_OG_IMAGE;
  const publishedDate = formatISODate(article.date);
  const categoryLabel = getCategoryLabel(article.category);
  
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${article.title} | Affiling`,
    "description": description,
    "image": imageUrl,
    "datePublished": publishedDate,
    "dateModified": publishedDate,
    "author": {
      "@type": "Organization",
      "name": "Synthera"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Synthera",
      "logo": {
        "@type": "ImageObject",
        "url": "https://synthera.jp/assets/icons/favicon.svg"
      }
    },
    "mainEntityOfPage": pageUrl
  };
  
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": homeUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryLabel,
        "item": categoryUrl
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": pageUrl
      }
    ]
  };
  
  script.textContent = JSON.stringify([articleData, breadcrumbData], null, 2);
}

function setMetaContent(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.setAttribute('content', value);
  }
}

function stripHTML(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function truncateText(text, length) {
  if (!text) return '';
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
}

function formatISODate(value) {
  if (!value) return new Date().toISOString();
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}

function getCategoryLabel(category) {
  if (!category) return '記事';
  return CATEGORY_NAME_MAP[category] || category;
}

function getSiteOrigin() {
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
    return window.location.origin;
  }
  return 'https://synthera.jp';
}

function setupShareButtons(article) {
  const shareContainer = document.getElementById('article-share');
  if (!shareContainer) return;
  
  const buttons = shareContainer.querySelectorAll('[data-share-target]');
  const encodedUrl = encodeURIComponent(window.location.href);
  const encodedText = encodeURIComponent(`${article.title} | Affiling`);
  const feedbackEl = document.getElementById('share-feedback');
  
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-share-target');
      handleShareAction(target, encodedUrl, encodedText, feedbackEl);
    });
  });
}

function handleShareAction(target, encodedUrl, encodedText, feedbackEl) {
  let shareUrl = '';
  
  switch (target) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      break;
    case 'line':
      shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
      break;
    case 'copy':
      copyShareLink(feedbackEl);
      return;
    default:
      return;
  }
  
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
}

function copyShareLink(feedbackEl) {
  const url = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => setShareFeedback(feedbackEl, 'リンクをコピーしました'))
      .catch(() => setShareFeedback(feedbackEl, 'コピーに失敗しました'));
  } else {
    const tempInput = document.createElement('input');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      setShareFeedback(feedbackEl, 'リンクをコピーしました');
    } catch (err) {
      setShareFeedback(feedbackEl, 'コピーに失敗しました');
    }
    document.body.removeChild(tempInput);
  }
}

function setShareFeedback(element, message) {
  if (!element) return;
  element.textContent = message;
  setTimeout(() => {
    element.textContent = '';
  }, 2500);
}

function showArticleError() {
  const bodyEl = document.getElementById('article-body');
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem;">
        <h2>記事が見つかりません</h2>
        <p>指定された記事は存在しないか、削除された可能性があります。</p>
        <a href="affiling.html" style="display: inline-block; margin-top: 1rem; color: var(--affiling-primary);">記事一覧に戻る</a>
      </div>
    `;
  }
}

// Initialize article detail page
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.article-content')) {
    initArticleDetail();
  }
});

// Handle browser back/forward button for article detail page
window.addEventListener('pageshow', function(event) {
  if (event.persisted && document.querySelector('.article-content')) {
    initArticleDetail();
  }
});

// TOC Generation
function generateTOC() {
  const tocContainer = document.getElementById('toc-container');
  const tocNav = document.getElementById('toc-nav');
  const articleBody = document.getElementById('article-body');
  
  if (!tocContainer || !tocNav || !articleBody) return;
  
  const headings = articleBody.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    tocContainer.style.display = 'none';
    return;
  }
  
  tocContainer.style.display = 'block';
  tocNav.innerHTML = '';
  
  headings.forEach((heading, index) => {
    // Create ID if not exists
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }
    
    const level = heading.tagName.toLowerCase();
    const tocItem = document.createElement('a');
    tocItem.href = `#${heading.id}`;
    tocItem.className = `toc-link toc-${level}`;
    tocItem.textContent = heading.textContent;
    tocItem.addEventListener('click', (e) => {
      e.preventDefault();
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL without scrolling
      history.pushState(null, '', `#${heading.id}`);
    });
    
    tocNav.appendChild(tocItem);
  });
  
  // Highlight active TOC item on scroll
  highlightActiveTOCItem();
}

function addHeadingAnchors() {
  const articleBody = document.getElementById('article-body');
  if (!articleBody) return;
  
  const headings = articleBody.querySelectorAll('h2, h3');
  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }
    
    // Add anchor link icon
    const anchor = document.createElement('a');
    anchor.href = `#${heading.id}`;
    anchor.className = 'heading-anchor';
    anchor.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>';
    anchor.title = 'この見出しへのリンク';
    heading.style.position = 'relative';
    heading.appendChild(anchor);
  });
}

function highlightActiveTOCItem() {
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll('#article-body h2, #article-body h3');
  
  if (tocLinks.length === 0 || headings.length === 0) return;
  
  const handleScroll = () => {
    let current = '';
    const scrollPosition = window.scrollY + 100;
    
    headings.forEach((heading) => {
      const headingTop = heading.getBoundingClientRect().top + window.scrollY;
      if (scrollPosition >= headingTop - 100) {
        current = heading.id;
      }
    });
    
    tocLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };
  
  window.addEventListener('scroll', debounce(handleScroll, 100));
  handleScroll(); // Initial call
}

// Related Articles
async function loadRelatedArticles(currentArticle) {
  const relatedContainer = document.getElementById('related-articles');
  const relatedGrid = document.getElementById('related-grid');
  
  if (!relatedContainer || !relatedGrid) return;
  
  let database = articleDatabase;
  
  // Try to load from JSON first
  try {
    const response = await fetch('data/affiling_articles.json');
    if (response.ok) {
      const articlesList = await response.json();
      // Convert array to object
      database = {};
      articlesList.forEach(article => {
        if (article.date) {
          article.date = new Date(article.date);
        }
        const key = article.id || articlesList.indexOf(article).toString();
        database[key] = article;
      });
      // Merge with static database
      database = { ...articleDatabase, ...database };
    }
  } catch (error) {
    console.error('Error loading related articles:', error);
  }
  
  // Get articles from same category, excluding current article
  const relatedArticles = Object.values(database)
    .filter(article => 
      article.id !== currentArticle.id && 
      article.category === currentArticle.category
    )
    .slice(0, 4);
  
  if (relatedArticles.length === 0) {
    relatedContainer.style.display = 'none';
    return;
  }
  
  relatedContainer.style.display = 'block';
  relatedGrid.innerHTML = '';
  
  relatedArticles.forEach(article => {
    const articleCard = createRelatedArticleElement(article);
    relatedGrid.appendChild(articleCard);
  });
}

function createRelatedArticleElement(article) {
  const articleCard = document.createElement('article');
  articleCard.className = 'related-article-card';
  
  const formattedDate = formatDate(article.date);
  
  articleCard.innerHTML = `
    <div class="related-article-image">
      ${article.image ? 
        `<img src="${article.image}" alt="${article.title}" loading="lazy">` :
        `<div class="article-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        </div>`
      }
    </div>
    <div class="related-article-content">
      <div class="related-article-meta">
        <span class="article-category">${getCategoryLabel(article.category)}</span>
        <span class="article-date">${formattedDate}</span>
      </div>
      <h3 class="related-article-title">${article.title}</h3>
      <p class="related-article-excerpt">${article.excerpt}</p>
    </div>
  `;
  
  articleCard.addEventListener('click', () => {
    window.location.href = `affiling-article.html?id=${article.id}`;
  });
  
  return articleCard;
}

// Comparison Table Enhancement
function enhanceComparisonTables() {
  const articleBody = document.getElementById('article-body');
  if (!articleBody) return;
  
  // Find tables that might be comparison tables
  const tables = articleBody.querySelectorAll('table');
  
  tables.forEach(table => {
    // Check if it looks like a comparison table (has multiple columns)
    const rows = table.querySelectorAll('tr');
    if (rows.length > 0) {
      const firstRowCells = rows[0].querySelectorAll('th, td');
      if (firstRowCells.length >= 3) {
        table.classList.add('comparison-table-enhanced');
        enhanceComparisonTable(table);
      }
    }
  });
}

function enhanceComparisonTable(table) {
  // Make table responsive
  const wrapper = document.createElement('div');
  wrapper.className = 'comparison-table-wrapper';
  table.parentNode.insertBefore(wrapper, table);
  wrapper.appendChild(table);
  
  // Add sticky header if supported
  const thead = table.querySelector('thead');
  if (thead) {
    thead.classList.add('comparison-table-header');
  }
  
  // Enhance cells with rating displays
  const cells = table.querySelectorAll('td');
  cells.forEach(cell => {
    const text = cell.textContent.trim();
    
    // Check for star ratings (★★★★☆)
    if (text.match(/[★☆]{3,}/)) {
      cell.innerHTML = renderStarRating(text);
    }
    
    // Check for price patterns
    if (text.match(/約?\s*\d+[万円]/)) {
      cell.classList.add('price-cell');
    }
  });
}

function renderStarRating(text) {
  const stars = (text.match(/★/g) || []).length;
  const halfStar = text.includes('☆') && !text.endsWith('☆');
  const maxStars = 5;
  
  let html = '<div class="star-rating">';
  for (let i = 0; i < maxStars; i++) {
    if (i < stars) {
      html += '<svg class="star star-filled" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    } else if (halfStar && i === stars) {
      html += '<svg class="star star-half" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" opacity="0.5"/></svg>';
    } else {
      html += '<svg class="star star-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke-width="1"/></svg>';
    }
  }
  html += '</div>';
  return html;
}

// Rating System
function renderRatingDisplay(rating, maxRating = 5) {
  if (typeof rating === 'string') {
    // Parse text like "★★★★☆" or "4.5"
    const stars = (rating.match(/★/g) || []).length;
    const halfStar = rating.includes('☆') && rating !== '★★★★☆';
    return renderStarRating(rating);
  }
  
  const numRating = parseFloat(rating);
  if (isNaN(numRating)) return '';
  
  const fullStars = Math.floor(numRating);
  const hasHalfStar = numRating % 1 >= 0.5;
  
  let html = `<div class="star-rating" data-rating="${numRating}">`;
  for (let i = 0; i < maxRating; i++) {
    if (i < fullStars) {
      html += '<svg class="star star-filled" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    } else if (hasHalfStar && i === fullStars) {
      html += '<svg class="star star-half" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" opacity="0.5"/></svg>';
    } else {
      html += '<svg class="star star-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke-width="1"/></svg>';
    }
  }
  html += `<span class="rating-value">${numRating.toFixed(1)}</span>`;
  html += '</div>';
  return html;
}

function enhanceRatingsInContent() {
  const articleBody = document.getElementById('article-body');
  if (!articleBody) return;
  
  // Find rating patterns in text
  const paragraphs = articleBody.querySelectorAll('p, li, td');
  
  paragraphs.forEach(el => {
    const text = el.textContent;
    
    // Match patterns like "★★★★☆" or "評価：★★★★★"
    const ratingMatch = text.match(/(評価[：:]?\s*)?([★☆]{3,})/);
    if (ratingMatch) {
      const ratingText = ratingMatch[2];
      const newText = text.replace(ratingMatch[0], renderStarRating(ratingText));
      el.innerHTML = el.innerHTML.replace(ratingMatch[0], renderStarRating(ratingText));
    }
    
    // Match numeric ratings like "評価：4.5/5"
    const numRatingMatch = text.match(/(評価[：:]?\s*)?(\d+\.?\d*)\s*[/／]\s*(\d+)/);
    if (numRatingMatch) {
      const rating = parseFloat(numRatingMatch[2]);
      const maxRating = parseFloat(numRatingMatch[3]) || 5;
      const ratingDisplay = renderRatingDisplay(rating, maxRating);
      el.innerHTML = el.innerHTML.replace(numRatingMatch[0], ratingDisplay);
    }
  });
}

// Sidebar Content
function loadSidebarContent() {
  loadPopularArticles();
  loadRecentArticles();
  initSidebarLinks();
}

function loadSidebarContentFromDatabase(database) {
  loadPopularArticlesFromDatabase(database);
  loadRecentArticlesFromDatabase(database);
  initSidebarLinks();
}

function loadPopularArticles() {
  // Try to use loaded database first, then fallback to static database
  const database = Object.keys(loadedArticleDatabase).length > 0 ? loadedArticleDatabase : articleDatabase;
  loadPopularArticlesFromDatabase(database);
}

function loadPopularArticlesFromDatabase(database) {
  const container = document.getElementById('popular-articles');
  if (!container) return;
  
  // Get articles sorted by date (most recent first as placeholder for popularity)
  const allArticles = Object.values(database);
  const popularArticles = allArticles
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date || 0);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date || 0);
      return dateB - dateA;
    })
    .slice(0, 5);
  
  container.innerHTML = '';
  
  popularArticles.forEach(article => {
    const item = document.createElement('a');
    item.href = `affiling-article.html?id=${article.id}`;
    item.className = 'popular-article-item';
    
    const formattedDate = formatDate(article.date);
    
    item.innerHTML = `
      <div class="popular-article-content">
        <h4 class="popular-article-title">${article.title}</h4>
        <div class="popular-article-meta">
          <span class="article-date">${formattedDate}</span>
          <span class="article-read-time">${article.readTime || 0}分</span>
        </div>
      </div>
    `;
    
    container.appendChild(item);
  });
}

function loadRecentArticles() {
  // Try to use loaded database first, then fallback to static database
  const database = Object.keys(loadedArticleDatabase).length > 0 ? loadedArticleDatabase : articleDatabase;
  loadRecentArticlesFromDatabase(database);
}

function loadRecentArticlesFromDatabase(database) {
  const container = document.getElementById('recent-articles');
  if (!container) return;
  
  // Get most recent articles
  const allArticles = Object.values(database);
  const recentArticles = allArticles
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date || 0);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date || 0);
      return dateB - dateA;
    })
    .slice(0, 5);
  
  container.innerHTML = '';
  
  recentArticles.forEach(article => {
    const item = document.createElement('a');
    item.href = `affiling-article.html?id=${article.id}`;
    item.className = 'recent-article-item';
    
    const formattedDate = formatDate(article.date);
    
    item.innerHTML = `
      <div class="recent-article-content">
        <h4 class="recent-article-title">${article.title}</h4>
        <div class="recent-article-meta">
          <span class="article-date">${formattedDate}</span>
        </div>
      </div>
    `;
    
    container.appendChild(item);
  });
}

function initSidebarLinks() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.category || 'all';
      setFilter(category);
      
      // Scroll to articles section
      const articlesSection = document.querySelector('.articles-section');
      if (articlesSection) {
        articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Tag System
function initTagSystem() {
  // This function is called from loadArticlesFromDatabase
  // Tags are handled when rendering articles
}

function getArticleTags(article) {
  if (article.tags && Array.isArray(article.tags)) {
    return article.tags;
  }
  
  // Generate tags from title and category
  const titleWords = article.title.split(/[【】\s\-・]/).filter(w => w.length > 2);
  return [article.category, ...titleWords.slice(0, 3)].filter(Boolean);
}

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
