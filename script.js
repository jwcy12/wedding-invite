(() => {
  const WEDDING_DATE = new Date('2026-12-12T15:20:00+09:00').getTime();

  const galleryLabels = ['01', '02', '03', '04', '05', '06'];

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

  const pad = (n) => String(n).padStart(2, '0');

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
    const el = document.getElementById('countdown');
    const units = [
      { key: 'DAYS', id: 'cd-days' },
      { key: 'HRS', id: 'cd-hrs' },
      { key: 'MIN', id: 'cd-min' },
      { key: 'SEC', id: 'cd-sec' }
    ];
    units.forEach((u) => {
      const box = document.createElement('div');
      const val = document.createElement('div');
      val.className = 'cd-val';
      val.id = u.id;
      const key = document.createElement('div');
      key.className = 'cd-key';
      key.textContent = u.key;
      box.append(val, key);
      el.appendChild(box);
    });
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
  }

  const GALLERY_EXTS = ['jpg', 'jpeg', 'png'];

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
        if (tile.classList.contains('has-image')) openLightbox(img.src, img.alt);
      });

      grid.appendChild(tile);
    });
  }

  function renderAccounts() {
    const wrap = document.getElementById('accounts');
    Object.entries(accountsData).forEach(([side, rows]) => {
      const group = document.createElement('div');

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
            <button type="button" class="copy-btn">복사</button>
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
    const list = document.getElementById('contactList');
    contacts.forEach((p) => {
      const digits = p.phone.replace(/-/g, '');
      const row = document.createElement('div');
      row.className = 'contact-row';
      row.innerHTML = `
        <div><span class="who">${p.rel}</span>&nbsp;${p.name}</div>
        <div class="contact-actions">
          <a href="tel:${digits}">CALL</a>
          <a href="sms:${digits}">SMS</a>
        </div>
      `;
      list.appendChild(row);
    });
  }

  // ---------- gallery lightbox ----------
  function openLightbox(src, alt) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    img.src = src;
    img.alt = alt;
    lightbox.hidden = false;
  }

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    lightbox.hidden = true;
    img.src = '';
  }

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
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

  function growSnowPile() {
    if (snowPileHeight >= SNOW_PILE_MAX_PX) return;
    snowPileHeight = Math.min(SNOW_PILE_MAX_PX, snowPileHeight + SNOW_PILE_STEP_PX);
    const pile = document.getElementById('snowPile');
    if (pile) pile.style.height = snowPileHeight + 'px';
  }

  function renderSnow() {
    const field = document.getElementById('snowfield');
    const n = 30;
    const color = '#EAF2FA';
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
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.style.left = (r(2.1) * 100) + '%';
      flake.style.width = size + 'px';
      flake.style.height = size + 'px';
      flake.style.borderRadius = crystal ? '0' : '50%';
      flake.style.background = crystal ? 'none' : color;
      flake.style.opacity = crystal ? 0.3 + r(3.7) * 0.55 : 0.25 + r(3.7) * 0.45;
      flake.style.setProperty('--om-fall', fall + 'px');
      const fallDur = ((crystal ? 13 : 9) + r(4.4) * 11) * SPEED_FACTOR;
      const fallDelay = -r(5.2) * 16;
      const swayDur = 3 + r(6.1) * 5;
      const fadeDur = 4 + r(7.3) * 5;
      flake.style.animationDuration = `${fallDur}s, ${swayDur}s, ${fadeDur}s`;
      flake.style.animationDelay = `${fallDelay}s, 0s, 0s`;
      if (crystal) flake.appendChild(flakeSvg(color));
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
  renderSnow();
  initLightbox();
  initLocationSketch();
  initKakaoMap();
  initKakaoMapButton();
})();
