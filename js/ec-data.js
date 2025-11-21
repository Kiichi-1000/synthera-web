async function fetchEcProjects() {
  try {
    const response = await fetch('data/ec_projects.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[EC Grid] データ取得に失敗しました:', error);
    return [];
  }
}

function createEcCard(item) {
  const card = document.createElement('div');
  card.className = 'project-card';

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'card-image';
  if (item.project_image && item.project_image.length > 0) {
    const img = document.createElement('img');
    img.src = item.project_image[0].url;
    img.alt = item.project_image[0].name || item.project_name;
    imageWrapper.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM1 2v2h2l3.6 7.59-1.35 2.45c-.15.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
      </svg>
    `;
    imageWrapper.appendChild(placeholder);
  }
  card.appendChild(imageWrapper);

  const content = document.createElement('div');
  content.className = 'card-content';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = item.project_name || 'Untitled Project';
  content.appendChild(title);

  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = item.description || '説明文が設定されていません。';
  content.appendChild(description);

  if (item.cta_link) {
    const link = document.createElement('a');
    link.className = 'card-link';
    link.href = item.cta_link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = item.cta_label || '詳細を見る';
    content.appendChild(link);
  }

  card.appendChild(content);
  return card;
}

async function renderEcGrid() {
  const container = document.getElementById('ec-grid');
  const loadingCard = document.getElementById('ec-grid-loading');
  if (!container) return;

  const data = await fetchEcProjects();
  if (loadingCard) {
    container.removeChild(loadingCard);
  }

  const published = data.filter((item) => item.status !== 'Draft' && item.status !== 'Archived');

  if (!published.length) {
    const empty = document.createElement('div');
    empty.className = 'project-card empty-card';
    empty.innerHTML = `
      <div class="card-content">
        <h3 class="card-title">データがありません</h3>
        <p class="card-description">Notion データベースにレコードを追加してから再読み込みしてください。</p>
      </div>
    `;
    container.appendChild(empty);
    return;
  }

  published.forEach((item) => {
    const card = createEcCard(item);
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderEcGrid);

