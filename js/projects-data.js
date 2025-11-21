async function fetchSNSGrid() {
  try {
    const response = await fetch('data/sns_grids.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[SNS Grid] データ取得に失敗しました:', error);
    return [];
  }
}

function createCard(item) {
  const card = document.createElement('div');
  card.className = 'project-card';

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'card-image';

  if (item.grid_image && item.grid_image.length > 0) {
    const img = document.createElement('img');
    img.src = item.grid_image[0].url;
    img.alt = item.grid_image[0].name || item.grid_name;
    imageWrapper.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    `;
    imageWrapper.appendChild(placeholder);
  }

  const content = document.createElement('div');
  content.className = 'card-content';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = item.grid_name || 'Untitled';
  content.appendChild(title);

  const description = document.createElement('p');
  description.className = 'card-description';
  description.textContent = item.detail_text || '説明文が設定されていません。';
  content.appendChild(description);

  if (item.cta_link) {
    const link = document.createElement('a');
    link.className = 'card-link';
    link.href = item.cta_link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '詳細を見る';
    content.appendChild(link);
  }

  card.appendChild(imageWrapper);
  card.appendChild(content);
  return card;
}

async function renderSNSGrid() {
  const container = document.getElementById('sns-grid');
  const loadingCard = document.getElementById('sns-grid-loading');
  if (!container) return;

  const data = await fetchSNSGrid();
  if (loadingCard) {
    container.removeChild(loadingCard);
  }

  if (!data.length) {
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

  data.forEach((item) => {
    const card = createCard(item);
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderSNSGrid);

