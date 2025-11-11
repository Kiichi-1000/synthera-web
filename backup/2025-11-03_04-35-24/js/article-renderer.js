// ===== Article Renderer =====

document.addEventListener('DOMContentLoaded', function() {
  initArticleRenderer();
});

// Initialize article renderer
function initArticleRenderer() {
  // Only initialize on article detail page
  if (!document.querySelector('.article-content-section')) return;
  
  loadArticle();
  initTOC();
  initParallax();
}

// Load article content
async function loadArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  
  if (!articleId) {
    showError('記事IDが指定されていません。');
    return;
  }
  
  try {
    // Try to load from Notion first
    if (typeof loadNotionArticle === 'function') {
      const article = await loadNotionArticle(articleId);
      if (article) {
        renderArticle(article);
        return;
      }
    }
    
    // Fallback to sample article
    const sampleArticle = getSampleArticle(articleId);
    if (sampleArticle) {
      renderArticle(sampleArticle);
    } else {
      showError('記事が見つかりませんでした。');
    }
  } catch (error) {
    console.error('Error loading article:', error);
    showError('記事の読み込み中にエラーが発生しました。');
  }
}

// Render article
function renderArticle(article) {
  // Update header
  updateArticleHeader(article);
  
  // Render body content
  renderArticleBody(article);
  
  // Generate TOC
  generateTOC();
  
  // Load related articles
  loadRelatedArticles(article.category, article.id);
  
  // Extract and display affiliate links
  extractAffiliateLinks(article.content);
  
  // Hide loading state
  hideLoadingState();
}

// Update article header
function updateArticleHeader(article) {
  const categoryNames = {
    'comparison': '商品比較',
    'ranking': 'ランキング',
    'review': 'レビュー',
    'guide': 'ガイド'
  };
  
  const categoryEl = document.getElementById('article-category');
  const dateEl = document.getElementById('article-date');
  const titleEl = document.getElementById('article-title');
  const excerptEl = document.getElementById('article-excerpt');
  const readTimeEl = document.getElementById('article-read-time');
  const productCountEl = document.getElementById('article-product-count');
  const heroImageEl = document.getElementById('article-hero-image');
  
  if (categoryEl) {
    categoryEl.textContent = categoryNames[article.category] || article.category;
  }
  
  if (dateEl) {
    dateEl.textContent = formatDate(article.date);
  }
  
  if (titleEl) {
    titleEl.textContent = article.title;
    // Animate title appearance
    animateTitle();
  }
  
  if (excerptEl) {
    excerptEl.textContent = article.excerpt;
  }
  
  if (readTimeEl) {
    readTimeEl.textContent = `読了時間: ${article.readTime}分`;
  }
  
  if (productCountEl && article.productCount) {
    productCountEl.textContent = `商品数: ${article.productCount}`;
    productCountEl.style.display = 'inline-block';
  }
  
  if (heroImageEl && article.image) {
    heroImageEl.style.backgroundImage = `url(${article.image})`;
    heroImageEl.style.backgroundSize = 'cover';
    heroImageEl.style.backgroundPosition = 'center';
  }
}

// Render article body
function renderArticleBody(article) {
  const bodyEl = document.getElementById('article-body');
  if (!bodyEl) return;
  
  if (!article.content) {
    // Generate sample content
    bodyEl.innerHTML = generateSampleContent(article);
    return;
  }
  
  // Convert Notion rich text to HTML
  if (typeof convertNotionToHTML === 'function') {
    bodyEl.innerHTML = convertNotionToHTML(article.content);
  } else {
    // Fallback: treat as HTML
    bodyEl.innerHTML = article.content;
  }
  
  // Process affiliate links
  processAffiliateLinks(bodyEl);
  
  // Enhance images
  enhanceImages(bodyEl);
  
  // Enhance code blocks
  enhanceCodeBlocks(bodyEl);
}

// Generate sample content
function generateSampleContent(article) {
  return `
    <div class="article-intro">
      <p class="article-lead">
        この記事では、実際に使用した製品を誠実に紹介しています。購入を検討されている方の参考になれば幸いです。
      </p>
    </div>
    
    <h2>はじめに</h2>
    <p>
      商品を選ぶ際、様々な情報を比較検討することが重要です。本記事では、実際に使用した製品の感想や比較結果をお伝えします。
    </p>
    
    <h2>比較商品</h2>
    <p>
      以下の商品について詳しく解説します。
    </p>
    
    <h2>まとめ</h2>
    <p>
      各商品の特徴や使用感をお伝えしました。ご自身の用途や予算に合わせて、最適な商品を選択してください。
    </p>
    
    <div class="article-cta">
      <p class="cta-text">この記事はいかがでしたか？</p>
      <a href="affiling.html" class="cta-button-affiliate">
        <span>他の記事も見る</span>
      </a>
    </div>
  `;
}

