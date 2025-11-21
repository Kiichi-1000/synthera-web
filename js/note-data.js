const NOTE_PAGE_SIZE = 6;

let noteArticles = [];
let filteredArticles = [];
let currentNoteFilter = 'all';
let currentNoteSearch = '';
let currentNotePage = 1;
let isNoteLoading = false;

document.addEventListener('DOMContentLoaded', () => {
  initNotePage();
});

function initNotePage() {
  if (!document.getElementById('articles-grid')) return;

  initNoteFilters();
  initNoteSearch();
  initNoteLoadMore();
  fetchNoteArticles();
}

function initNoteFilters() {
  const filterButtons = document.querySelectorAll('.filter-button');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      if (filter === currentNoteFilter) return;

      currentNoteFilter = filter;
      currentNotePage = 1;
      updateActiveFilter();
      renderNoteArticles();
    });
  });
}

function updateActiveFilter() {
  document.querySelectorAll('.filter-button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === currentNoteFilter);
  });
}

function initNoteSearch() {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');

  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce((event) => {
        currentNoteSearch = event.target.value.toLowerCase();
        currentNotePage = 1;
        renderNoteArticles();
      }, 250),
    );

    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        currentNoteSearch = event.target.value.toLowerCase();
        currentNotePage = 1;
        renderNoteArticles();
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      if (searchInput) {
        currentNoteSearch = searchInput.value.toLowerCase();
        currentNotePage = 1;
        renderNoteArticles();
      }
    });
  }
}

function initNoteLoadMore() {
  const loadMoreButton = document.getElementById('load-more-button');
  if (!loadMoreButton) return;

  loadMoreButton.addEventListener('click', () => {
    if (isNoteLoading) return;
    currentNotePage += 1;
    renderNoteArticles(false);
  });
}

async function fetchNoteArticles() {
  isNoteLoading = true;
  toggleNoteLoading(true);

  try {
    const response = await fetch('data/note_articles.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load note articles: ${response.status}`);
    }
    const data = await response.json();
    noteArticles = Array.isArray(data) ? data : [];
    normalizeNoteArticles();
  } catch (error) {
    console.error('[Note] 記事の取得に失敗しました:', error);
    noteArticles = [];
  } finally {
    currentNotePage = 1;
    renderNoteArticles();
    toggleNoteLoading(false);
    isNoteLoading = false;
  }
}

function normalizeNoteArticles() {
  noteArticles = noteArticles
    .map((article) => ({
      article_title: article.article_title || '',
      category: article.category || 'uncategorized',
      summary: article.summary || '',
      publish_date: article.publish_date || '',
      read_time: article.read_time ?? null,
      tags: Array.isArray(article.tags) ? article.tags : [],
      cta_label: article.cta_label || '',
      cta_link: article.cta_link || '',
      status: article.status || 'Draft',
      cover_image: Array.isArray(article.cover_image) ? article.cover_image : [],
    }))
    .sort((a, b) => (b.publish_date || '').localeCompare(a.publish_date || ''));
}

function renderNoteArticles(reset = true) {
  const grid = document.getElementById('articles-grid');
  const noResults = document.getElementById('no-results');
  const loadMoreContainer = document.querySelector('.load-more-container');
  if (!grid) return;

  const matches = noteArticles.filter((article) => {
    if (article.status === 'Archived') return false;

    const categoryMatch = currentNoteFilter === 'all' || article.category === currentNoteFilter;
    const searchMatch =
      !currentNoteSearch ||
      article.article_title.toLowerCase().includes(currentNoteSearch) ||
      article.summary.toLowerCase().includes(currentNoteSearch) ||
      article.tags.some((tag) => tag.toLowerCase().includes(currentNoteSearch));

    return categoryMatch && searchMatch;
  });

  if (reset) {
    filteredArticles = matches;
    grid.innerHTML = '';
    currentNotePage = 1;
  } else {
    filteredArticles = matches;
  }

  const startIndex = NOTE_PAGE_SIZE * (reset ? 0 : currentNotePage - 1);
  const endIndex = NOTE_PAGE_SIZE * currentNotePage;
  const articlesToRender = filteredArticles.slice(startIndex, endIndex);

  if (reset) {
    grid.innerHTML = '';
  }

  const fragment = document.createDocumentFragment();

  articlesToRender.forEach((article) => {
    fragment.appendChild(createNoteArticleElement(article));
  });

  grid.appendChild(fragment);

  if (noResults) {
    noResults.style.display = articlesToRender.length === 0 ? 'block' : 'none';
  }

  if (loadMoreContainer) {
    if (filteredArticles.length > endIndex) {
      loadMoreContainer.style.display = 'block';
    } else {
      loadMoreContainer.style.display = 'none';
    }
  }
}

function createNoteArticleElement(article) {
  const articleCard = document.createElement('article');
  articleCard.className = 'article-card';
  articleCard.dataset.category = article.category;

  const formattedDate = formatNoteDate(article.publish_date);
  const categoryLabels = {
    technology: 'テクノロジー',
    business: 'ビジネス',
    creative: 'クリエイティブ',
    lifestyle: 'ライフスタイル',
    news: 'ニュース',
  };

  const coverImage =
    article.cover_image && article.cover_image.length > 0 ? article.cover_image[0].url : null;

  articleCard.innerHTML = `
    <div class="article-image">
      ${
        coverImage
          ? `<img src="${coverImage}" alt="${article.article_title}" loading="lazy">`
          : `<div class="article-placeholder">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>`
      }
    </div>
    <div class="article-content">
      <div class="article-meta">
        <span class="article-category">${categoryLabels[article.category] || article.category}</span>
        <span class="article-date">${formattedDate}</span>
      </div>
      <h3 class="article-title">${article.article_title}</h3>
      <p class="article-excerpt">${article.summary}</p>
      <div class="article-stats">
        ${
          article.read_time
            ? `<span class="article-stat">読了時間: ${Math.round(article.read_time)}分</span>`
            : ''
        }
        ${
          article.tags && article.tags.length
            ? `<span class="article-stat">タグ: ${article.tags.join(', ')}</span>`
            : ''
        }
      </div>
      ${
        article.cta_link
          ? `<a class="load-more-button" href="${article.cta_link}" target="_blank" rel="noopener noreferrer">
              <span class="button-text">${article.cta_label || '記事を読む'}</span>
              <div class="button-bg"></div>
            </a>`
          : ''
      }
    </div>
  `;

  return articleCard;
}

function toggleNoteLoading(isLoading) {
  const loadingState = document.getElementById('loading-state');
  const articlesGrid = document.getElementById('articles-grid');

  if (!loadingState || !articlesGrid) return;

  if (isLoading) {
    loadingState.style.display = 'block';
    articlesGrid.style.display = 'none';
  } else {
    loadingState.style.display = 'none';
    articlesGrid.style.display = 'grid';
  }
}

function formatNoteDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

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

