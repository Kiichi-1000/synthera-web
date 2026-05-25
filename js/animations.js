/* ==========================================================================
   SYNTHERA — Scroll-triggered reveal animations
   - Resilient: works with IntersectionObserver, scroll fallback, and a
     final "reveal anything in viewport" timer so animations never get stuck.
   ========================================================================== */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    setupReveals();
    heroRevealOnLoad();
  }

  function isInViewport(el, margin) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (vh === 0) return true; // headless / hidden viewports — assume visible
    const top = r.top;
    const bottom = r.bottom;
    return bottom > 0 && top < vh - (margin || 0);
  }

  function revealEl(el, delay) {
    setTimeout(() => {
      el.classList.add('is-revealed');
      // Cascade reveal masks inside (each with own stagger)
      el.querySelectorAll('.mask').forEach((m, mi) => {
        setTimeout(() => m.classList.add('is-revealed'), mi * 90);
      });
    }, delay || 0);
  }

  function setupReveals() {
    const fadeTargets = Array.from(document.querySelectorAll('.fade-up, .curtain, .case__photo'));
    const maskGroups = new Map();

    document.querySelectorAll('.mask').forEach((m) => {
      const group = m.closest('h1, h2, h3, .works__title, .hero__title, .cta__title, .about-hero__title, .projects-hero__title, .contact-hero__title') || m.parentElement;
      if (!group) return;
      if (!maskGroups.has(group)) maskGroups.set(group, []);
      maskGroups.get(group).push(m);
    });

    // Stagger index
    const counts = new Map();
    fadeTargets.forEach((el) => {
      const p = el.parentElement; if (!p) return;
      const i = counts.get(p) || 0;
      counts.set(p, i + 1);
      el.dataset.staggerIndex = String(i);
    });

    function revealMaskGroup(group) {
      const masks = maskGroups.get(group) || [];
      masks.forEach((m, mi) => setTimeout(() => m.classList.add('is-revealed'), mi * 90));
    }

    // Try IntersectionObserver
    let usedObserver = false;
    if ('IntersectionObserver' in window) {
      try {
        const opts = { rootMargin: '0px 0px -6% 0px', threshold: 0.01 };
        const fadeObs = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const idx = Number(e.target.dataset.staggerIndex || 0);
            revealEl(e.target, Math.min(idx * 70, 350));
            fadeObs.unobserve(e.target);
          });
        }, opts);
        fadeTargets.forEach((el) => fadeObs.observe(el));

        const maskObs = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            revealMaskGroup(e.target);
            maskObs.unobserve(e.target);
          });
        }, opts);
        maskGroups.forEach((_, g) => maskObs.observe(g));
        usedObserver = true;
      } catch (_) { /* fall through */ }
    }

    // Scroll fallback — reveal anything that becomes visible
    function scanReveal() {
      fadeTargets.forEach((el) => {
        if (el.classList.contains('is-revealed')) return;
        if (isInViewport(el, 40)) {
          const idx = Number(el.dataset.staggerIndex || 0);
          revealEl(el, Math.min(idx * 70, 350));
        }
      });
      maskGroups.forEach((masks, group) => {
        if (masks.every((m) => m.classList.contains('is-revealed'))) return;
        if (isInViewport(group, 40)) revealMaskGroup(group);
      });
    }

    scanReveal();
    window.addEventListener('scroll', scanReveal, { passive: true });
    window.addEventListener('resize', scanReveal);

    // Final safety: after 1.2s, force-reveal anything still hidden in viewport.
    // After 4s, reveal everything regardless (prevents "stuck invisible" content
    // in headless / preview environments where IntersectionObserver may not fire).
    setTimeout(scanReveal, 600);
    setTimeout(() => {
      fadeTargets.forEach((el) => el.classList.add('is-revealed'));
      maskGroups.forEach((masks) => masks.forEach((m) => m.classList.add('is-revealed')));
    }, 4000);
  }

  /* ---------- Hero masks reveal on load ---------- */
  function heroRevealOnLoad() {
    const hero = document.querySelector('.hero, .about-hero');
    if (!hero) return;
    // If the homepage hero is doing its full intro animation, wait until the
    // photo clip-in finishes (~700ms in) before kicking off the text reveals.
    const intro = hero.classList.contains('is-intro');
    const start = intro ? 700 : 200;

    requestAnimationFrame(() => {
      setTimeout(() => {
        hero.querySelectorAll('.mask').forEach((m, i) => {
          setTimeout(() => m.classList.add('is-revealed'), i * 130);
        });
        hero.querySelectorAll('.fade-up').forEach((m, i) => {
          setTimeout(() => m.classList.add('is-revealed'), 380 + i * 100);
        });
      }, start);
    });
  }
})();
