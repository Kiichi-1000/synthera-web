async function fetchDevelopmentProjects() {
  try {
    const response = await fetch('data/dev_projects.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[Development Grid] データ取得に失敗しました:', error);
    return [];
  }
}

function createDevCard(item) {
  const card = document.createElement('div');
  card.className = 'dev-card';

  if (item.project_image && item.project_image.length > 0) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'dev-image';

    const img = document.createElement('img');
    img.src = item.project_image[0].url;
    img.alt = item.project_image[0].name || item.project_name;
    imageWrapper.appendChild(img);
    card.appendChild(imageWrapper);
  }

  const title = document.createElement('h3');
  title.className = 'dev-title';
  title.textContent = item.project_name || 'Untitled Project';
  card.appendChild(title);

  const badgeRow = document.createElement('div');
  badgeRow.className = 'dev-status';

  if (item.stage) {
    const stageBadge = document.createElement('span');
    stageBadge.className = 'status-badge';
    stageBadge.textContent = item.stage;
    badgeRow.appendChild(stageBadge);
  }

  if (item.status) {
    const statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge secondary';
    statusBadge.textContent = item.status;
    badgeRow.appendChild(statusBadge);
  }

  if (item.platform) {
    const platformBadge = document.createElement('span');
    platformBadge.className = 'status-badge outline';
    platformBadge.textContent = item.platform;
    badgeRow.appendChild(platformBadge);
  }

  if (badgeRow.children.length > 0) {
    card.appendChild(badgeRow);
  }

  const description = document.createElement('p');
  description.className = 'dev-description';
  description.textContent = item.description || '説明文が設定されていません。';
  card.appendChild(description);

  if (item.highlights) {
    const highlightList = document.createElement('ul');
    highlightList.className = 'dev-highlights';
    item.highlights
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const li = document.createElement('li');
        li.textContent = line.replace(/^・/, '');
        highlightList.appendChild(li);
      });
    if (highlightList.children.length > 0) {
      card.appendChild(highlightList);
    }
  }

  if (item.cta_link) {
    const button = document.createElement('a');
    button.className = 'dev-cta';
    button.href = item.cta_link;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.textContent = item.cta_label || '詳細を見る';
    card.appendChild(button);
  }

  return card;
}

async function renderDevelopmentGrid() {
  const container = document.getElementById('development-grid');
  const loadingCard = document.getElementById('development-grid-loading');
  if (!container) return;

  const data = await fetchDevelopmentProjects();
  if (loadingCard) {
    container.removeChild(loadingCard);
  }

  if (!data.length) {
    const empty = document.createElement('div');
    empty.className = 'dev-card empty-card';
    empty.innerHTML = `
      <div class="card-content">
        <h3 class="dev-title">データがありません</h3>
        <p class="dev-description">Notion データベースにレコードを追加してから再読み込みしてください。</p>
      </div>
    `;
    container.appendChild(empty);
    return;
  }

  data.forEach((item) => {
    const card = createDevCard(item);
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderDevelopmentGrid);

