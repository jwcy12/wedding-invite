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
    { rel: '신랑 어머니', name: '정규택', phone: '010-5193-1629' },
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
      lines: ['건물 지하 2~4층, 2시간 무료']
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

  // Ring geometry shared by all four countdown dials.
  const CD_RING_R = 30;
  const CD_RING_CIRC = 2 * Math.PI * CD_RING_R;
  // The DAYS ring has no natural cycle length like hours/minutes/seconds
  // do, so its "full" reference is the total day-count captured once at
  // load time - the ring then reads as "how much of the whole wait is
  // left," slowly draining to empty as the date approaches.
  let cdDaysTotal = 1;

  function renderCountdown() {
    const el = document.getElementById('countdown');
    const units = [
      { key: 'DAYS', id: 'cd-days' },
      { key: 'HRS', id: 'cd-hrs' },
      { key: 'MIN', id: 'cd-min' },
      { key: 'SEC', id: 'cd-sec' }
    ];
    units.forEach((u) => {
      const unit = document.createElement('div');
      unit.className = 'cd-unit';

      const ringWrap = document.createElement('div');
      ringWrap.className = 'cd-ring-wrap';

      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('class', 'cd-ring');
      svg.setAttribute('viewBox', '0 0 72 72');

      const track = document.createElementNS(SVG_NS, 'circle');
      track.setAttribute('class', 'cd-ring-track');
      track.setAttribute('cx', '36');
      track.setAttribute('cy', '36');
      track.setAttribute('r', String(CD_RING_R));

      const progress = document.createElementNS(SVG_NS, 'circle');
      progress.setAttribute('class', 'cd-ring-progress');
      progress.setAttribute('cx', '36');
      progress.setAttribute('cy', '36');
      progress.setAttribute('r', String(CD_RING_R));
      progress.setAttribute('id', `${u.id}-ring`);
      progress.style.strokeDasharray = String(CD_RING_CIRC);
      progress.style.strokeDashoffset = '0';

      svg.append(track, progress);

      const val = document.createElement('div');
      val.className = 'cd-val';
      val.id = u.id;

      ringWrap.append(svg, val);

      const key = document.createElement('div');
      key.className = 'cd-key';
      key.textContent = u.key;

      unit.append(ringWrap, key);
      el.appendChild(unit);
    });

    cdDaysTotal = Math.max(1, Math.ceil((WEDDING_DATE - Date.now()) / 86400000));
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  function setRing(id, fraction) {
    const ring = document.getElementById(`${id}-ring`);
    if (!ring) return;
    const clamped = Math.max(0, Math.min(1, fraction));
    ring.style.strokeDashoffset = String(CD_RING_CIRC * (1 - clamped));
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
    setRing('cd-days', dd / cdDaysTotal);
    setRing('cd-hrs', hh / 24);
    setRing('cd-min', mm / 60);
    setRing('cd-sec', ss / 60);
  }

  // webp first (the optimized files actually in assets/) - jpg/jpeg/png
  // stay as a fallback chain in case a future photo gets dropped in
  // without being converted.
  const GALLERY_EXTS = ['webp', 'jpg', 'jpeg', 'png'];

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
      img.loading = 'lazy';
      let extIndex = 0;
      img.addEventListener('error', () => {
        extIndex += 1;
        if (extIndex < GALLERY_EXTS.length) {
          img.src = `assets/gallery-${label}.${GALLERY_EXTS[extIndex]}`;
        } else {
          img.remove();
        }
      });
      img.addEventListener('load', () => tile.classList.add('has-image'));
      img.src = `assets/gallery-${label}.${GALLERY_EXTS[extIndex]}`;
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

  // ---------- gallery lightbox ----------
  // Shared-element open/close morph uses the View Transitions API when
  // available: the same view-transition-name is handed off between the
  // clicked grid thumbnail and the fullscreen lightbox image, so the
  // browser interpolates position/size between them automatically. On
  // browsers without support, startViewTransition is simply absent and
  // the DOM mutation just runs immediately - open/close still work,
  // there's just no morph.
  const GALLERY_VT_NAME = 'gallery-active';
  let lightboxTiles = [];
  let lightboxIndex = -1;

  function withViewTransition(mutate) {
    if (typeof document.startViewTransition === 'function') {
      const transition = document.startViewTransition(mutate);
      // The transition can reject (e.g. it gets interrupted by another
      // one starting) independent of whether the DOM mutation itself
      // succeeded - swallow that so it doesn't surface as an unhandled
      // rejection; there's nothing more to do about it either way.
      transition.ready.catch(() => {});
      transition.finished.catch(() => {});
    } else {
      mutate();
    }
  }

  function updateLightboxNavVisibility() {
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const multiple = lightboxTiles.length > 1;
    if (prevBtn) prevBtn.hidden = !multiple;
    if (nextBtn) nextBtn.hidden = !multiple;
  }

  function openLightbox(tile) {
    const tiles = Array.from(document.querySelectorAll('.gallery-tile.has-image'));
    const idx = tiles.indexOf(tile);
    if (idx === -1) return;
    lightboxTiles = tiles;
    lightboxIndex = idx;

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const gridImg = tile.querySelector('img');
    if (!gridImg) return;

    // The grid thumbnail "owns" the shared name right up to the moment
    // the transition captures the old state.
    gridImg.style.viewTransitionName = GALLERY_VT_NAME;

    withViewTransition(async () => {
      // Hand the name off to the lightbox image for the new state, so
      // exactly one element claims it in each snapshot phase.
      gridImg.style.viewTransitionName = '';
      lightboxImg.style.viewTransitionName = GALLERY_VT_NAME;
      lightboxImg.src = gridImg.src;
      lightboxImg.alt = gridImg.alt;
      lightbox.hidden = false;
      updateLightboxNavVisibility();
      // The new state is snapshotted on the next frame after this
      // callback settles - without waiting for the freshly-assigned src
      // to actually decode, that snapshot can catch the image at 0x0
      // and the transition fails to capture it.
      try { await lightboxImg.decode(); } catch (err) { /* no-op */ }
    });
  }

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.hidden) return;
    const lightboxImg = document.getElementById('lightboxImg');
    const tile = lightboxTiles[lightboxIndex];
    const gridImg = tile ? tile.querySelector('img') : null;

    withViewTransition(async () => {
      lightboxImg.style.viewTransitionName = '';
      if (gridImg) {
        gridImg.style.viewTransitionName = GALLERY_VT_NAME;
        try { await gridImg.decode(); } catch (err) { /* no-op */ }
      }
      lightbox.hidden = true;
      lightboxImg.src = '';
    });

    lightboxTiles = [];
    lightboxIndex = -1;
  }

  // Prev/next deliberately skip the shared-element morph (it should
  // only happen once, on open/close) - just a quick opacity crossfade
  // of the image content while it stays fullscreen in place.
  function showLightboxPhoto(step) {
    const n = lightboxTiles.length;
    if (n === 0) return;
    lightboxIndex = ((lightboxIndex + step) % n + n) % n; // circular wrap
    const tile = lightboxTiles[lightboxIndex];
    const gridImg = tile.querySelector('img');
    const lightboxImg = document.getElementById('lightboxImg');

    lightboxImg.classList.add('is-switching');
    setTimeout(() => {
      lightboxImg.src = gridImg.src;
      lightboxImg.alt = gridImg.alt;
      requestAnimationFrame(() => lightboxImg.classList.remove('is-switching'));
    }, 160);
  }

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => showLightboxPhoto(-1));
    nextBtn.addEventListener('click', () => showLightboxPhoto(1));

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
      // Ignore mostly-vertical drags so a scroll attempt doesn't get
      // mistaken for a swipe.
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

  function initKakaoMapButton() {
    const btn = document.getElementById('kakaoMapBtn');
    const target = document.getElementById('mapEmbed');
    if (!btn || !target) return;
    btn.addEventListener('click', () => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('map-embed--highlight');
      setTimeout(() => target.classList.remove('map-embed--highlight'), 1200);
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

  // ---------- intro-section snow pile ----------
  // Grows a thin bar pinned to the bottom of the intro section every time a
  // snowflake's fall animation loops back to the top ("lands"), as a rough
  // stand-in for real accumulation physics. Capped, and resets on reload
  // since nothing here is persisted.
  const SNOW_PILE_MAX_PX = 44;
  const SNOW_PILE_STEP_PX = 0.85;
  let snowPileHeight = 0;

  // The pile->burst effect only ever happens once per page load: after
  // the first dispersal, both growing and bursting are permanently
  // retired (guarded below), even though the intro section can still be
  // scrolled in and out of view many more times. The base falling-snow
  // animation is NOT gated by this flag - it keeps pausing/resuming with
  // visibility for as long as the page is open (see
  // initIntroVisibilityObserver).
  let hasSnowDispersed = false;

  function growSnowPile() {
    if (hasSnowDispersed) return;
    if (snowPileHeight >= SNOW_PILE_MAX_PX) return;
    snowPileHeight = Math.min(SNOW_PILE_MAX_PX, snowPileHeight + SNOW_PILE_STEP_PX);
    const pile = document.getElementById('snowPile');
    if (pile) pile.style.height = snowPileHeight + 'px';
  }

  // Scatters the current pile into a burst of small particles the moment
  // the intro section starts scrolling out of view, then resets it to 0.
  // Runs at most once (see hasSnowDispersed above) - it does not pile up
  // and burst again on later visits to the intro section.
  const SNOW_BURST_PARTICLES = 20;

  function burstSnowPile() {
    if (hasSnowDispersed) return;
    const pile = document.getElementById('snowPile');
    const intro = document.querySelector('.intro-section');
    if (!pile || !intro || snowPileHeight <= 0) return;

    // Set before spawning anything, not after: this is what makes the
    // effect one-shot even if the observer fires again (e.g. more
    // "ratio < 1" entries) while this burst is still mid-animation.
    hasSnowDispersed = true;

    const pileWidth = pile.getBoundingClientRect().width;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < SNOW_BURST_PARTICLES; i++) {
      const particle = document.createElement('div');
      particle.className = 'snow-burst-particle';
      // Sized like the falling snowflakes themselves, not bigger - a
      // burst of same-scale flakes reads as "scattered", oversized dots
      // read as "confetti".
      const size = 1.6 + Math.random() * 3;
      // Mostly-sideways drift with only a faint upward lift, like a
      // gust catching loose snow - no full-circle "explosion" vectors,
      // and never drifting downward.
      const dx = (Math.random() * 2 - 1) * 24;
      const dy = -(3 + Math.random() * 12);
      particle.style.left = (Math.random() * pileWidth) + 'px';
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.setProperty('--burst-dx', dx + 'px');
      particle.style.setProperty('--burst-dy', dy + 'px');
      particle.style.animationDuration = (0.65 + Math.random() * 0.35) + 's';
      particle.style.animationDelay = (Math.random() * 0.08) + 's';
      frag.appendChild(particle);
    }
    intro.appendChild(frag);

    // Collapse the bar itself quickly (overriding its normal slow-growth
    // transition) while the particles fly, instead of leaving a flat
    // block sitting there until the particles finish.
    pile.style.transition = 'height .3s ease-in, opacity .3s ease-in';
    pile.style.opacity = '0';
    pile.style.height = '0px';
    snowPileHeight = 0;

    setTimeout(() => {
      intro.querySelectorAll('.snow-burst-particle').forEach((el) => el.remove());
      pile.style.transition = '';
      pile.style.opacity = '';
    }, 1150); // safely past the longest particle duration (~1s) + its delay
  }

  // Pausing the CSS animations (rather than removing/re-adding the
  // flakes) means they resume exactly where they left off, with no
  // restart jump, and costs nothing while paused - no rAF loop, no
  // timers, the animations are simply frozen by the browser.
  function setSnowfieldPlaying(playing) {
    const field = document.getElementById('snowfield');
    if (field) field.classList.toggle('is-paused', !playing);
  }

  function initIntroVisibilityObserver() {
    const intro = document.querySelector('.intro-section');
    if (!intro || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Rule 1 (every time): the falling-snow animation only runs
          // while the intro section is at least partly on screen - nothing
          // to see, no reason to keep ~44 elements (22 flakes + their sway
          // wrappers) animating off-screen.
          setSnowfieldPlaying(entry.isIntersecting);

          // Rule 2 (once ever): any drop below fully-visible means the
          // section has started leaving. burstSnowPile/growSnowPile are
          // themselves guarded by hasSnowDispersed, so this trigger firing
          // repeatedly on later visits is harmless - only the first call
          // that finds a non-empty pile actually does anything.
          if (entry.intersectionRatio < 1) burstSnowPile();
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 0.99, 1] }
    );
    observer.observe(intro);
  }

  function renderSnow() {
    const field = document.getElementById('snowfield');
    // Trimmed from 30 - fewer permanently-animating elements to composite
    // on real mobile hardware, while still reading as a steady snowfall.
    const n = 22;
    const color = '#E7EEF4';
    const seed = 51.7742;
    const sizeMin = 1.8, sizeMax = 5;
    const fall = 3600;
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
      flake.style.opacity = crystal ? 0.3 + r(3.7) * 0.55 : 0.25 + r(3.7) * 0.45;
      flake.style.setProperty('--om-fall', fall + 'px');
      const fallDur = ((crystal ? 13 : 9) + r(4.4) * 11) * SPEED_FACTOR;
      const fallDelay = -r(5.2) * 16;
      const swayDur = 3 + r(6.1) * 5;
      const fadeDur = 4 + r(7.3) * 5;
      flake.style.animationDuration = `${fallDur}s, ${fadeDur}s`;
      flake.style.animationDelay = `${fallDelay}s, 0s`;

      const sway = document.createElement('div');
      sway.className = 'snowflake-sway';
      sway.style.borderRadius = crystal ? '0' : '50%';
      sway.style.background = crystal ? 'none' : color;
      sway.style.animationDuration = swayDur + 's';
      if (crystal) sway.appendChild(flakeSvg(color));
      flake.appendChild(sway);

      flake.addEventListener('animationiteration', (e) => {
        if (e.animationName === 'omFall') growSnowPile();
      });
      frag.appendChild(flake);
    }
    field.appendChild(frag);
  }

  renderCalendar();
  renderCountdown();
  renderGallery();
  renderAccounts();
  renderContacts();
  renderTransitAccordion();
  renderSnow();
  initLightbox();
  initLocationSketch();
  initKakaoMap();
  initKakaoMapButton();
  initIntroVisibilityObserver();
})();
