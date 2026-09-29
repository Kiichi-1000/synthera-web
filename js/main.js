/* ==========================================================================
   SYNTHERA — Main script
   - Page veil (load transition)
   - Floating navigation theme switching
   - Hero slideshow
   - Year auto-fill
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    pageVeil();
    nav();
    heroSlideshow();
    fillYear();
    navThemeObserver();
  }

  /* ---------- Page veil ---------- */
  function pageVeil() {
    const veil = document.getElementById('page-veil');
    if (!veil) return;
    // Force a reflow so the transition fires even if class is added quickly.
    void veil.offsetHeight;
    requestAnimationFrame(() => {
      veil.classList.add('is-loaded');
      setTimeout(() => { if (veil.parentNode) veil.parentNode.removeChild(veil); }, 800);
    });
  }

  /* ---------- Navigation ---------- */
  function nav() {
    const navEl = document.getElementById('nav');
    const toggle = document.getElementById('nav-toggle');
    if (!navEl || !toggle) return;

    toggle.addEventListener('click', () => {
      navEl.classList.toggle('is-open');
    });

    navEl.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => navEl.classList.remove('is-open'));
    });
  }

  /* ---------- Nav theme based on section bg ---------- */
  function navThemeObserver() {
    const navEl = document.getElementById('nav');
    if (!navEl) return;

    const sections = document.querySelectorAll('[data-theme]');
    if (!sections.length) return;

    const updateTheme = () => {
      const probeY = 60;
      let current = null;
      sections.forEach((s) => {
        const rect = s.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) current = s;
      });
      if (!current) return;
      const theme = current.getAttribute('data-theme');
      if (theme === 'dark') navEl.classList.add('is-on-dark');
      else navEl.classList.remove('is-on-dark');
    };

    updateTheme();
    window.addEventListener('scroll', updateTheme, { passive: true });
    window.addEventListener('resize', updateTheme);
  }

  /* ---------- Hero slideshow ---------- */
  function heroSlideshow() {
    const hero = document.querySelector('.hero');
    const slides = document.querySelectorAll('.hero__slide');
    if (!hero || slides.length < 2) return;

    const currentEl = document.getElementById('hero-current');
    const totalEl = document.getElementById('hero-total');
    const captionLabel = document.querySelector('.hero__caption-label');
    const captionTitle = document.getElementById('hero-caption-title');

    if (totalEl) totalEl.textContent = String(slides.length).padStart(2, '0');

    let index = 0;
    const INTERVAL = 5400;
    const TRANSITION = 1400;

    // Remove the page-load intro class once the initial entry animation completes
    setTimeout(() => hero.classList.remove('is-intro'), TRANSITION + 200);

    function applyCaption(slide) {
      const label = slide.dataset.captionLabel || 'Featured';
      const title = slide.dataset.captionTitle || '';
      if (captionLabel) captionLabel.textContent = label;
      if (captionTitle) captionTitle.textContent = title;
    }

    function setSlide(nextIndex) {
      const from = slides[index];
      const to = slides[(nextIndex + slides.length) % slides.length];
      if (from === to) return;

      slides.forEach((s) => {
        if (s !== from && s !== to) {
          s.classList.remove('is-entering', 'is-exiting');
        }
      });

      to.classList.add('is-entering');
      to.classList.add('is-active');
      void to.offsetWidth;

      from.classList.add('is-exiting');

      index = Array.prototype.indexOf.call(slides, to);
      if (currentEl) currentEl.textContent = String(index + 1).padStart(2, '0');
      applyCaption(to);

      setTimeout(() => {
        from.classList.remove('is-active', 'is-exiting');
        to.classList.remove('is-entering');
      }, TRANSITION);
    }

    // Initialize first slide's caption
    applyCaption(slides[0]);

    let timer = setInterval(() => setSlide(index + 1), INTERVAL);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        timer = setInterval(() => setSlide(index + 1), INTERVAL);
      }
    });
  }

  /* ---------- Year ---------- */
  function fillYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = String(new Date().getFullYear());
  }
})();
