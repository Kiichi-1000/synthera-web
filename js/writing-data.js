async function fetchWritingArticles() {
  try {
    const response = await fetch('data/writing_articles.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[Writing Grid] データ取得に失敗しました:', error);
    return [];
  }
}

function createWritingCard(item) {
  const article = document.createElement('article');
  article.className = 'writing-card';

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  if (item.category) {
    const category = document.createElement('span');
    category.className = 'category';
    category.textContent = item.category;
    meta.appendChild(category);
  }

  article.appendChild(meta);

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = item.article_title || 'Untitled';
  article.appendChild(title);

  const excerpt = document.createElement('p');
  excerpt.className = 'card-excerpt';
  excerpt.textContent = item.description || '説明文が設定されていません。';
  article.appendChild(excerpt);

  if (item.cta_link) {
    const link = document.createElement('a');
    link.className = 'card-link';
    link.href = item.cta_link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = item.cta_label || '詳細を見る';
    article.appendChild(link);
  }

  return article;
}

async function renderWritingGrid() {
  const container = document.getElementById('writing-grid');
  const loadingCard = document.getElementById('writing-grid-loading');
  if (!container) return;

  const data = await fetchWritingArticles();
  if (loadingCard) {
    container.removeChild(loadingCard);
  }

  const published = data.filter((item) => item.status !== 'Draft' && item.status !== 'Archived');

  if (!published.length) {
    const empty = document.createElement('article');
    empty.className = 'writing-card empty-card';
    empty.innerHTML = `
      <div class="card-content">
        <h3 class="card-title">データがありません</h3>
        <p class="card-excerpt">Notion データベースにレコードを追加してから再読み込みしてください。</p>
      </div>
    `;
    container.appendChild(empty);
    return;
  }

  published.forEach((item) => {
    const card = createWritingCard(item);
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderWritingGrid);
