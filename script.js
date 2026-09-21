(() => {
  const WEDDING_DATE = new Date('2026-12-12T15:20:00+09:00').getTime();

  const galleryLabels = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];

  const accountsData = {
    '신랑측': [
      { rel: '신랑', name: '이창용', bank: '우리', no: '1002660395229' },
      { rel: '아버지', name: '이채민', bank: '농협', no: '171489-52-090617' },
      { rel: '어머니', name: '정규택', bank: '농협', no: '351-0816-6417-53' }
    ],
    '신부측': [
      { rel: '신부', name: '백지원', bank: '토스', no: '1000-9180-4180' },
      { rel: '아버지', name: '백승진', bank: '농협', no: '106-02-187698' },
      { rel: '어머니', name: '전태자', bank: '농협', no: '225041-52-162284' }
    ]
  };

  const contacts = [
    { rel: '신랑', name: '이창용', phone: '010-5194-1629' },
    { rel: '신랑 아버지', name: '이채민', phone: '010-2698-1629' },
    { rel: '신랑 어머니', name: '정순애', phone: '010-5193-1629' },
    { rel: '신부', name: '백지원', phone: '010-2379-4112' },
    { rel: '신부 아버지', name: '백승진', phone: '010-3742-9334' },
    { rel: '신부 어머니', name: '전태자', phone: '010-8885-4112' }
  ];

  const transitInfo = [
    {
      title: '지하철 이용시',
      lines: ['서울 5호선 강동역 하차 &middot; 3번출구 바로 앞']
    },
    {
      title: '버스 이용시',
      lines: [
        '강동역 하차',
        '간선버스(파랑) &middot; 130, 341, 342, 370',
        '지선버스(초록) &middot; 3214, 3316',
        '직행버스(빨강) &middot; 1113, 1113-1',
        '일반버스(초록) &middot; 1-4, 30-3, 112-1, 112-5',
        '공항버스 &middot; 6200(길동사거리 하차)'
      ]
    },
    {
      title: '주차안내',
      lines: [
        '건물 내 (지하1층 ~ 지하3층)',
        '옥외주차장 및 지하철 환승 주차장 이용 (1시간 30분 무료)'
      ]
    }
  ];

  const pad = (n) => String(n).padStart(2, '0');

  const ICON_COPY = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  function renderCalendar() {
    const grid = document.getElementById('calGrid');
    const firstWeekday = 2; // Dec 1, 2026 is a Tuesday
    const cells = [];
    for (let i = 0; i < 35; i++) {
      const day = i - firstWeekday + 1;
      const inMonth = day >= 1 && day <= 31;
      const marked = day === 12;
      const sunday = i % 7 === 0;

      const cell = document.createElement('div');
      cell.className = 'cal-cell' + (marked ? ' marked' : '') + (!inMonth ? ' empty' : sunday ? ' sun' : '');
      const span = document.createElement('span');
      span.textContent = inMonth ? String(day) : '';
      cell.appendChild(span);
      cells.push(cell);
    }
    grid.append(...cells);
  }

  function renderCountdown() {
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  function tickCountdown() {
    const diff = Math.max(0, WEDDING_DATE - Date.now());
    const dd = Math.floor(diff / 86400000);
    const hh = Math.floor(diff / 3600000) % 24;
    const mm = Math.floor(diff / 60000) % 60;
    const ss = Math.floor(diff / 1000) % 60;
    document.getElementById('cd-days').textContent = pad(dd);
    document.getElementById('cd-hrs').textContent = pad(hh);
    document.getElementById('cd-min').textContent = pad(mm);
    document.getElementById('cd-sec').textContent = pad(ss);
    document.getElementById('countdownDday').textContent = String(dd);
  }

  // webp only - it's the only format actually shipped in assets/ now.
  const GALLERY_EXTS = ['webp'];

  function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    galleryLabels.forEach((label) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'gallery-tile';
      tile.setAttribute('aria-label', `갤러리 사진 ${label} 크게 보기`);

      const placeholder = document.createElement('span');
      placeholder.className = 'gallery-tile-label';
      placeholder.textContent = label;
      tile.appendChild(placeholder);

      const img = document.createElement('img');
      img.alt = `갤러리 사진 ${label}`;
      // Not lazy: photo 01 needs to be ready to auto-open into the
      // expand panel right away on page load (see the load listener
      // below), and the rest are tiny optimized files anyway - loading
      // all 9 eagerly costs little and keeps prev/next usable early.
      let extIndex = 0;
      img.addEventListener('error', () => {
        extIndex += 1;
        if (extIndex < GALLERY_EXTS.length) {
          img.src = `assets/gallery-${label}.${GALLERY_EXTS[extIndex]}`;
        } else {
          img.remove();
        }
      });
      img.addEventListener('load', () => {
        tile.classList.add('has-image');
        // Default state: the first photo is shown expanded from the
        // moment its image is ready, with no click required.
        if (label === galleryLabels[0] && !hasAutoOpenedGallery) {
          hasAutoOpenedGallery = true;
          showGalleryTile(tile, { scroll: false });
        }
      });
      img.src = `assets/gallery-${label}.${GALLERY_EXTS[extIndex]}`;
      tile.appendChild(img);

      tile.addEventListener('click', () => {
        if (tile.classList.contains('has-image')) showGalleryTile(tile);
      });

      grid.appendChild(tile);
    });
  }

  function renderAccounts() {
    const wrap = document.getElementById('accounts');
    Object.entries(accountsData).forEach(([side, rows]) => {
      const group = document.createElement('div');
      group.className = 'account-group';

      const header = document.createElement('button');
      header.type = 'button';
      header.className = 'account-header';
      header.innerHTML = `<span>${side}</span><span class="caret">열기 +</span>`;

      const rowsEl = document.createElement('div');
      rowsEl.className = 'account-rows collapsed';
      rows.forEach((r) => {
        const row = document.createElement('div');
        row.className = 'account-row';
        row.innerHTML = `
          <div class="who">${r.rel} &middot; ${r.name}</div>
          <div class="account-row-bottom">
            <div class="bank">${r.bank} ${r.no}</div>
            <button type="button" class="copy-btn pill-btn">${ICON_COPY}<span>복사</span></button>
          </div>
        `;
        row.querySelector('.copy-btn').addEventListener('click', () => {
          copyToClipboard(r.no);
        });
        rowsEl.appendChild(row);
      });

      header.addEventListener('click', () => {
        const open = !rowsEl.classList.contains('collapsed');
        rowsEl.classList.toggle('collapsed', open);
        header.querySelector('.caret').textContent = open ? '열기 +' : '닫기 −';
      });

      group.append(header, rowsEl);
      wrap.appendChild(group);
    });
  }

  function renderContacts() {
    const wrap = document.getElementById('contactList');
    contacts.forEach((p) => {
      const digits = p.phone.replace(/-/g, '');
      const row = document.createElement('div');
      row.className = 'contact-row';
      row.innerHTML = `
        <span class="contact-label">${p.rel}</span>
        <span class="contact-name">${p.name}</span>
        <div class="contact-actions">
          <a href="tel:${digits}" class="pill-btn">CALL</a>
          <a href="sms:${digits}" class="pill-btn">SMS</a>
        </div>
      `;
      wrap.appendChild(row);
    });
  }

  function renderTransitAccordion() {
    const wrap = document.getElementById('transitAccordion');
    if (!wrap) return;
    transitInfo.forEach((item) => {
      const group = document.createElement('div');
      group.className = 'account-group';

      const header = document.createElement('button');
      header.type = 'button';
      header.className = 'account-header';
      header.innerHTML = `<span>${item.title}</span><span class="caret">열기 +</span>`;

      const body = document.createElement('div');
      body.className = 'account-rows collapsed';
      item.lines.forEach((line) => {
        const row = document.createElement('div');
        row.className = 'account-row transit-line';
        row.innerHTML = line;
        body.appendChild(row);
      });

      header.addEventListener('click', () => {
        const open = !body.classList.contains('collapsed');
        body.classList.toggle('collapsed', open);
        header.querySelector('.caret').textContent = open ? '열기 +' : '닫기 −';
      });

      group.append(header, body);
      wrap.appendChild(group);
    });
  }

  // ---------- gallery expand (in-page, below the grid) ----------
  // A panel permanently pinned right under the gallery grid (not a
  // fullscreen overlay, and never closed) - it shows photo 01 by
  // default and swaps to whichever tile is tapped. Prev/next (always
  // visible) cycle through all 9 photos, wrapping in either direction.
  // The currently-shown tile is tracked by identity, and the loaded-tile
  // list is re-queried fresh on every prev/next rather than cached, so
  // navigation still lands on the right photo even if it's used before
  // every one of the 9 images has finished loading in.
  let currentGalleryTile = null;
  let hasAutoOpenedGallery = false;

  function showGalleryTile(tile, { scroll = true } = {}) {
    const expand = document.getElementById('galleryExpand');
    const expandImg = document.getElementById('galleryExpandImg');
    const gridImg = tile.querySelector('img');
    if (!expand || !expandImg || !gridImg) return;

    currentGalleryTile = tile;
    expandImg.src = gridImg.src;
    expandImg.alt = gridImg.alt;
    updateGalleryActiveTile();

    // The default auto-open on page load must not yank the page down to
    // the gallery section - only a user-initiated tile click scrolls.
    if (scroll) {
      expand.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function updateGalleryActiveTile() {
    document.querySelectorAll('.gallery-tile.is-active').forEach((t) => t.classList.remove('is-active'));
    if (currentGalleryTile) currentGalleryTile.classList.add('is-active');
  }

  function showGalleryPhoto(step) {
    const tiles = Array.from(document.querySelectorAll('.gallery-tile.has-image'));
    if (tiles.length === 0) return;
    const curIdx = tiles.indexOf(currentGalleryTile);
    const baseIdx = curIdx === -1 ? 0 : curIdx;
    const nextIdx = ((baseIdx + step) % tiles.length + tiles.length) % tiles.length; // circular wrap
    const tile = tiles[nextIdx];
    const gridImg = tile.querySelector('img');
    const expandImg = document.getElementById('galleryExpandImg');

    currentGalleryTile = tile;
    updateGalleryActiveTile();
    expandImg.classList.add('is-switching');
    setTimeout(() => {
      expandImg.src = gridImg.src;
      expandImg.alt = gridImg.alt;
      requestAnimationFrame(() => expandImg.classList.remove('is-switching'));
    }, 160);
  }

  function initGalleryExpand() {
    const expand = document.getElementById('galleryExpand');
    const prevBtn = document.getElementById('galleryExpandPrev');
    const nextBtn = document.getElementById('galleryExpandNext');
    if (!expand || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', () => showGalleryPhoto(-1));
    nextBtn.addEventListener('click', () => showGalleryPhoto(1));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') showGalleryPhoto(1);
      else if (e.key === 'ArrowLeft') showGalleryPhoto(-1);
    });

    // Touch swipe, for the mobile frame.
    let touchStartX = null;
    let touchStartY = null;
    expand.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    expand.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;
      const SWIPE_THRESHOLD = 40;
      // Ignore mostly-vertical drags so a scroll attempt doesn't get
      // mistaken for a swipe.
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) showGalleryPhoto(1);
      else showGalleryPhoto(-1);
    });
  }

  // ---------- location: map sketch fallback ----------
  function initLocationSketch() {
    const img = document.getElementById('locationSketchImg');
    if (!img) return;
    img.addEventListener('error', () => {
      const figure = img.closest('.location-sketch');
      if (figure) figure.hidden = true;
    });
  }

  // ---------- kakao map embed: scale the fixed 640x360 widget to fit ----------
  function initKakaoMap() {
    const wrap = document.getElementById('mapEmbed');
    const inner = document.getElementById('mapEmbedInner');
    if (!wrap || !inner) return;

    const MAP_W = 640;
    const MAP_H = 360;

    function rescale() {
      const scale = wrap.clientWidth / MAP_W;
      inner.style.transform = `scale(${scale})`;
      wrap.style.height = Math.round(MAP_H * scale) + 'px';
    }

    rescale();
    // Roughmap renders itself asynchronously into the container, and the
    // wrapper's width can change with layout/fonts settling in, so
    // rescale again shortly after in addition to watching for resizes.
    setTimeout(rescale, 400);
    setTimeout(rescale, 1200);
    window.addEventListener('resize', rescale);
    if (window.ResizeObserver) {
      new ResizeObserver(rescale).observe(wrap);
    }
  }

  // ---------- clipboard copy + toast ----------
  let toastTimer = null;

  function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast('복사되었습니다');
    } catch (err) {
      showToast('복사에 실패했습니다');
    }
    document.body.removeChild(ta);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => showToast('복사되었습니다'))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function seededRandom(i, seed, k) {
    const x = Math.sin((i + 1) * seed * k) * 10000;
    return x - Math.floor(x);
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function flakeSvg(color) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('stroke', color);
    svg.setAttribute('stroke-width', '3.2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('fill', 'none');
    const lines = [
      [50, 50, 50, 8], [50, 18, 40, 10], [50, 18, 60, 10],
      [50, 28, 38, 19], [50, 28, 62, 19], [50, 39, 41, 32], [50, 39, 59, 32]
    ];
    for (let a = 0; a < 6; a++) {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('transform', `rotate(${a * 60} 50 50)`);
      lines.forEach(([x1, y1, x2, y2]) => {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        g.appendChild(line);
      });
      svg.appendChild(g);
    }
    return svg;
  }

  // Pausing the CSS animations (rather than removing/re-adding the
  // flakes) means they resume exactly where they left off, with no
  // restart jump, and costs nothing while paused - no rAF loop, no
  // timers, the animations are simply frozen by the browser.
  function setSnowfieldPlaying(playing) {
    const field = document.getElementById('snowfield');
    if (field) field.classList.toggle('is-paused', !playing);
  }

  // The only thing that still pauses the snowfall: the browser tab
  // going into the background. It no longer pauses just because the
  // intro section scrolls out of view - the snow is meant to keep
  // falling across every section now, not only near the top.
  function initSnowTabPause() {
    if (typeof document.hidden === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      setSnowfieldPlaying(!document.hidden);
    });
  }

  function renderSnow() {
    const field = document.getElementById('snowfield');
    // Trimmed from 30, then again from 22: now that .snowfield is
    // position: fixed and visible on screen continuously (not just
    // during the intro section), these ~44 DOM nodes (each flake plus
    // its sway wrapper) stay in the compositor for the whole time the
    // page is open, not just one screen's worth of scrolling - fewer of
    // them keeps that steady-state cost low on real mobile hardware
    // while still reading as a steady snowfall.
    const n = 16;
    const color = '#E7EEF4';
    const seed = 51.7742;
    const sizeMin = 1.8, sizeMax = 5;
    // .snowfield is now sized to the actual on-screen box (the full
    // viewport on a phone, or the framed mock's own height on desktop)
    // rather than the old page-height-tall absolute box, so the fall
    // distance is derived from that real height instead of a constant
    // tuned for the previous, much taller box - a flake now clears the
    // bottom edge and loops back to the top roughly once per pass
    // through the visible area, instead of spending most of its cycle
    // invisible below the fold.
    const fall = Math.ceil(field.getBoundingClientRect().height || window.innerHeight) + 60;
    // ~25% slower than the base formula below, so the fall still reads as
    // snow (not floating) while feeling a touch gentler.
    const SPEED_FACTOR = 1.25;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const r = (k) => seededRandom(i, seed, k);
      const crystal = r(8.9) > 0.42;
      const size = crystal
        ? sizeMax * 1.6 + r(1.3) * sizeMax * 2.4
        : sizeMin * 0.6 + r(1.3) * sizeMin;

      // Outer element: position + fall/fade only (both transform/opacity,
      // GPU-composited). Sway lives on the nested element below instead
      // of animating this element's margin, which would force a reflow
      // every frame.
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.style.left = (r(2.1) * 100) + '%';
      flake.style.width = size + 'px';
      flake.style.height = size + 'px';
      // Peak opacity while falling (omFade fades in/out around this) -
      // each flake keeps its own brightness variance.
      flake.style.setProperty('--flake-opacity', crystal ? 0.3 + r(3.7) * 0.55 : 0.25 + r(3.7) * 0.45);
      flake.style.setProperty('--om-fall', fall + 'px');
      const fallDur = ((crystal ? 13 : 9) + r(4.4) * 11) * SPEED_FACTOR;
      const fallDelay = -r(5.2) * 16;
      const swayDur = 3 + r(6.1) * 5;
      // omFade shares the exact same duration/delay as omFall so the
      // fade-out is pinned to a fixed point in the fall's own distance
      // (not an independent clock) - see the comment on the omFade
      // keyframes for why that matters.
      flake.style.animationDuration = `${fallDur}s, ${fallDur}s`;
      flake.style.animationDelay = `${fallDelay}s, ${fallDelay}s`;

      const sway = document.createElement('div');
      sway.className = 'snowflake-sway';
      sway.style.borderRadius = crystal ? '0' : '50%';
      sway.style.background = crystal ? 'none' : color;
      sway.style.animationDuration = swayDur + 's';
      if (crystal) sway.appendChild(flakeSvg(color));
      flake.appendChild(sway);

      frag.appendChild(flake);
    }
    field.appendChild(frag);
  }

  // ---------- scroll reveal ----------
  // Each main section (.reveal, added in index.html) fades and slides
  // up the first time it appears. IntersectionObserver + a CSS
  // transition rather than AOS.js or a similar library: the whole
  // effect is opacity/transform only (both GPU-composited, no
  // layout/paint cost) and this page already runs the snowfall and
  // countdown continuously, so avoiding a library's parse/init cost and
  // its own scroll/resize listeners is worth more here than what a
  // library would add on top of what a ~20-line observer already does.
  //
  // Shared by both triggers below: applies the same .is-visible
  // transition and the same will-change lifecycle (added right before
  // the transition starts, removed once it ends) whether the reveal was
  // triggered by scrolling a section into view or by the intro's
  // load-time trigger.
  function revealOnce(el) {
    el.style.willChange = 'transform, opacity';
    el.classList.add('is-visible');
    el.addEventListener('transitionend', function onDone(e) {
      // Event bubbles - ignore a child's own transition (e.g. a
      // button hover) finishing and only react to this element's.
      if (e.target !== el) return;
      el.style.willChange = '';
      el.removeEventListener('transitionend', onDone);
    });
  }

  // The intro is visible from the very first frame (nothing to scroll
  // to), so it's excluded here and given its own load-time trigger
  // instead - see initIntroReveal.
  function initScrollReveal() {
    const targets = Array.from(document.querySelectorAll('.reveal:not(.intro-section)'));
    if (targets.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      // No animation to run either way - reveal everything as-is rather
      // than leaving it permanently hidden behind the base opacity: 0.
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealOnce(entry.target);
          // One-shot: once a section has appeared, stop watching it so
          // scrolling back up and down again never re-triggers it.
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    targets.forEach((el) => observer.observe(el));
  }

  // The intro reuses the same .reveal/.is-visible CSS as the other
  // sections, but there's nothing to scroll to trigger it with - it's
  // on screen from the first frame. Instead it fires once fonts and the
  // rest of the page's resources (the lace photo especially) are
  // loaded, so the fade-in lands on a fully-settled frame rather than
  // the type or photo visibly popping in a beat after it starts. A
  // short timeout caps how long that wait can stretch, in case some
  // unrelated resource (e.g. the Kakao map script) is slow.
  function initIntroReveal() {
    const intro = document.querySelector('.intro-section.reveal');
    if (!intro) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      intro.classList.add('is-visible');
      return;
    }

    const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
    const pageReady = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
    const timeout = new Promise((resolve) => setTimeout(resolve, 2000));

    Promise.race([Promise.all([fontsReady, pageReady]), timeout]).then(() => revealOnce(intro));
  }

  // ---------- pinch/double-tap zoom guard ----------
  // The viewport meta's maximum-scale=1/user-scalable=no blocks pinch
  // zoom, but iOS Safari has long ignored that for double-tap zoom
  // specifically. The standard workaround: if a touchend fires within
  // 300ms of the previous one, treat it as a double-tap and cancel its
  // default action before Safari can turn it into a zoom. This doesn't
  // stopPropagation, so it never interferes with other touch handlers
  // (e.g. the gallery-expand swipe listeners) - it only cancels the
  // browser's own zoom/synthetic-click behavior for that touch.
  function initDoubleTapZoomGuard() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }

  renderCalendar();
  renderCountdown();
  renderGallery();
  renderAccounts();
  renderContacts();
  renderTransitAccordion();
  renderSnow();
  initGalleryExpand();
  initLocationSketch();
  initKakaoMap();
  initSnowTabPause();
  initScrollReveal();
  initIntroReveal();
  initDoubleTapZoomGuard();
})();
