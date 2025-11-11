// ===== Affiling JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
  initAffiling();
});

// Global state
let currentFilter = 'all';
let currentSearchQuery = '';
let currentPage = 1;
let isLoading = false;
let hasMorePages = true;
let articles = [];

// Global state for comparison
let selectedProducts = [];
let currentView = 'grid';

// Initialize Affiling page
function initAffiling() {
  // Only initialize on affiling page
  if (!document.querySelector('.affiling-header')) return;
  
  initFilters();
  initSearch();
  initViewToggle();
  initArticleCards();
  initComparison();
  loadArticles();
}

// ===== Filter Functions =====
function initFilters() {
  const filterButtons = document.querySelectorAll('.filter-button');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      setFilter(filter);
    });
  });
}

function setFilter(filter) {
  if (currentFilter === filter) return;
  
  currentFilter = filter;
  currentPage = 1;
  hasMorePages = true;
  
  // Update active button
  document.querySelectorAll('.filter-button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });
  
  // Reload articles
  loadArticles();
}

// ===== Search Functions =====
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

// ===== Article Loading =====
function loadArticles() {
  if (isLoading) return;
  
  isLoading = true;
  showLoadingState();
  
  // Notion連携機能は後で実装予定
  // TODO: 記事投稿機能を実装したらここに統合
  
  // Fallback to sample articles
  loadSampleArticles();
  isLoading = false;
  hideLoadingState();
}

function loadSampleArticles() {
  const sampleArticles = [
    {
      id: '1',
      title: '【2024年版】おすすめノートPC比較ランキング',
      excerpt: '実際に使用したノートPCを徹底比較。価格、性能、使いやすさを総合評価した完全ガイドです。',
      category: 'ranking',
      date: new Date('2024-01-15'),
      image: null,
      readTime: 8,
      productCount: 5
    },
    {
      id: '2',
      title: 'ワイヤレスイヤホン完全比較 - 音質・価格・機能',
      excerpt: '人気のワイヤレスイヤホン10機種を実際に試聴して比較。購入前に知っておくべきポイントを詳しく解説します。',
      category: 'comparison',
      date: new Date('2024-01-10'),
      image: null,
      readTime: 10,
      productCount: 10
    },
    {
      id: '3',
      title: 'Apple製品レビュー - iPhone 15 Proを1ヶ月使った感想',
      excerpt: '実際に1ヶ月間使用したiPhone 15 Proのレビュー。良い点・悪い点を正直にお伝えします。',
      category: 'review',
      date: new Date('2024-01-05'),
      image: null,
      readTime: 6,
      productCount: 1
    }
  ];
  
  if (currentPage === 1) {
    articles = sampleArticles;
  } else {
    articles = [...articles, ...sampleArticles];
  }
  
  renderArticles(articles);
  hasMorePages = false;
}

function renderArticles(articlesToRender) {
  const articlesGrid = document.getElementById('articles-grid');
  if (!articlesGrid) return;
  
  // Clear existing articles if it's the first page
  if (currentPage === 1) {
    articlesGrid.innerHTML = '';
  }
  
  // Filter articles
  let filteredArticles = articlesToRender;
  
  if (currentFilter !== 'all') {
    filteredArticles = articlesToRender.filter(article => article.category === currentFilter);
  }
  
  if (currentSearchQuery) {
    filteredArticles = filteredArticles.filter(article => 
      article.title.toLowerCase().includes(currentSearchQuery) ||
      article.excerpt.toLowerCase().includes(currentSearchQuery)
    );
  }
  
  // Render articles
  filteredArticles.forEach(article => {
    const articleElement = createArticleElement(article);
    articlesGrid.appendChild(articleElement);
  });
  
  // Show/hide no results message
  const noResults = document.getElementById('no-results');
  if (filteredArticles.length === 0 && currentPage === 1) {
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
  
  // Update load more button
  updateLoadMoreButton();
}

function createArticleElement(article) {
  const articleCard = document.createElement('article');
  articleCard.className = 'article-card';
  articleCard.setAttribute('data-category', article.category);
  
  const categoryNames = {
    'comparison': '商品比較',
    'ranking': 'ランキング',
    'review': 'レビュー',
    'guide': 'ガイド'
  };
  
  const formattedDate = formatDate(article.date);
  
  articleCard.innerHTML = `
    <div class="article-image">
      ${article.image ? 
        `<img src="${article.image}" alt="${article.title}" loading="lazy">` :
        `<div class="article-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        </div>`
      }
    </div>
    <div class="article-content">
      <div class="article-meta">
        <span class="article-category">${categoryNames[article.category] || article.category}</span>
        <span class="article-date">${formattedDate}</span>
      </div>
      <h3 class="article-title">${article.title}</h3>
      <p class="article-excerpt">${article.excerpt}</p>
      <div class="article-stats">
        <span class="article-stat">読了時間: ${article.readTime}分</span>
        ${article.productCount ? `<span class="article-stat">商品数: ${article.productCount}</span>` : ''}
        <span class="affiliate-badge">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          アフィリエイトリンク
        </span>
      </div>
    </div>
  `;
  
  // Add click event
  articleCard.addEventListener('click', () => {
    window.location.href = `affiling-article.html?id=${article.id}`;
  });
  
  return articleCard;
}

function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
}

// ===== Loading State =====
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

// ===== Load More =====
function updateLoadMoreButton() {
  const loadMoreButton = document.getElementById('load-more-button');
  const loadMoreContainer = document.querySelector('.load-more-container');
  
  if (loadMoreButton && loadMoreContainer) {
    if (hasMorePages) {
      loadMoreContainer.style.display = 'block';
      loadMoreButton.disabled = false;
      loadMoreButton.addEventListener('click', () => {
        currentPage++;
        loadArticles();
      });
    } else {
      loadMoreContainer.style.display = 'none';
    }
  }
}

// ===== Initialize Article Cards 3D Effect =====
function initArticleCards() {
  // Wait for articles to be rendered
  setTimeout(() => {
    const articleCards = document.querySelectorAll('.article-card');
    
    articleCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px) translateY(-8px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) translateY(0)';
      });
    });
  }, 100);
}

// ===== Utility Functions =====
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

// ===== View Toggle Functions =====
function initViewToggle() {
  const gridViewButton = document.getElementById('grid-view-button');
  const comparisonViewButton = document.getElementById('comparison-view-button');
  const articlesGrid = document.getElementById('articles-grid');
  const comparisonContainer = document.getElementById('comparison-container');
  
  if (gridViewButton) {
    gridViewButton.addEventListener('click', () => {
      setView('grid');
    });
  }
  
  if (comparisonViewButton) {
    comparisonViewButton.addEventListener('click', () => {
      setView('comparison');
    });
  }
}

function setView(view) {
  currentView = view;
  
  const gridViewButton = document.getElementById('grid-view-button');
  const comparisonViewButton = document.getElementById('comparison-view-button');
  const articlesGrid = document.getElementById('articles-grid');
  const comparisonContainer = document.getElementById('comparison-container');
  
  // Update button states
  if (gridViewButton && comparisonViewButton) {
    if (view === 'grid') {
      gridViewButton.classList.add('active');
      comparisonViewButton.classList.remove('active');
      if (articlesGrid) articlesGrid.style.display = 'grid';
      if (comparisonContainer) comparisonContainer.style.display = 'none';
    } else {
      comparisonViewButton.classList.add('active');
      gridViewButton.classList.remove('active');
      if (articlesGrid) articlesGrid.style.display = 'none';
      if (comparisonContainer) comparisonContainer.style.display = 'block';
      renderComparisonTable();
    }
  }
}

// ===== Comparison Functions =====
function initComparison() {
  const selectAllButton = document.getElementById('select-all-button');
  const clearButton = document.getElementById('clear-selection-button');
  const selectAllCheckbox = document.getElementById('select-all-checkbox');
  
  if (selectAllButton) {
    selectAllButton.addEventListener('click', selectAllProducts);
  }
  
  if (clearButton) {
    clearButton.addEventListener('click', clearSelection);
  }
  
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectAllProducts();
      } else {
        clearSelection();
      }
    });
  }
}

function selectAllProducts() {
  // Select all visible articles as products
  const articleCards = document.querySelectorAll('.article-card');
  selectedProducts = [];
  
  articleCards.forEach((card, index) => {
    const article = articles[index];
    if (article) {
      selectedProducts.push({
        id: article.id,
        name: article.title,
        price: '要確認',
        rating: 4.5,
        spec: article.excerpt.substring(0, 50) + '...',
        link: `affiling-article.html?id=${article.id}`
      });
    }
  });
  
  renderComparisonTable();
}

function clearSelection() {
  selectedProducts = [];
  renderComparisonTable();
}

function renderComparisonTable() {
  const comparisonTable = document.getElementById('comparison-table');
  const comparisonEmpty = document.getElementById('comparison-empty');
  const selectAllCheckbox = document.getElementById('select-all-checkbox');
  
  if (!comparisonTable) return;
  
  if (selectedProducts.length === 0) {
    comparisonEmpty.classList.add('show');
    comparisonTable.style.display = 'none';
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    return;
  }
  
  comparisonEmpty.classList.remove('show');
  comparisonTable.style.display = 'table';
  
  // Clear existing product columns
  const existingCols = comparisonTable.querySelectorAll('.comparison-product-col[data-product-id]');
  existingCols.forEach(col => {
    if (col.dataset.productId !== 'template') {
      col.remove();
    }
  });
  
  // Add product columns
  const headerRow = comparisonTable.querySelector('thead tr');
  const rows = comparisonTable.querySelectorAll('tbody tr');
  
  selectedProducts.forEach((product, index) => {
    // Add header column
    const headerTemplate = comparisonTable.querySelector('.comparison-product-col[data-product-id="template"]');
    if (headerTemplate && index === 0) {
      const headerCol = headerTemplate.cloneNode(true);
      headerCol.dataset.productId = product.id;
      headerCol.style.display = '';
      headerCol.querySelector('.comparison-product-name').textContent = product.name;
      headerRow.appendChild(headerCol);
    } else if (index > 0) {
      const headerTemplate = comparisonTable.querySelector('.comparison-product-col[data-product-id="template"]');
      if (headerTemplate) {
        const headerCol = headerTemplate.cloneNode(true);
        headerCol.dataset.productId = product.id;
        headerCol.style.display = '';
        headerCol.querySelector('.comparison-product-name').textContent = product.name;
        headerRow.appendChild(headerCol);
      }
    }
    
    // Add data cells
    rows.forEach((row, rowIndex) => {
      const cell = document.createElement('td');
      cell.className = 'comparison-product-cell';
      
      if (row.classList.contains('comparison-row-price')) {
        cell.innerHTML = `<span class="comparison-price">${product.price}</span>`;
      } else if (row.classList.contains('comparison-row-rating')) {
        cell.innerHTML = `<div class="comparison-rating">${generateStars(product.rating)}</div>`;
      } else if (row.classList.contains('comparison-row-spec')) {
        cell.innerHTML = `<p>${product.spec}</p>`;
      } else if (row.classList.contains('comparison-row-link')) {
        cell.innerHTML = `<a href="${product.link}" class="comparison-link-button" target="_blank" rel="noopener">
          <span>詳細を見る</span>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
          </svg>
        </a>`;
      }
      
      row.appendChild(cell);
    });
  });
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let starsHTML = '';
  
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<svg class="comparison-rating-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  }
  
  if (hasHalfStar) {
    starsHTML += '<svg class="comparison-rating-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" style="opacity: 0.5;"/></svg>';
  }
  
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<svg class="comparison-rating-star" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke-width="1"/></svg>';
  }
  
  return starsHTML;
}

// Re-initialize article cards when new articles are loaded
const originalRenderArticles = renderArticles;
renderArticles = function(articlesToRender) {
  originalRenderArticles(articlesToRender);
  setTimeout(() => {
    initArticleCards();
    // Add comparison checkbox to article cards
    addComparisonCheckboxes();
  }, 100);
};

function addComparisonCheckboxes() {
  const articleCards = document.querySelectorAll('.article-card');
  
  articleCards.forEach((card, index) => {
    const article = articles[index];
    if (!article) return;
    
    // Check if checkbox already exists
    if (card.querySelector('.comparison-checkbox')) return;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'comparison-checkbox';
    checkbox.dataset.articleId = article.id;
    checkbox.style.cssText = `
      position: absolute;
      top: var(--spacing-4);
      right: var(--spacing-4);
      width: 24px;
      height: 24px;
      z-index: 10;
      cursor: pointer;
      accent-color: var(--color-primary);
    `;
    
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        addProductToComparison(article);
      } else {
        removeProductFromComparison(article.id);
      }
    });
    
    card.style.position = 'relative';
    card.appendChild(checkbox);
  });
}

function addProductToComparison(article) {
  const existing = selectedProducts.find(p => p.id === article.id);
  if (existing) return;
  
  selectedProducts.push({
    id: article.id,
    name: article.title,
    price: '要確認',
    rating: 4.5,
    spec: article.excerpt.substring(0, 50) + '...',
    link: `affiling-article.html?id=${article.id}`
  });
  
  if (currentView === 'comparison') {
    renderComparisonTable();
  }
}

function removeProductFromComparison(articleId) {
  selectedProducts = selectedProducts.filter(p => p.id !== articleId);
  
  if (currentView === 'comparison') {
    renderComparisonTable();
  }
}

