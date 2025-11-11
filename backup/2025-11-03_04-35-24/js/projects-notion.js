// ===== Projects Notion Integration =====
// Dynamically load projects from Notion database

document.addEventListener('DOMContentLoaded', function() {
  initProjectsNotion();
});

/**
 * Initialize Notion integration for projects page
 */
async function initProjectsNotion() {
  // Only initialize on projects page
  if (!document.querySelector('.projects-page')) return;

  // Load projects for each tab
  await loadProjectsForTabs();
}

/**
 * Load projects for all tabs
 */
async function loadProjectsForTabs() {
  const projectTypes = ['sns', 'brand', 'development', 'writing', 'affiliate', 'ec'];
  
  for (const type of projectTypes) {
    await loadProjectsForTab(type);
  }
}

/**
 * Load projects for a specific tab
 * @param {string} projectType - Project type
 */
async function loadProjectsForTab(projectType) {
  try {
    // Try to load from Notion
    let projects = [];
    
    if (typeof window !== 'undefined' && window.loadNotionProjects) {
      projects = await window.loadNotionProjects(projectType);
    } else {
      // Fallback: use static content
      return;
    }

    if (projects.length === 0) {
      // No projects from Notion, keep static content
      return;
    }

    // Render projects in the appropriate tab
    renderProjectsInTab(projectType, projects);
  } catch (error) {
    console.error(`Error loading ${projectType} projects:`, error);
  }
}

/**
 * Render projects in a specific tab
 * @param {string} projectType - Project type
 * @param {Array} projects - Array of project objects
 */
function renderProjectsInTab(projectType, projects) {
  const tabContentId = `${projectType}-content`;
  const tabContent = document.getElementById(tabContentId);
  
  if (!tabContent) return;

  // Find the container for project cards
  let container = null;
  
  // Different containers for different tab types
  if (projectType === 'sns') {
    container = tabContent.querySelector('.sns-showcase, .channels-grid');
  } else if (projectType === 'brand') {
    container = tabContent.querySelector('.brand-showcase');
  } else if (projectType === 'development') {
    container = tabContent.querySelector('.development-grid');
  } else if (projectType === 'writing') {
    container = tabContent.querySelector('.writing-showcase, .articles-grid');
  } else if (projectType === 'affiliate') {
    container = tabContent.querySelector('.affiliate-categories, .affiliate-showcase');
  } else if (projectType === 'ec') {
    container = tabContent.querySelector('.ec-showcase, .projects-grid');
  }

  if (!container) {
    console.warn(`Container not found for ${projectType} tab`);
    return;
  }

  // Clear existing dynamic content (optional - comment out if you want to keep static content as fallback)
  // container.innerHTML = '';

  // Render each project
  projects.forEach(project => {
    const projectElement = createProjectElement(project, projectType);
    if (projectElement && container) {
      container.appendChild(projectElement);
    }
  });
}

/**
 * Create a project element based on type
 * @param {Object} project - Project object
 * @param {string} projectType - Project type
 * @returns {HTMLElement} Project element
 */
function createProjectElement(project, projectType) {
  // Create element based on project type
  if (projectType === 'sns') {
    return createSNSProjectElement(project);
  } else if (projectType === 'brand') {
    return createBrandProjectElement(project);
  } else if (projectType === 'development') {
    return createDevelopmentProjectElement(project);
  } else if (projectType === 'writing') {
    return createWritingProjectElement(project);
  } else if (projectType === 'affiliate') {
    return createAffiliateProjectElement(project);
  } else if (projectType === 'ec') {
    return createECProjectElement(project);
  }
  
  return null;
}

/**
 * Create SNS project element
 */
function createSNSProjectElement(project) {
  const card = document.createElement('div');
  card.className = 'channel-card project-card-dynamic';
  
  card.innerHTML = `
    <div class="channel-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>
    <h3 class="channel-title">${project.title}</h3>
    <p class="channel-description">${project.description || ''}</p>
  `;
  
  if (project.link) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      window.open(project.link, '_blank');
    });
  }
  
  return card;
}

/**
 * Create Brand project element
 */
function createBrandProjectElement(project) {
  const item = document.createElement('div');
  item.className = 'brand-item project-item-dynamic';
  
  item.innerHTML = `
    <div class="brand-visual">
      ${project.image ? 
        `<img src="${project.image}" alt="${project.title}" class="brand-image">` :
        `<div class="logo-preview">
          <span class="logo-text">${project.title}</span>
        </div>`
      }
    </div>
    <div class="brand-info">
      <h3 class="brand-title">${project.title}</h3>
      <p class="brand-description">${project.description || ''}</p>
    </div>
  `;
  
  return item;
}

/**
 * Create Development project element
 */
function createDevelopmentProjectElement(project) {
  const card = document.createElement('div');
  card.className = 'dev-card project-card-dynamic';
  
  const statusBadge = project.status === '開発中' ? '<span class="status-badge">開発中</span>' : '';
  
  card.innerHTML = `
    <div class="dev-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H6.5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6.5V4h13v16z"/>
      </svg>
    </div>
    <h3 class="dev-title">${project.title}</h3>
    <p class="dev-description">${project.description || ''}</p>
    ${statusBadge ? `<div class="dev-status">${statusBadge}</div>` : ''}
  `;
  
  return card;
}

/**
 * Create Writing project element
 */
function createWritingProjectElement(project) {
  const card = document.createElement('article');
  card.className = 'article-card project-card-dynamic';
  
  card.innerHTML = `
    <div class="card-image">
      ${project.image ? 
        `<img src="${project.image}" alt="${project.title}">` :
        `<div class="image-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        </div>`
      }
    </div>
    <div class="card-content">
      <h3 class="card-title">${project.title}</h3>
      <p class="card-excerpt">${project.description || ''}</p>
    </div>
  `;
  
  return card;
}

/**
 * Create Affiliate project element
 */
function createAffiliateProjectElement(project) {
  const card = document.createElement('div');
  card.className = 'category-card project-card-dynamic';
  
  card.innerHTML = `
    <div class="category-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    </div>
    <h4 class="category-title">${project.title}</h4>
    <p class="category-description">${project.description || ''}</p>
    ${project.link ? `
      <div class="category-link">
        <a href="${project.link}" class="category-link-button" target="_blank" rel="noopener">
          <span>詳細を見る</span>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
          </svg>
        </a>
      </div>
    ` : ''}
  `;
  
  return card;
}

/**
 * Create EC project element
 */
function createECProjectElement(project) {
  const card = document.createElement('div');
  card.className = 'ec-item project-card-dynamic';
  
  card.innerHTML = `
    <div class="ec-visual">
      ${project.image ? 
        `<img src="${project.image}" alt="${project.title}" class="ec-image">` :
        `<div class="image-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM1 2v2h2l3.6 7.59-1.35 2.45c-.15.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>`
      }
    </div>
    <div class="ec-info">
      <h3 class="ec-title">${project.title}</h3>
      <p class="ec-description">${project.description || ''}</p>
      ${project.link ? `
        <a href="${project.link}" class="ec-link" target="_blank" rel="noopener">
          詳細を見る →
        </a>
      ` : ''}
    </div>
  `;
  
  return card;
}

// Export
window.initProjectsNotion = initProjectsNotion;