// Process affiliate links in content
function processAffiliateLinks(container) {
  const links = container.querySelectorAll('a[href]');
  const affiliateDomains = [
    'amazon.co.jp',
    'amazon.com',
    'rakuten.co.jp',
    'yahoo.co.jp',
    'paypaymall.yahoo.co.jp',
    'shopping.yahoo.co.jp'
  ];
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Check if link is an affiliate link
    const isAffiliate = affiliateDomains.some(domain => href.includes(domain));
    
    if (isAffiliate) {
      // Add affiliate styling
      link.classList.add('affiliate-link-inline');
      
      // Add badge if not already present
      if (!link.querySelector('.affiliate-badge-inline')) {
        const badge = document.createElement('span');
        badge.className = 'affiliate-badge-inline';
        badge.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          アフィリエイトリンク
        `;
        link.appendChild(badge);
      }
      
      // Add click tracking
      link.addEventListener('click', trackAffiliateClick);
    }
  });
}

// Track affiliate link clicks
function trackAffiliateClick(e) {
  const link = e.currentTarget;
  const href = link.getAttribute('href');
  
  // Analytics tracking (if available)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'affiliate_click', {
      'affiliate_url': href,
      'article_id': new URLSearchParams(window.location.search).get('id')
    });
  }
  
  // Console log for debugging
  console.log('Affiliate link clicked:', href);
}

// Extract all affiliate links and display in sidebar
function extractAffiliateLinks(content) {
  const quickLinksEl = document.getElementById('quick-affiliate-links');
  if (!quickLinksEl) return;
  
  const affiliateDomains = [
    'amazon.co.jp',
    'amazon.com',
    'rakuten.co.jp'
  ];
  
  const links = [];
  const container = document.createElement('div');
  container.innerHTML = content;
  
  container.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    const text = link.textContent.trim();
    
    if (affiliateDomains.some(domain => href.includes(domain))) {
      links.push({
        href: href,
        text: text || '商品リンク',
        domain: affiliateDomains.find(d => href.includes(d))
      });
    }
  });
  
  if (links.length > 0) {
    quickLinksEl.innerHTML = `
      <h3 class="quick-links-title">商品リンク</h3>
      <div class="quick-links-list">
        ${links.map(link => `
          <a href="${link.href}" class="quick-link-item" target="_blank" rel="noopener">
            <span class="quick-link-text">${link.text}</span>
            <span class="quick-link-badge">${link.domain}</span>
            <svg viewBox="0 0 24 24" fill="currentColor" class="quick-link-icon">
              <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
            </svg>
          </a>
        `).join('')}
      </div>
    `;
    quickLinksEl.style.display = 'block';
  } else {
    quickLinksEl.style.display = 'none';
  }
}

// Enhance images
function enhanceImages(container) {
  const images = container.querySelectorAll('img');
  
  images.forEach(img => {
    // Add lazy loading
    img.loading = 'lazy';
    
    // Add lightbox functionality
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => openImageLightbox(img.src, img.alt));
    
    // Add caption if parent is figure
    if (img.parentElement.tagName === 'FIGURE') {
      img.parentElement.classList.add('article-figure');
    }
  });
}

// Open image lightbox
function openImageLightbox(src, alt) {
  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-overlay"></div>
    <div class="lightbox-content">
      <button class="lightbox-close">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
      <img src="${src}" alt="${alt}" class="lightbox-image">
    </div>
  `;
  
  document.body.appendChild(lightbox);
  document.body.style.overflow = 'hidden';
  
  setTimeout(() => lightbox.classList.add('active'), 10);
  
  // Close handlers
  const close = () => {
    lightbox.classList.remove('active');
    setTimeout(() => {
      lightbox.remove();
      document.body.style.overflow = '';
    }, 300);
  };
  
  lightbox.querySelector('.lightbox-close').addEventListener('click', close);
  lightbox.querySelector('.lightbox-overlay').addEventListener('click', close);
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', escHandler);
    }
  });
}

