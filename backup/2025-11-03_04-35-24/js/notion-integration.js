// ===== Notion Integration JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
  initNotionIntegration();
});

// Configuration
const NOTION_CONFIG = {
  databaseId: 'd05ba52d-48de-4a27-8642-408dbacf4798', // 📝 Note記事管理 database ID
  apiVersion: '2022-06-28',
  maxResults: 20
};

// Global state
let currentFilter = 'all';
let currentPage = 1;
let isLoading = false;
let hasMorePages = true;

function initNotionIntegration() {
  // Only initialize on note page
  if (!document.querySelector('.articles-section')) return;
  
  initFilters();
  initSearch();
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
  });
  document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
  
  // Reload articles
  loadArticles();
}

// ===== Search Functions =====
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.querySelector('.search-button');
  
  if (searchInput) {
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
      }, 300);
    });
    
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
      });
    }
  }
}

function performSearch(query) {
  // For now, filter existing articles by title/description
  const articles = document.querySelectorAll('.article-card');
  
  articles.forEach(article => {
    const title = article.querySelector('.article-title').textContent.toLowerCase();
    const excerpt = article.querySelector('.article-excerpt').textContent.toLowerCase();
    const searchQuery = query.toLowerCase();
    
    if (title.includes(searchQuery) || excerpt.includes(searchQuery)) {
      article.style.display = 'block';
      article.classList.add('search-match');
    } else {
      article.style.display = 'none';
      article.classList.remove('search-match');
    }
  });
  
  // Show/hide no results message
  const visibleArticles = document.querySelectorAll('.article-card[style*="block"], .article-card:not([style*="none"])');
  const noResults = document.getElementById('no-results');
  
  if (visibleArticles.length === 0 && query) {
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
}

// ===== Article Loading Functions =====
function loadArticles() {
  if (isLoading) return;
  
  isLoading = true;
  showLoadingState();
  
  // Try to load from Notion first
  if (typeof window !== 'undefined' && window.NotionAPI) {
    try {
      const notionPages = await window.NotionAPI.fetchNotionDatabase('note', {
        query: '',
        filters: currentFilter !== 'all' ? { category: currentFilter } : {}
      });

      // Filter by published and transform
      const articles = notionPages
        .filter(page => {
          const props = page.properties || {};
          const pubProp = props.Published || props.Featured;
          return pubProp?.type === 'checkbox' ? pubProp.checkbox === true : false;
        })
        .map(page => window.NotionAPI.transformNotionPageToArticle(page, 'note'))
        .filter(Boolean);

      if (articles.length > 0) {
        renderArticles(articles);
        hideLoadingState();
        isLoading = false;
        return;
      }
    } catch (error) {
      console.error('Error loading from Notion, using fallback:', error);
    }
  }

  // Fallback to mock data
  setTimeout(() => {
    const articles = generateMockArticles();
    renderArticles(articles);
    hideLoadingState();
    isLoading = false;
  }, 1000);
}

function showLoadingState() {
  const loadingState = document.getElementById('loading-state');
  const articlesGrid = document.getElementById('articles-grid');
  
  if (loadingState) loadingState.style.display = 'block';
  if (articlesGrid) articlesGrid.style.display = 'none';
}

function hideLoadingState() {
  const loadingState = document.getElementById('loading-state');
  const articlesGrid = document.getElementById('articles-grid');
  
  if (loadingState) loadingState.style.display = 'none';
  if (articlesGrid) articlesGrid.style.display = 'grid';
}

function renderArticles(articles) {
  const articlesGrid = document.getElementById('articles-grid');
  if (!articlesGrid) return;
  
  // Clear existing articles if it's the first page
  if (currentPage === 1) {
    articlesGrid.innerHTML = '';
  }
  
  // Filter articles based on current filter
  const filteredArticles = currentFilter === 'all' 
    ? articles 
    : articles.filter(article => article.category === currentFilter);
  
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
  updateLoadMoreButton(filteredArticles.length < articles.length);
}

function createArticleElement(article) {
  const articleCard = document.createElement('article');
  articleCard.className = 'article-card';
  articleCard.setAttribute('data-category', article.category);
  
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
        <span class="article-category">${article.category}</span>
        <span class="article-date">${formatDate(article.date)}</span>
      </div>
      <h3 class="article-title">${article.title}</h3>
      <p class="article-excerpt">${article.excerpt}</p>
      <div class="article-stats">
        <span class="article-stat">読了時間: ${article.readTime}分</span>
        <span class="article-stat">いいね: ${article.likes}</span>
      </div>
    </div>
  `;
  
  // Add click event
  articleCard.addEventListener('click', () => {
    // In a real implementation, this would navigate to the full article
    console.log('Navigate to article:', article.id);
  });
  
  return articleCard;
}

// ===== Load More Functions =====
function initLoadMore() {
  const loadMoreButton = document.getElementById('load-more-button');
  
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      currentPage++;
      loadArticles();
    });
  }
}

function updateLoadMoreButton(hasMore) {
  const loadMoreButton = document.getElementById('load-more-button');
  const loadMoreContainer = document.querySelector('.load-more-container');
  
  if (!loadMoreButton || !loadMoreContainer) return;
  
  if (hasMore) {
    loadMoreContainer.style.display = 'block';
    loadMoreButton.disabled = isLoading;
    loadMoreButton.querySelector('.button-text').textContent = isLoading ? '読み込み中...' : 'さらに読み込む';
  } else {
    loadMoreContainer.style.display = 'none';
  }
}

// ===== Mock Data Generation =====
function generateMockArticles() {
  const categories = ['technology', 'business', 'creative', 'lifestyle'];
  const articles = [];
  
  for (let i = 0; i < 12; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    articles.push({
      id: `article-${i + 1}`,
      title: generateMockTitle(category),
      excerpt: generateMockExcerpt(),
      category: category,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      readTime: Math.floor(Math.random() * 10) + 3,
      likes: Math.floor(Math.random() * 200) + 50,
      image: null // In real implementation, this would be the actual image URL
    });
  }
  
  return articles;
}

function generateMockTitle(category) {
  const titles = {
    technology: [
      '最新のWebデザイントレンド2024',
      'AI技術の未来と可能性',
      'モバイルアプリ開発のベストプラクティス',
      'クラウドコンピューティングの進化'
    ],
    business: [
      'スタートアップの成長戦略',
      'デジタルマーケティングの新手法',
      'リモートワークの効果的な管理方法',
      'ブランド構築の重要性'
    ],
    creative: [
      'クリエイティブプロセスの最適化',
      'デザイン思考の実践方法',
      '色彩心理学とブランディング',
      'ユーザー体験デザインの原則'
    ],
    lifestyle: [
      '生産性向上のためのライフハック',
      'ワークライフバランスの取り方',
      'デジタルデトックスの効果',
      '習慣化の科学'
    ]
  };
  
  const categoryTitles = titles[category] || titles.technology;
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
}

function generateMockExcerpt() {
  const excerpts = [
    '革新的なアプローチと最新技術を活用して、新しい価値を創造する方法について詳しく解説します。',
    '実践的なテクニックと豊富な事例を通じて、効果的な戦略を学びましょう。',
    '業界の専門家による洞察と、実際のプロジェクトでの経験を基にした貴重な情報をお届けします。',
    '初心者から上級者まで、レベルに応じた実用的なガイドとして活用できる内容です。'
  ];
  
  return excerpts[Math.floor(Math.random() * excerpts.length)];
}

// ===== Utility Functions =====
function formatDate(date) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return date.toLocaleDateString('ja-JP', options);
}

function getCategoryLabel(category) {
  const labels = {
    technology: 'テクノロジー',
    business: 'ビジネス',
    creative: 'クリエイティブ',
    lifestyle: 'ライフスタイル'
  };
  
  return labels[category] || category;
}

// Initialize load more functionality
document.addEventListener('DOMContentLoaded', () => {
  initLoadMore();
});

// Export functions for external use
window.SyntheraNotion = {
  loadArticles,
  setFilter,
  performSearch,
  updateLoadMoreButton
};
