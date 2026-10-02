(() => {
  const WEDDING_DATE = new Date('2026-12-12T15:20:00+09:00').getTime();

  // Kakao "카카오톡 공유하기" feed card content. Kept in one place so the
  // title/description/image/URL used in the actual share card can't
  // drift from each other - but note this is a SEPARATE source from the
  // <meta property="og:..."> tags in index.html's <head> (the fallback
  // preview for a plain pasted link). There's no build step on this
  // static page to generate one from the other, so a wording change
  // here needs the same change made by hand in index.html's <head>.
  const SHARE_TITLE = '이창용 ♥ 백지원 결혼합니다.';
  const SHARE_DESCRIPTION = '2026년 12월 12일 토요일 오후 3시 20분\nKDW웨딩 3층 블랙스톤홀';
  const SHARE_IMAGE_URL = 'https://jwcy12.github.io/wedding-invite/assets/og-image.jpg';
  const SHARE_PAGE_URL = 'https://jwcy12.github.io/wedding-invite/';
  // "위치 보기" 버튼의 목적지는 카카오맵이 아니라 우리 자신의 도메인 안에
  // 있는 중계 페이지(location.html, 바로 옆에 있음)를 가리킨다. 처음엔
  // place.map.kakao.com(카카오 자체 도메인이니 당연히 괜찮을 거라 생각한
  // 평범한 https 페이지)을 직접 넣었는데도 버튼이 여전히 등록 사이트
  // 루트로 떨어졌다 - Kakao.Share.sendDefault의 buttons[].link는 카카오
  // 디벨로퍼스에 등록된 도메인 "밖"이면 딥링크든 평범한 페이지든 가리지
  // 않고 전부 걸러서 등록 도메인으로 대체하는 것으로 보임. 그래서 버튼
  // 링크 자체는 항상 jwcy12.github.io(등록된 도메인) 안의 경로만 가리키게
  // 하고, 실제 카카오맵 이동은 그 중계 페이지에서 한 번 더 일어나게 우회.
  const SHARE_MAP_URL = 'https://jwcy12.github.io/wedding-invite/location.html';

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

  // Two display-sized copies of each original (assets/gallery-NN.webp,
  // ~3000px, kept only as the source): -sm (480px short side) for the
  // grid and -lg (1600px long side) for the popup. Decoding nine
  // full-size originals at once costs hundreds of MB of image memory -
  // enough to get the page killed on older iPhones, especially inside
  // in-app browsers like KakaoTalk's.
  const galleryThumb = (label) => `assets/gallery-${label}-sm.webp`;
  const galleryFull = (label) => `assets/gallery-${label}-lg.webp`;

  function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    galleryLabels.forEach((label) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'gallery-tile';
      tile.setAttribute('aria-label', `갤러리 사진 ${label} 크게 보기`);
      tile.dataset.full = galleryFull(label);

      const placeholder = document.createElement('span');
      placeholder.className = 'gallery-tile-label';
      placeholder.textContent = label;
      tile.appendChild(placeholder);

      const img = document.createElement('img');
      img.alt = `갤러리 사진 ${label}`;
      // Not lazy: the lightbox's prev/next only cycles through tiles
      // whose image has loaded, so loading all 9 (small) thumbnails
      // eagerly keeps the full set reachable from the first tap.
      img.addEventListener('error', () => img.remove());
      img.addEventListener('load', () => {
        tile.classList.add('has-image');
      });
      img.src = galleryThumb(label);
      tile.appendChild(img);

      tile.addEventListener('click', () => {
        if (tile.classList.contains('has-image')) openLightbox(tile);
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

  // ---------- gallery lightbox (popup) ----------
  // Closed on page load; tapping a grid tile opens that photo in a
  // popup over a dimmed backdrop. Prev/next (buttons, arrow keys or a
  // horizontal swipe) cycle through all loaded photos, wrapping in
  // either direction. Close via the × button, a tap on the backdrop, or
  // Escape. The loaded-tile list is snapshotted on open, so the order
  // stays stable while the popup is showing.
  let lightboxTiles = [];
  let lightboxIndex = -1;
  let lightboxOpener = null;

  function setLightboxImage(tile) {
    const lightboxImg = document.getElementById('lightboxImg');
    const gridImg = tile.querySelector('img');
    lightboxImg.src = tile.dataset.full;
    lightboxImg.alt = gridImg.alt;
    preloadLightboxNeighbors();
  }

  // Warm the cache for the photos one step either side, so prev/next
  // swaps in an already-downloaded image instead of a blank frame.
  function preloadLightboxNeighbors() {
    const n = lightboxTiles.length;
    if (n < 2) return;
    [1, -1].forEach((step) => {
      const tile = lightboxTiles[((lightboxIndex + step) % n + n) % n];
      new Image().src = tile.dataset.full;
    });
  }

  function openLightbox(tile) {
    const tiles = Array.from(document.querySelectorAll('.gallery-tile.has-image'));
    const idx = tiles.indexOf(tile);
    if (idx === -1) return;
    lightboxTiles = tiles;
    lightboxIndex = idx;
    lightboxOpener = tile;

    const lightbox = document.getElementById('lightbox');
    setLightboxImage(tile);
    const multiple = tiles.length > 1;
    document.getElementById('lightboxPrev').hidden = !multiple;
    document.getElementById('lightboxNext').hidden = !multiple;
    lightbox.hidden = false;
    document.documentElement.classList.add('is-lightbox-open');
    document.getElementById('lightboxClose').focus({ preventScroll: true });
  }

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.documentElement.classList.remove('is-lightbox-open');
    document.getElementById('lightboxImg').src = '';
    lightboxTiles = [];
    lightboxIndex = -1;
    // Hand focus back to the tile that opened it, without scrolling.
    if (lightboxOpener) lightboxOpener.focus({ preventScroll: true });
    lightboxOpener = null;
  }

  // Quick opacity crossfade while the image source swaps.
  function showLightboxPhoto(step) {
    const n = lightboxTiles.length;
    if (n < 2) return;
    lightboxIndex = ((lightboxIndex + step) % n + n) % n; // circular wrap
    const tile = lightboxTiles[lightboxIndex];
    const lightboxImg = document.getElementById('lightboxImg');

    lightboxImg.classList.add('is-switching');
    setTimeout(() => {
      setLightboxImage(tile);
      requestAnimationFrame(() => lightboxImg.classList.remove('is-switching'));
    }, 160);
  }

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    if (!lightbox || !closeBtn || !prevBtn || !nextBtn) return;

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => showLightboxPhoto(-1));
    nextBtn.addEventListener('click', () => showLightboxPhoto(1));

    // A tap on the dimmed backdrop (not the photo or its buttons) closes.
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') showLightboxPhoto(1);
      else if (e.key === 'ArrowLeft') showLightboxPhoto(-1);
    });

    // Touch swipe, for the mobile frame.
    let touchStartX = null;
    let touchStartY = null;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;
      const SWIPE_THRESHOLD = 40;
      // Ignore mostly-vertical drags so they aren't mistaken for a swipe.
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) showLightboxPhoto(1);
      else showLightboxPhoto(-1);
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

  // ---------- kakao talk share ----------
  function initKakaoShare() {
    const btn = document.getElementById('kakaoShareBtn');
    if (!btn) return;

    // The SDK <script> tag in <head> is a blocking, synchronous load that
    // calls Kakao.init() right after - by the time this (script.js, at
    // the end of body) runs, window.Kakao is already loaded and
    // initialized, unless the request itself never completed (ad
    // blocker, offline, Kakao's CDN down). Either way there's nothing
    // the button can do then, so it explains that on tap instead of
    // silently doing nothing.
    if (!window.Kakao || !Kakao.isInitialized()) {
      btn.addEventListener('click', () => showToast('카카오톡 공유를 사용할 수 없습니다'));
      return;
    }

    btn.addEventListener('click', () => {
      // A fresh ?v=<timestamp> on every destination URL, regenerated on
      // each tap - a cache-buster against Kakao's own share-link
      // handling possibly keying off the exact URL string (so an
      // earlier, pre-fix share of this same URL can't keep surfacing a
      // stale cached card/button to a NEW recipient). This is separate
      // from, and doesn't fix, a tapping device's own browser cache of
      // script.js itself - that's governed by this file's URL
      // (unparameterized, in index.html's <script src="script.js">),
      // not by anything inside this payload.
      const bust = (url) => url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();
      const pageUrl = bust(SHARE_PAGE_URL);
      const mapUrl = bust(SHARE_MAP_URL);

      // TEMP DEBUG - remove once confirmed on a real phone (see chat for
      // context). Shows the exact "위치 보기" URL this specific device's
      // currently-running script.js is about to hand to Kakao, right
      // before the share sheet opens - if this already shows the wrong
      // value, the bug is this device's cached script.js, not the
      // deployed code (which has been verified correct from a clean
      // network load).
      alert('위치 보기 URL: ' + mapUrl);

      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: SHARE_TITLE,
          description: SHARE_DESCRIPTION,
          imageUrl: SHARE_IMAGE_URL,
          link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
        },
        buttons: [
          { title: '청첩장 보기', link: { mobileWebUrl: pageUrl, webUrl: pageUrl } },
          { title: '위치 보기', link: { mobileWebUrl: mapUrl, webUrl: mapUrl } },
        ],
      });
    });
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

  // For browsers/webviews without navigator.clipboard. iOS needs the
  // explicit setSelectionRange (select() alone selects nothing there),
  // readOnly keeps the keyboard from popping up, and a 16px font keeps
  // iOS from zooming in on focus. execCommand reports failure by
  // returning false rather than throwing, so both are checked.
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.readOnly = true;
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    ta.style.fontSize = '16px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(ta);
    showToast(ok ? '복사되었습니다' : '복사에 실패했습니다');
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

  // "링크주소 복사하기" next to the Kakao share button - same copy path
  // and toast as the account-number copy buttons above, just with the
  // page URL as the text instead of a bank account number.
  function initShareLinkCopy() {
    const btn = document.getElementById('copyLinkBtn');
    if (!btn) return;
    btn.addEventListener('click', () => copyToClipboard(SHARE_PAGE_URL));
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
      // threshold 0 (any overlap with the area above the bottom 8%)
      // rather than a percentage of the section: the closing line is a
      // short last section, and its reveal offset (translateY 60px)
      // kept most of it below that line even at max scroll, so a
      // percentage threshold could never be met and it stayed hidden.
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
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

  // Each step runs in isolation: if one throws (an API missing in some
  // older/in-app browser, say), the rest still run - most importantly
  // the reveal setup, without which every section would stay at the
  // hidden starting state of .reveal.
  [
    renderCalendar,
    renderCountdown,
    renderGallery,
    renderAccounts,
    renderContacts,
    renderTransitAccordion,
    renderSnow,
    initLightbox,
    initLocationSketch,
    initKakaoMap,
    initKakaoShare,
    initShareLinkCopy,
    initSnowTabPause,
    initScrollReveal,
    initIntroReveal
  ].forEach((step) => {
    try {
      step();
    } catch (err) {
      console.error(err);
    }
  });
})();