// Enhance code blocks
function enhanceCodeBlocks(container) {
  const codeBlocks = container.querySelectorAll('pre code, pre');
  
  codeBlocks.forEach(block => {
    const pre = block.tagName === 'PRE' ? block : block.parentElement;
    if (!pre) return;
    
    // Add copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-button';
    copyButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
      <span class="copy-text">コピー</span>
    `;
    
    copyButton.addEventListener('click', () => {
      const code = block.textContent || block.innerText;
      navigator.clipboard.writeText(code).then(() => {
        copyButton.classList.add('copied');
        copyButton.querySelector('.copy-text').textContent = 'コピー済み';
        setTimeout(() => {
          copyButton.classList.remove('copied');
          copyButton.querySelector('.copy-text').textContent = 'コピー';
        }, 2000);
      });
    });
    
    pre.style.position = 'relative';
    pre.appendChild(copyButton);
  });
}

// Initialize Table of Contents
function initTOC() {
  const tocNav = document.getElementById('toc-nav');
  if (!tocNav) return;
  
  // TOC will be generated after content is loaded
}

// Generate Table of Contents
function generateTOC() {
  const tocNav = document.getElementById('toc-nav');
  const articleBody = document.getElementById('article-body');
  
  if (!tocNav || !articleBody) return;
  
  const headings = articleBody.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    document.getElementById('toc-container').style.display = 'none';
    return;
  }
  
  const tocItems = [];
  headings.forEach((heading, index) => {
    // Generate ID if not exists
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }
    
    const level = parseInt(heading.tagName.substring(1));
    tocItems.push({
      id: heading.id,
      text: heading.textContent,
      level: level
    });
  });
  
  tocNav.innerHTML = tocItems.map(item => `
    <a href="#${item.id}" class="toc-link toc-level-${item.level}" data-heading-id="${item.id}">
      ${item.text}
    </a>
  `).join('');
  
  // Highlight current section on scroll
  highlightCurrentTOCSection();
  window.addEventListener('scroll', debounce(highlightCurrentTOCSection, 100));
  
  // Smooth scroll for TOC links
  tocNav.querySelectorAll('.toc-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 100;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Highlight current TOC section
function highlightCurrentTOCSection() {
  const headings = document.querySelectorAll('#article-body h2, #article-body h3');
  const tocLinks = document.querySelectorAll('.toc-link');
  
  let currentId = '';
  const scrollPosition = window.scrollY + 150;
  
  headings.forEach(heading => {
    const headingTop = heading.offsetTop;
    const headingBottom = headingTop + heading.offsetHeight;
    
    if (scrollPosition >= headingTop && scrollPosition < headingBottom) {
      currentId = heading.id;
    }
  });
  
  tocLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentId}`) {
      link.classList.add('active');
    }
  });
}

// Initialize parallax effect
function initParallax() {
  const heroImage = document.getElementById('article-hero-image');
  if (!heroImage) return;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.5;
    heroImage.style.transform = `translateY(${rate}px)`;
    
    // Fade out header on scroll
    const headerContent = heroImage.querySelector('.article-header-content');
    if (headerContent) {
      const opacity = Math.max(0, 1 - scrolled / 300);
      headerContent.style.opacity = opacity;
    }
  });
}

// Animate title appearance
function animateTitle() {
  const titleEl = document.getElementById('article-title');
  if (!titleEl) return;
  
  const words = titleEl.textContent.split('');
  titleEl.textContent = '';
  titleEl.style.opacity = '1';
  
  words.forEach((char, index) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.opacity = '0';
    span.style.animation = `fadeIn 0.1s ease forwards`;
    span.style.animationDelay = `${index * 0.02}s`;
    titleEl.appendChild(span);
  });
}

// Load related articles
async function loadRelatedArticles(category, excludeId) {
  const relatedGrid = document.getElementById('related-grid');
  if (!relatedGrid) return;
  
  // TODO: Load from Notion or API
  // For now, show placeholder
  relatedGrid.innerHTML = `
    <div class="related-placeholder">
      <p>関連記事を読み込んでいます...</p>
    </div>
  `;
}

// Load Notion article (placeholder)
async function loadNotionArticle(articleId) {
  // TODO: Implement Notion API call
  return null;
}

// Get sample article
function getSampleArticle(articleId) {
  const sampleArticles = {
    '1': {
      id: '1',
      title: '【2024年版】おすすめノートPC比較ランキング',
      excerpt: '実際に使用したノートPCを徹底比較。価格、性能、使いやすさを総合評価した完全ガイドです。',
      category: 'ranking',
      date: new Date('2024-01-15'),
      image: null,
      readTime: 8,
      productCount: 5,
      content: null
    },
    '2': {
      id: '2',
      title: 'ワイヤレスイヤホン完全比較 - 音質・価格・機能',
      excerpt: '人気のワイヤレスイヤホン10機種を実際に試聴して比較。購入前に知っておくべきポイントを詳しく解説します。',
      category: 'comparison',
      date: new Date('2024-01-10'),
      image: null,
      readTime: 10,
      productCount: 10,
      content: null
    },
    '3': {
      id: '3',
      title: 'Apple製品レビュー - iPhone 15 Proを1ヶ月使った感想',
      excerpt: '実際に1ヶ月間使用したiPhone 15 Proのレビュー。良い点・悪い点を正直にお伝えします。',
      category: 'review',
      date: new Date('2024-01-05'),
      image: null,
      readTime: 6,
      productCount: 1,
      content: null
    }
  };
  
  return sampleArticles[articleId] || null;
}

// Show error message
function showError(message) {
  const bodyEl = document.getElementById('article-body');
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="article-error">
        <svg viewBox="0 0 24 24" fill="currentColor" class="error-icon">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <h2>エラー</h2>
        <p>${message}</p>
        <a href="affiling.html" class="cta-button-affiliate">
          <span>記事一覧に戻る</span>
        </a>
      </div>
    `;
  }
  hideLoadingState();
}

// Hide loading state
function hideLoadingState() {
  const loadingEl = document.querySelector('.article-loading');
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }
}

// Format date
function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
}

// Debounce function
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


