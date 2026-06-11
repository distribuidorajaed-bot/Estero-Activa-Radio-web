/* ============================================================
   RADIO ESTERO ACTIVA — main.js
   ============================================================ */
 
document.addEventListener('DOMContentLoaded', () => {
  /* ──────────────────────────────────────────────────────────
     1. SIDE NAV — hamburger open/close
  ────────────────────────────────────────────────────────── */
  const menuToggle = document.getElementById('menuToggle');
  const sideNav    = document.getElementById('sideNav');
  const navOverlay = document.getElementById('navOverlay');
 
  function openNav() {
    if (!sideNav || !navOverlay || !menuToggle) return;
    sideNav.classList.add('open');
    navOverlay.classList.add('show');
    menuToggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
 
  function closeNav() {
    if (!sideNav || !navOverlay || !menuToggle) return;
    sideNav.classList.remove('open');
    navOverlay.classList.remove('show');
    menuToggle.classList.remove('open');
    document.body.style.overflow = '';
  }
 
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sideNav && sideNav.classList.contains('open') ? closeNav() : openNav();
    });
  }
 
  if (navOverlay) navOverlay.addEventListener('click', closeNav);
 
  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
 
  // Close nav when a nav link is clicked
  if (sideNav) {
    sideNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });
  }
 
  /* ──────────────────────────────────────────────────────────
     2. SUB-MENU TOGGLES inside side nav
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('.sub-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.has-sub');
      if (!parent) return;
 
      const subList = parent.querySelector('.sub-list');
      const isOpen  = parent.classList.contains('open');
 
      // Close all others
      document.querySelectorAll('.has-sub.open').forEach((el) => {
        el.classList.remove('open');
        const otherSub = el.querySelector('.sub-list');
        if (otherSub) otherSub.classList.remove('open');
      });
 
      if (!isOpen) {
        parent.classList.add('open');
        if (subList) subList.classList.add('open');
      }
    });
  });
 
  /* ──────────────────────────────────────────────────────────
     3. SCROLL — sticky header shadow + back-to-top
  ────────────────────────────────────────────────────────── */
  const mainHeader = document.getElementById('mainHeader');
  const toTopBtn   = document.getElementById('toTop');
 
  window.addEventListener(
    'scroll',
    () => {
      const scrolled = window.scrollY > 80;
      if (mainHeader) mainHeader.classList.toggle('scrolled', scrolled);
      if (toTopBtn) toTopBtn.classList.toggle('show', scrolled);
    },
    { passive: true }
  );
 
  if (toTopBtn) {
    toTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
 
  /* ──────────────────────────────────────────────────────────
     4. SMOOTH ANCHOR — hero button → #radio-section
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href="#radio-section"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('radio-section');
      if (!target) return;
 
      const headerHRaw = getComputedStyle(document.documentElement).getPropertyValue('--header-h');
      const offset = parseInt(headerHRaw, 10) || 66;
 
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
 
  /* ──────────────────────────────────────────────────────────
     5. PRODUCT SLIDER
  ────────────────────────────────────────────────────────── */
  const track    = document.getElementById('slTrack');
  const viewport = document.getElementById('slViewport');
  const prevBtn  = document.getElementById('slPrev');
  const nextBtn  = document.getElementById('slNext');
  const dotsWrap = document.getElementById('slDots');
 
  if (track && viewport && prevBtn && nextBtn && dotsWrap) {
    const cards = Array.from(track.querySelectorAll('.prod-card'));
 
    let current = 0;
    let perPage = 4;
    let isDragging = false;
 
    let dragStartX = 0;
    let dragCurrentX = 0;
    let pointerMoved = false;
 
    function getPerPage() {
      return window.innerWidth <= 960 ? 2 : 4;
    }
 
    function maxIndex() {
      return Math.max(0, cards.length - perPage);
    }
 
    function getGapPx() {
      const gap = getComputedStyle(track).columnGap || getComputedStyle(track).gap;
      const n = parseFloat(gap);
      return Number.isFinite(n) ? n : 18;
    }
 
    function cardWidthPx() {
      if (!cards[0]) return 0;
      return cards[0].offsetWidth;
    }
 
    function updateArrows() {
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= maxIndex();
    }
 
    function updateDots() {
      dotsWrap.querySelectorAll('.sl-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }
 
    function buildDots() {
      dotsWrap.innerHTML = '';
      const total = maxIndex() + 1;
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'sl-dot' + (i === current ? ' active' : '');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Ir a página ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }
 
    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex()));
 
      const w = cardWidthPx();
      const gap = getGapPx();
      const offset = current * (w + gap);
 
      track.style.transform = `translateX(-${offset}px)`;
 
      updateArrows();
      updateDots();
    }
 
    // Arrow clicks
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
 
    function onDragStart(x) {
      isDragging = true;
      pointerMoved = false;
      dragStartX = x;
      dragCurrentX = x;
      track.style.transition = 'none';
    }
 
    function onDragMove(x) {
      if (!isDragging) return;
      dragCurrentX = x;
      if (Math.abs(dragCurrentX - dragStartX) > 6) pointerMoved = true;
    }
 
    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = '';
 
      const diff = dragStartX - dragCurrentX;
      const threshold = 50;
 
      if (diff > threshold) goTo(current + 1);
      else if (diff < -threshold) goTo(current - 1);
      else goTo(current);
    }
 
    // Touch
    track.addEventListener(
      'touchstart',
      (e) => onDragStart(e.touches[0].clientX),
      { passive: true }
    );
    track.addEventListener(
      'touchmove',
      (e) => onDragMove(e.touches[0].clientX),
      { passive: true }
    );
    track.addEventListener('touchend', onDragEnd);
 
    // Mouse drag
    track.addEventListener('mousedown', (e) => {
      onDragStart(e.clientX);
      track.style.userSelect = 'none';
    });
 
    window.addEventListener('mousemove', (e) => onDragMove(e.clientX));
 
    window.addEventListener('mouseup', () => {
      if (isDragging) {
        onDragEnd();
        track.style.userSelect = '';
      }
    });
 
    // Keyboard navigation when slider is focused
    viewport.setAttribute('tabindex', '0');
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });
 
    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newPer = getPerPage();
        const changed = newPer !== perPage;
        perPage = newPer;
 
        if (changed) {
          current = 0;
          buildDots();
        }
        goTo(current);
      }, 120);
    });
 
    // Auto-play
    let autoPlay = null;
 
    function startAutoPlay() {
      if (autoPlay) return;
      autoPlay = setInterval(() => {
        if (document.visibilityState !== 'visible') return;
        if (isDragging) return;
 
        if (current >= maxIndex()) goTo(0);
        else goTo(current + 1);
      }, 5000);
    }
 
    function stopAutoPlay() {
      if (!autoPlay) return;
      clearInterval(autoPlay);
      autoPlay = null;
    }
 
    startAutoPlay();
 
    // Pause on hover/focus
    viewport.addEventListener('mouseenter', stopAutoPlay);
    viewport.addEventListener('focusin', stopAutoPlay);
    viewport.addEventListener('mouseleave', () => {
      if (document.visibilityState === 'visible') startAutoPlay();
    });
 
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') stopAutoPlay();
      else startAutoPlay();
    });
 
    // Init
    perPage = getPerPage();
    buildDots();
    goTo(0);
  }
 
  /* ──────────────────────────────────────────────────────────
     6. RADIO PLAYER
  ────────────────────────────────────────────────────────── */
 
  /**
   * Toggle play/pause for a given audio element.
   * @param {string} audioId  — id of the <audio> element
   * @param {HTMLElement} btn — the play button that was clicked
   */
  window.togglePlay = function (audioId, btn) {
    const audio = document.getElementById(audioId);
    if (!audio) return;
 
    // Stop every other audio and reset their icons
    const allAudios = Array.from(document.querySelectorAll('audio'));
    allAudios.forEach((a) => {
      if (a.id === audioId) return;
      if (!a.paused) a.pause();
 
      // reset icon inside the same player-card (robusto)
      const playerCard = a.closest('.player-card');
      if (playerCard) {
        const playBtn = playerCard.querySelector('.play-btn');
        if (playBtn) {
          const icon = playBtn.querySelector('i');
          if (icon) icon.className = 'fas fa-play';
        }
      }
    });
 
    const icon = btn ? btn.querySelector('i') : null;
 
    if (audio.paused) {
      audio.play().catch((err) => console.warn('Playback error:', err));
      if (icon) icon.className = 'fas fa-pause';
    } else {
      audio.pause();
      if (icon) icon.className = 'fas fa-play';
    }
  };
 
  /**
   * Set volume for a given audio element.
   * @param {string} audioId — id of the <audio> element
   * @param {number|string} val — value 0–1
   */
  window.setVol = function (audioId, val) {
    const audio = document.getElementById(audioId);
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, parseFloat(val)));
  };
 
  // Reset icon when audio ends or errors
  document.querySelectorAll('audio').forEach((audio) => {
    ['ended', 'error'].forEach((evt) => {
      audio.addEventListener(evt, () => {
        const playerCard = audio.closest('.player-card');
        if (!playerCard) return;
 
        const playBtn = playerCard.querySelector('.play-btn');
        const icon = playBtn ? playBtn.querySelector('i') : null;
        if (icon) icon.className = 'fas fa-play';
      });
    });
  });
});