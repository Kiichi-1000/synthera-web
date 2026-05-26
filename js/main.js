/* ==========================================================================
   SYNTHERA — Main script
   - HELLO splash sequencer
   - Cinematic hero slideshow with caption + tick + counter sync
   - Full-screen menu toggle
   - Year auto-fill
   ========================================================================== */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    splash();
    menu();
    heroSlideshow();
    caseSlideshows();
    fillYear();
    legacyNav();
  }

  /* ---------- Mini slideshows inside each .case__media ---------- */
  function caseSlideshows() {
    const medias = document.querySelectorAll('.case__media');
    if (!medias.length) return;
    const INTERVAL = 5200;

    medias.forEach((media) => {
      const photos = media.querySelectorAll('.case__photo');
      const dots   = media.querySelectorAll('.case__dot');
      if (photos.length < 2) return;

      let idx = 0;

      function show(n) {
        idx = (n + photos.length) % photos.length;
        photos.forEach((p, pi) => p.classList.toggle('is-active', pi === idx));
        dots.forEach((d, di)   => d.classList.toggle('is-active', di === idx));
      }

      show(0);

      let timer = setInterval(() => show(idx + 1), INTERVAL);

      dots.forEach((d) => {
        d.addEventListener('click', () => {
          const target = Number(d.dataset.go);
          if (Number.isNaN(target) || target === idx) return;
          show(target);
          clearInterval(timer);
          timer = setInterval(() => show(idx + 1), INTERVAL);
        });
      });

      // Pause on hover
      media.addEventListener('mouseenter', () => clearInterval(timer));
      media.addEventListener('mouseleave', () => {
        clearInterval(timer);
        timer = setInterval(() => show(idx + 1), INTERVAL);
      });
    });
  }

  /* ---------- HELLO Splash sequencer ---------- */
  function splash() {
    const sp = document.getElementById('splash');
    const hero = document.getElementById('hero');
    if (!sp) {
      document.body.classList.add('splash-done');
      if (hero) hero.classList.add('is-loaded');
      return;
    }

    requestAnimationFrame(() => sp.classList.add('is-in'));

    setTimeout(() => { if (hero) hero.classList.add('is-loaded'); }, 850);
    setTimeout(() => sp.classList.add('is-out'), 1050);
    setTimeout(() => {
      sp.classList.add('is-gone');
      document.body.classList.add('splash-done');
    }, 2350);
  }

  /* ---------- Full-screen menu toggle ---------- */
  function menu() {
    const btn = document.getElementById('menu-btn');
    const menuEl = document.getElementById('menu');
    if (!btn || !menuEl) return;

    btn.addEventListener('click', () => {
      document.body.classList.toggle('menu-open');
      btn.textContent = document.body.classList.contains('menu-open') ? 'Close' : 'Menu';
    });

    menuEl.querySelectorAll('.menu__item a').forEach((a) => {
      a.addEventListener('click', () => {
        document.body.classList.remove('menu-open');
        btn.textContent = 'Menu';
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        document.body.classList.remove('menu-open');
        btn.textContent = 'Menu';
      }
    });
  }

  /* ---------- Hero slideshow ---------- */
  function heroSlideshow() {
    const hero = document.getElementById('hero');
    const slides = hero ? hero.querySelectorAll('.hero__slide') : [];
    if (!hero || slides.length < 2) return;

    const dnavCurrent = document.getElementById('dnav-current');
    const dnavTotal   = document.getElementById('dnav-total');
    const capLabel    = document.getElementById('hero-cap-label');
    const capTitle    = document.getElementById('hero-cap-title');
    const capMeta     = document.getElementById('hero-cap-meta');
    const ticks       = Array.from(document.querySelectorAll('.hero__tick'));

    if (dnavTotal) dnavTotal.textContent = String(slides.length).padStart(2, '0');

    let index = 0;
    const INTERVAL = 5800;
    const TRANSITION = 1400;
    let timer = null;

    // スマホ幅では data-*-sp（あれば）を優先し、画像に合わせた文言を出し分ける
    const mqSP = window.matchMedia('(max-width: 900px)');
    function capPick(slide, key) {
      // スマホ幅で data-*-sp が「存在すれば」（空文字＝キャプション非表示も許容）優先
      return (mqSP.matches && (key + 'Sp') in slide.dataset) ? slide.dataset[key + 'Sp'] : slide.dataset[key];
    }

    function applyCaption(slide) {
      if (capLabel) capLabel.textContent = capPick(slide, 'label') || 'Featured';
      if (capTitle) capTitle.innerHTML  = capPick(slide, 'title') || '';
      if (capMeta)  capMeta.textContent  = capPick(slide, 'meta')  || '';

      document.querySelectorAll('.hero__cap-fade').forEach((el) => {
        el.classList.remove('is-shown');
        void el.offsetWidth;
        el.classList.add('is-shown');
      });

      if (dnavCurrent) dnavCurrent.textContent = String(index + 1).padStart(2, '0');
      ticks.forEach((t, ti) => t.classList.toggle('is-active', ti === index));
    }

    function setSlide(nextIndex) {
      const from = slides[index];
      const to = slides[(nextIndex + slides.length) % slides.length];
      if (from === to) return;

      slides.forEach((s) => {
        if (s !== from && s !== to) s.classList.remove('is-entering', 'is-exiting');
      });

      to.classList.add('is-entering');
      to.classList.add('is-active');
      void to.offsetWidth;
      from.classList.add('is-exiting');

      index = Array.prototype.indexOf.call(slides, to);
      applyCaption(to);

      setTimeout(() => {
        from.classList.remove('is-active', 'is-exiting');
        to.classList.remove('is-entering');
      }, TRANSITION);
    }

    // Set initial caption text without triggering the animation immediately
    if (capLabel) capLabel.textContent = capPick(slides[0], 'label') || 'Featured';
    if (capTitle) capTitle.innerHTML  = capPick(slides[0], 'title') || '';
    if (capMeta)  capMeta.textContent  = capPick(slides[0], 'meta')  || '';
    if (dnavCurrent) dnavCurrent.textContent = '01';
    ticks.forEach((t, ti) => t.classList.toggle('is-active', ti === 0));

    function startTimer() {
      stopTimer();
      timer = setInterval(() => setSlide(index + 1), INTERVAL);
    }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

    const splashEl = document.getElementById('splash');
    const splashDelay = splashEl ? 2500 : 800;

    // Trigger first caption fade just before the curtains finish opening
    setTimeout(() => {
      document.querySelectorAll('.hero__cap-fade').forEach((el) => el.classList.add('is-shown'));
    }, splashDelay - 800);

    setTimeout(startTimer, splashDelay);

    ticks.forEach((t) => {
      t.addEventListener('click', () => {
        const target = Number(t.dataset.go);
        if (Number.isNaN(target) || target === index) return;
        setSlide(target);
        startTimer();
      });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopTimer();
      else startTimer();
    });

    // 画面幅がPC/スマホの境界を跨いだら、現在スライドのキャプションを出し分け直す
    mqSP.addEventListener('change', () => applyCaption(slides[index]));
  }

  /* ---------- Year ---------- */
  function fillYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- Compatibility shim for any old .nav (#nav) on subpages ---------- */
  function legacyNav() {
    const navEl = document.getElementById('nav');
    const toggle = document.getElementById('nav-toggle');
    if (navEl && toggle) {
      toggle.addEventListener('click', () => navEl.classList.toggle('is-open'));
      navEl.querySelectorAll('.nav__link').forEach((link) => {
        link.addEventListener('click', () => navEl.classList.remove('is-open'));
      });
    }
  }
})();
