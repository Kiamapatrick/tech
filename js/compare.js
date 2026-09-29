/* ============================================================
   goatedTech — Compare Page Logic (Apple-grade Experience)
   ============================================================ */
(function () {
  'use strict';

  const MAX_PHONES = 3;

  /* ── DOM Roots ─────────────────────────────────────── */
  const heroRoot       = document.getElementById('cmp-hero-root');
  const quicklookRoot  = document.getElementById('cmp-quicklook-root');
  const stickyNavRoot  = document.getElementById('cmp-sticky-nav-root');
  const stickyColsRoot = document.getElementById('cmp-sticky-columns-root');
  const tableRoot      = document.getElementById('cmp-table-root');

  /* ── Color Palette Map ─────────────────────────────── */
  const COLOR_MAP = {
    'black': '#1d1d1f', 'space black': '#1d1d1f', 'midnight': '#191f28',
    'graphite': '#3a3a3c', 'jet black': '#0a0a0c', 'white': '#f5f5f7',
    'cloud white': '#fafafc', 'starlight': '#f0eae1', 'silver': '#e2e2e6',
    'gold': '#f5dfbe', 'rose gold': '#ebd0ca', 'soft pink': '#fad7dc',
    'pink': '#f6cad1', 'blue': '#4a90d9', 'mist blue': '#9eb7d0',
    'sierra blue': '#9bb5ce', 'pacific blue': '#2d4e68', 'deep blue': '#2b3846',
    'ultramarine': '#395388', 'teal': '#367c7e', 'glacier': '#d7e2e8',
    'green': '#517a61', 'sage': '#98a892', 'yellow': '#fbe38e',
    'purple': '#8b7ca6', 'lavender': '#d1cbe0', 'red': '#c8252c',
    'coral': '#ee6755', 'cosmic orange': '#d95a2b', 'burgundy': '#5e2129',
    'space gray': '#535150', 'natural titanium': '#9f9587', 'blue titanium': '#3c4856',
    'white titanium': '#edebe7', 'black titanium': '#3c3b37', 'desert titanium': '#c4b5a0',
    'light gold': '#e9d6b4', 'sky blue': '#8ab5d6'
  };

  /* ── URL Helpers ───────────────────────────────────── */
  function getSelectedIds() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('ids') || '';
    const parsed = raw.split(',')
      .map(s => s.trim())
      .filter(id => id && PHONES.some(p => p.id === id))
      .slice(0, MAX_PHONES);

    // Default to iPhone 16 Pro vs iPhone 16 if no IDs provided
    if (parsed.length === 0) {
      return ['iphone-16-pro', 'iphone-16'];
    }
    return parsed;
  }

  function pushIds(ids) {
    const params = new URLSearchParams(window.location.search);
    if (ids.length) {
      params.set('ids', ids.join(','));
    } else {
      params.delete('ids');
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }

  /* ── Data Helpers ──────────────────────────────────── */
  function estMark(phone, path) {
    const v = phone._verified || {};
    return v[path] === false ? '<span class="cmp-win-badge" style="background:var(--surface-2);color:var(--muted)">est.</span>' : '';
  }

  function formatPrice(price) {
    if (price === null || price === undefined) return 'TBA';
    if (Array.isArray(price)) return '$' + price.map(p => p.toLocaleString()).join(' – ');
    return '$' + price.toLocaleString();
  }

  function numericVal(str) {
    if (!str || str === '-' || str === 'TBA') return null;
    const n = parseFloat(String(str).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : n;
  }

  function lowerIsBetter(label) {
    return /weight|price|thickness|depth|dims/i.test(label);
  }

  function calcBarPct(values, idx) {
    const nums = values.map(numericVal);
    const valid = nums.filter(n => n !== null);
    if (valid.length < 2) return 0;
    const max = Math.max(...valid);
    const val = nums[idx];
    if (val === null || max === 0) return 0;
    return Math.max(12, (val / max) * 100);
  }

  /* ── Swatch Renderer ───────────────────────────────── */
  function renderColorDots(colors) {
    if (!colors || !colors.length) return '';
    return colors.map(c => {
      const k = c.toLowerCase();
      const hex = COLOR_MAP[k] || '#d1d1d6';
      return `<span class="cmp-swatch-dot" style="background-color:${hex}" title="${c}"></span>`;
    }).join('');
  }

  function renderColorPills(colors) {
    if (!colors || !colors.length) return '-';
    return `<div class="cmp-color-pills">${colors.map(c => {
      const k = c.toLowerCase();
      const hex = COLOR_MAP[k] || '#d1d1d6';
      return `<span class="cmp-color-pill"><span class="cmp-color-pill-dot" style="background-color:${hex}"></span>${c}</span>`;
    }).join('')}</div>`;
  }

  /* ── Specification Data Builder ────────────────────── */
  function buildGroups(phones) {
    const isFoldable = phones.some(p => p.category === 'foldable');
    const groups = [];

    function addGroup(name, slug, rows) {
      const filtered = rows.filter(r => r.values.some(v => v !== '-' && v !== 'TBA' && v));
      if (filtered.length) {
        groups.push({ group: name, slug: slug, items: filtered });
      }
    }

    /* Display */
    addGroup('Display', 'display', [
      { label: 'Screen Size',       values: phones.map(p => p.display?.size ? `${p.display.size}″` : (p.display?.inner ? `Inner: ${p.display.inner}″, Outer: ${p.display.outer}″` : '-')), numeric: true },
      { label: 'Technology',        values: phones.map(p => p.display?.tech || '-'), numeric: false },
      { label: 'Resolution',        values: phones.map(p => p.display?.res || '-'), numeric: false },
      { label: 'Refresh Rate',      values: phones.map(p => p.display?.refresh ? `${p.display.refresh} Hz` : '-'), numeric: true },
      { label: 'Peak Brightness',   values: phones.map(p => p.display?.peak_nits ? `${p.display.peak_nits.toLocaleString()} nits` : '-'), numeric: true },
      { label: 'Display Features',  values: phones.map(p => p.display?.notes || '-'), numeric: false },
    ]);

    /* Platform & Chip */
    addGroup('Platform & Chip', 'platform', [
      { label: 'Chipset',           values: phones.map(p => p.chip ? `${p.chip}${p.process ? ` (${p.process})` : ''}` : '-'), numeric: false },
      { label: 'CPU',               values: phones.map(p => p.cpu || '-'), numeric: false },
      { label: 'GPU',               values: phones.map(p => p.gpu || '-'), numeric: false },
      { label: 'Neural Engine',     values: phones.map(p => p.neural_engine || '-'), numeric: false },
      { label: 'Operating System',  values: phones.map(p => p.os || '-'), numeric: false },
      { label: 'RAM',               values: phones.map(p => p.ram ? `${p.ram} GB` : '-'), numeric: true },
      { label: 'Storage Options',   values: phones.map(p => p.storage ? (Array.isArray(p.storage) ? p.storage.join(', ') : p.storage) : '-'), numeric: false },
    ]);

    /* Camera System */
    addGroup('Camera System', 'camera', [
      { label: 'Main Camera',       values: phones.map(p => p.camera?.main ? `${p.camera.main} MP${p.camera.main_aperture ? ` (${p.camera.main_aperture})` : ''}` : '-'), numeric: true },
      { label: 'Ultra Wide',        values: phones.map(p => p.camera?.ultrawide ? `${p.camera.ultrawide} MP${p.camera.ultrawide_aperture ? ` (${p.camera.ultrawide_aperture})` : ''}` : '-'), numeric: true },
      { label: 'Telephoto',         values: phones.map(p => p.camera?.tele ? `${p.camera.tele} MP${p.camera.tele_zoom ? ` (${p.camera.tele_zoom})` : ''}` : '-'), numeric: true },
      { label: 'Front Camera',      values: phones.map(p => p.camera?.front ? `${p.camera.front} MP${p.camera.front_aperture ? ` (${p.camera.front_aperture})` : ''}` : '-'), numeric: true },
      { label: 'Video Recording',   values: phones.map(p => p.camera?.video || '-'), numeric: false },
      { label: 'Camera Features',   values: phones.map(p => p.camera?.notes || '-'), numeric: false },
    ]);

    /* Battery & Power */
    addGroup('Battery & Power', 'battery', [
      { label: 'Battery Capacity',  values: phones.map(p => p.battery_mah ? `${p.battery_mah.toLocaleString()} mAh` + estMark(p,'battery_mah') : '-'), numeric: true },
      { label: 'Wired Charging',    values: phones.map(p => p.charging_w ? `${p.charging_w} W` : '-'), numeric: true },
      { label: 'Wireless Charging', values: phones.map(p => p.wireless_charging || '-'), numeric: false },
      { label: 'MagSafe Support',   values: phones.map(p => p.magsafe_charging || (p.wireless_charging ? 'Supported' : 'No')), numeric: false },
    ]);

    /* Body & Materials */
    const dimRows = isFoldable ? [
      { label: 'Dimensions (closed)', values: phones.map(p => p.dims_closed_mm ? `${p.dims_closed_mm.join(' × ')} mm` : '-'), numeric: false },
      { label: 'Dimensions (open)',   values: phones.map(p => p.dims_open_mm   ? `${p.dims_open_mm.join(' × ')} mm`   : '-'), numeric: false },
    ] : [
      { label: 'Dimensions',          values: phones.map(p => p.dims_mm ? `${p.dims_mm.join(' × ')} mm` + estMark(p,'dims_mm') : '-'), numeric: false },
    ];
    addGroup('Body & Materials', 'body', [
      ...dimRows,
      { label: 'Weight',            values: phones.map(p => p.weight_g ? `${p.weight_g} g` + estMark(p,'weight_g') : '-'), numeric: true },
      { label: 'Build Materials',   values: phones.map(p => p.build || '-'), numeric: false },
      { label: 'Water Resistance',  values: phones.map(p => p.water || '-'), numeric: false },
      { label: 'Biometrics',        values: phones.map(p => p.biometrics || '-'), numeric: false },
      { label: 'SIM Card',          values: phones.map(p => p.sim || '-'), numeric: false },
    ]);

    /* Connectivity */
    addGroup('Connectivity', 'connectivity', [
      { label: 'Cellular Technology', values: phones.map(p => p.network_tech || '-'), numeric: false },
      { label: 'Modem',               values: phones.map(p => p.cellular_modem || '-'), numeric: false },
      { label: 'Wi‑Fi',               values: phones.map(p => p.wifi || '-'), numeric: false },
      { label: 'Bluetooth',           values: phones.map(p => p.bluetooth || '-'), numeric: false },
      { label: 'Port / Connector',    values: phones.map(p => p.usb || '-'), numeric: false },
    ]);

    /* Price & Launch */
    addGroup('Price & Launch', 'price', [
      { label: 'Launch Price',        values: phones.map(p => formatPrice(p.price) + estMark(p,'price')), numeric: true },
      { label: 'Announced Date',      values: phones.map(p => p.announced || '-'), numeric: false },
      { label: 'Release Date',        values: phones.map(p => p.released ? new Date(p.released).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'), numeric: false },
    ]);

    /* Misc & Finishes */
    addGroup('Misc & Finishes', 'misc', [
      { label: 'Available Colors',    values: phones.map(p => renderColorPills(p.colors)), numeric: false, raw: true },
      { label: 'Model Numbers',       values: phones.map(p => p.model_numbers || '-'), numeric: false },
      { label: 'Special Notes',       values: phones.map(p => p.note || '-'), numeric: false, raw: true },
    ]);

    return groups;
  }

  /* ── 1. Render Hero / Model Showcase ───────────────── */
  function renderHero(phones, ids) {
    const cols = Math.min(MAX_PHONES, Math.max(2, phones.length + (phones.length < MAX_PHONES ? 1 : 0)));
    const optionsHtml = PHONES.map(p => `<option value="${p.id}">${p.name} (${p.year})</option>`).join('');

    let cardsHtml = '';

    phones.forEach((p, idx) => {
      const swatchesHtml = renderColorDots(p.colors);
      const priceText = p.price ? `From ${formatPrice(p.price)} · ${p.year}` : `Released ${p.year}`;
      const removeBtn = phones.length > 2
        ? `<button type="button" class="cmp-card-remove" data-idx="${idx}" aria-label="Remove ${p.name}">✕</button>`
        : '';

      cardsHtml += `
        <div class="cmp-card" data-id="${p.id}">
          ${removeBtn}
          <div class="cmp-card-media">
            <img src="img/${p.id}.svg" alt="${p.name}" class="cmp-card-img" onerror="this.onerror=null;this.src='img/iphone.svg'">
          </div>
          <div class="cmp-card-swatches">${swatchesHtml}</div>
          <h2 class="cmp-card-name">${p.name}</h2>
          <div class="cmp-card-price">${priceText}</div>
          <div class="cmp-select-wrapper">
            <select class="cmp-select cmp-model-select" data-idx="${idx}" aria-label="Select iPhone model for column ${idx + 1}">
              <option value="">Change model…</option>
              ${PHONES.map(opt => `<option value="${opt.id}" ${opt.id === p.id ? 'selected' : ''}>${opt.name} (${opt.year})</option>`).join('')}
            </select>
          </div>
          <a href="phones/${p.id}.html" class="cmp-card-link">View full specs →</a>
        </div>`;
    });

    // Add slot card if under max
    if (phones.length < MAX_PHONES) {
      cardsHtml += `
        <div class="cmp-card cmp-card-add">
          <div class="cmp-add-icon">+</div>
          <div class="cmp-add-label">Add iPhone</div>
          <div class="cmp-add-desc">Compare up to 3 models side by side</div>
          <div class="cmp-select-wrapper">
            <select class="cmp-select cmp-add-select" aria-label="Add an iPhone to comparison">
              <option value="">Choose a model…</option>
              ${optionsHtml}
            </select>
          </div>
        </div>`;
    }

    heroRoot.innerHTML = `
      <section class="cmp-hero-section">
        <div class="container">
          <div class="cmp-hero-header">
            <span class="cmp-eyebrow">Comparison</span>
            <h1 class="cmp-hero-title">Compare iPhone models</h1>
            <p class="cmp-hero-subtitle">Explore technical specifications, camera systems, chips, battery life, and materials side by side.</p>
          </div>
          <div class="cmp-showcase-grid" style="--cols:${cols}">
            ${cardsHtml}
          </div>
        </div>
      </section>`;

    // Bind change model selects
    heroRoot.querySelectorAll('.cmp-model-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const newId = e.target.value;
        if (!newId) return;
        const newIds = [...ids];
        newIds[idx] = newId;
        pushIds(newIds);
        refreshAll(newIds);
      });
    });

    // Bind add model select
    const addSel = heroRoot.querySelector('.cmp-add-select');
    if (addSel) {
      addSel.addEventListener('change', (e) => {
        const newId = e.target.value;
        if (!newId) return;
        const newIds = [...ids, newId];
        pushIds(newIds);
        refreshAll(newIds);
      });
    }

    // Bind remove buttons
    heroRoot.querySelectorAll('.cmp-card-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const newIds = ids.filter((_, i) => i !== idx);
        pushIds(newIds);
        refreshAll(newIds);
      });
    });
  }

  /* ── 2. Render Quick Look Feature Summary ──────────── */
  function renderQuickLook(phones) {
    if (phones.length < 2) {
      quicklookRoot.innerHTML = '';
      return;
    }

    const cols = phones.length;

    const columnsHtml = phones.map(p => {
      const displayDesc = p.display?.size
        ? `${p.display.size}″ ${p.display.tech || 'OLED'}${p.display.refresh === 120 ? ' (120Hz ProMotion)' : ''}`
        : 'Retina Display';

      const chipDesc = p.chip
        ? `${p.chip}${p.process ? ` · ${p.process}` : ''}`
        : 'Apple Silicon';

      const cameraDesc = p.camera?.main
        ? `${p.camera.main}MP Main${p.camera.tele ? ` · ${p.camera.tele_zoom || ''} Telephoto` : ''}${p.camera.ultrawide ? ' · Ultra Wide' : ''}`
        : 'Advanced Camera';

      const batteryDesc = p.battery_mah
        ? `${p.battery_mah.toLocaleString()} mAh${p.charging_w ? ` · ${p.charging_w}W wired` : ''}`
        : 'All-day battery';

      const designDesc = p.weight_g
        ? `${p.weight_g} g${p.build ? ` · ${p.build.split(';')[0]}` : ''}`
        : 'Precision design';

      return `
        <div class="cmp-ql-column">
          <div class="cmp-ql-col-title">${p.name}</div>
          <div class="cmp-ql-item">
            <div class="cmp-ql-icon">📱</div>
            <div class="cmp-ql-details">
              <span class="cmp-ql-label">Display</span>
              <span class="cmp-ql-val">${displayDesc}</span>
            </div>
          </div>
          <div class="cmp-ql-item">
            <div class="cmp-ql-icon">⚡</div>
            <div class="cmp-ql-details">
              <span class="cmp-ql-label">Processor</span>
              <span class="cmp-ql-val">${chipDesc}</span>
            </div>
          </div>
          <div class="cmp-ql-item">
            <div class="cmp-ql-icon">📷</div>
            <div class="cmp-ql-details">
              <span class="cmp-ql-label">Camera</span>
              <span class="cmp-ql-val">${cameraDesc}</span>
            </div>
          </div>
          <div class="cmp-ql-item">
            <div class="cmp-ql-icon">🔋</div>
            <div class="cmp-ql-details">
              <span class="cmp-ql-label">Battery</span>
              <span class="cmp-ql-val">${batteryDesc}</span>
            </div>
          </div>
          <div class="cmp-ql-item">
            <div class="cmp-ql-icon">⚖️</div>
            <div class="cmp-ql-details">
              <span class="cmp-ql-label">Weight & Build</span>
              <span class="cmp-ql-val">${designDesc}</span>
            </div>
          </div>
        </div>`;
    }).join('');

    quicklookRoot.innerHTML = `
      <section class="cmp-quicklook-section" id="cmp-overview">
        <div class="container">
          <h2 class="cmp-quicklook-title">Quick Look</h2>
          <p class="cmp-quicklook-subtitle">Key highlights at a glance</p>
          <div class="cmp-quicklook-grid" style="--cols:${cols}">
            ${columnsHtml}
          </div>
        </div>
      </section>`;
  }

  /* ── 3. Render Sticky Navigation & Difference Toggle ─ */
  function renderStickyNav(groups, diffsOnly, diffCount) {
    if (!groups.length) {
      stickyNavRoot.innerHTML = '';
      return;
    }

    const pills = groups.map(g =>
      `<a href="#cmp-sec-${g.slug}" class="cmp-nav-pill" data-slug="${g.slug}">${g.group}</a>`
    ).join('');

    stickyNavRoot.innerHTML = `
      <div class="cmp-sticky-bar" id="cmp-sticky-bar">
        <div class="container">
          <div class="cmp-sticky-inner">
            <nav class="cmp-nav-pills" aria-label="Spec sections">
              <a href="#cmp-overview" class="cmp-nav-pill active" data-slug="overview">Overview</a>
              ${pills}
            </nav>
            <div class="cmp-diff-control">
              <label class="cmp-toggle-label" for="cmp-diff-checkbox">
                <span class="cmp-toggle-switch">
                  <input type="checkbox" id="cmp-diff-checkbox" ${diffsOnly ? 'checked' : ''}>
                  <span class="cmp-toggle-slider"></span>
                </span>
                Show differences only
              </label>
              ${diffsOnly ? `<span class="cmp-diff-badge">${diffCount} differences</span>` : ''}
            </div>
          </div>
        </div>
      </div>`;

    // Bind difference toggle
    const toggle = document.getElementById('cmp-diff-checkbox');
    if (toggle) {
      toggle.addEventListener('change', () => {
        applyDifferenceFilter(toggle.checked);
      });
    }

    // Scroll spy for sticky nav
    setupScrollSpy();
  }

  /* ── 4. Render Floating Sticky Column Headers ──────── */
  function renderStickyColumns(phones) {
    if (phones.length < 2) {
      stickyColsRoot.innerHTML = '';
      return;
    }

    const colsHtml = phones.map(p => `
      <div class="cmp-sc-col">
        <span class="cmp-sc-name" title="${p.name}">${p.name}</span>
        <span class="cmp-sc-price">${formatPrice(p.price)}</span>
      </div>`).join('');

    stickyColsRoot.innerHTML = `
      <div class="cmp-sticky-columns" id="cmp-sticky-columns">
        <div class="container">
          <div class="cmp-sticky-columns-inner" style="--cols:${phones.length}">
            <div class="cmp-sc-label">Specification</div>
            ${colsHtml}
          </div>
        </div>
      </div>`;

    setupStickyWatcher();
  }

  /* ── 5. Render Technical Spec Table ────────────────── */
  function renderTable(phones, groups) {
    if (phones.length < 2) {
      renderEmptyState();
      return;
    }

    const cols = phones.length;

    let groupsHtml = '';

    groups.forEach(group => {
      let rowsHtml = '';

      group.items.forEach(item => {
        const plainVals = item.values.map(v => String(v).replace(/<[^>]+>/g, '').trim());
        const hasDiff = new Set(plainVals).size > 1;

        // Numeric comparison & winner calculation
        let bestIdx = -1;
        if (item.numeric) {
          const nums = item.values.map(numericVal);
          const valid = nums.filter(n => n !== null);
          if (valid.length > 1) {
            const target = lowerIsBetter(item.label) ? Math.min(...valid) : Math.max(...valid);
            const idx = nums.indexOf(target);
            if (nums.filter(n => n === target).length === 1) {
              bestIdx = idx;
            }
          }
        }

        const cellsHtml = item.values.map((val, idx) => {
          const isWinner = idx === bestIdx;
          const pct = item.numeric ? calcBarPct(item.values, idx) : 0;
          const barEl = pct > 0 ? `<div class="cmp-bar-fill" data-pct="${pct.toFixed(1)}"></div>` : '';
          const badgeEl = isWinner ? `<span class="cmp-win-badge">Best</span>` : '';

          return `
            <div class="cmp-val-cell ${isWinner ? 'is-winner' : ''}">
              ${barEl}
              <div class="cmp-cell-content">
                <span class="cmp-cell-val">${val}</span>
                ${badgeEl}
              </div>
            </div>`;
        }).join('');

        rowsHtml += `
          <div class="cmp-row ${hasDiff ? 'differs' : 'identical'}" data-diff="${hasDiff ? '1' : '0'}">
            <div class="cmp-label-cell">${item.label}</div>
            ${cellsHtml}
          </div>`;
      });

      if (!rowsHtml) return;

      groupsHtml += `
        <div class="cmp-group" id="cmp-sec-${group.slug}">
          <div class="cmp-group-header">
            <span class="cmp-group-title">${group.group}</span>
          </div>
          ${rowsHtml}
        </div>`;
    });

    tableRoot.innerHTML = `
      <section class="cmp-table-section">
        <div class="container">
          <div class="cmp-table-wrap">
            <div class="cmp-table-scroll">
              <div class="cmp-table-grid" style="--cols:${cols}">
                ${groupsHtml}
              </div>
            </div>
          </div>
        </div>
      </section>`;

    // Animate visual bars
    requestAnimationFrame(() => {
      tableRoot.querySelectorAll('.cmp-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    });
  }

  /* ── 6. Differences Filtering ──────────────────────── */
  function applyDifferenceFilter(diffsOnly) {
    const rows = tableRoot.querySelectorAll('.cmp-row');
    let diffCount = 0;

    rows.forEach(r => {
      const isDiff = r.dataset.diff === '1';
      if (isDiff) diffCount++;
      if (diffsOnly && !isDiff) {
        r.classList.add('hidden-diff');
      } else {
        r.classList.remove('hidden-diff');
      }
    });

    // Update diff badge in subnav
    const badge = stickyNavRoot.querySelector('.cmp-diff-badge');
    if (diffsOnly) {
      if (!badge) {
        const ctrl = stickyNavRoot.querySelector('.cmp-diff-control');
        if (ctrl) {
          const b = document.createElement('span');
          b.className = 'cmp-diff-badge';
          b.textContent = `${diffCount} differences`;
          ctrl.appendChild(b);
        }
      } else {
        badge.textContent = `${diffCount} differences`;
      }
    } else if (badge) {
      badge.remove();
    }
  }

  /* ── 7. Render Empty State & Popular Matchups ───────── */
  function renderEmptyState() {
    quicklookRoot.innerHTML = '';
    stickyNavRoot.innerHTML = '';
    stickyColsRoot.innerHTML = '';

    tableRoot.innerHTML = `
      <section class="cmp-table-section">
        <div class="container">
          <div class="cmp-table-wrap">
            <div class="cmp-empty">
              <div class="cmp-empty-icon">⚖️</div>
              <h2 class="cmp-empty-title">Select models to compare</h2>
              <p class="cmp-empty-text">Choose at least two iPhone models above to view a detailed side-by-side spec comparison, or click one of these popular comparisons:</p>
              <div class="cmp-matchup-heading">Popular Comparisons</div>
              <div class="cmp-matchups">
                <button type="button" class="cmp-matchup-btn" data-ids="iphone-16-pro,iphone-16">iPhone 16 Pro vs iPhone 16</button>
                <button type="button" class="cmp-matchup-btn" data-ids="iphone-16-pro,iphone-15-pro">iPhone 16 Pro vs iPhone 15 Pro</button>
                <button type="button" class="cmp-matchup-btn" data-ids="iphone-16-pro-max,iphone-17-pro-max">iPhone 16 Pro Max vs iPhone 17 Pro Max</button>
                <button type="button" class="cmp-matchup-btn" data-ids="iphone-17,iphone-16">iPhone 17 vs iPhone 16</button>
                <button type="button" class="cmp-matchup-btn" data-ids="iphone-air,iphone-17-pro">iPhone Air vs iPhone 17 Pro</button>
              </div>
            </div>
          </div>
        </div>
      </section>`;

    tableRoot.querySelectorAll('.cmp-matchup-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newIds = btn.dataset.ids.split(',');
        pushIds(newIds);
        refreshAll(newIds);
      });
    });
  }

  /* ── 8. Sticky Watcher & Header Scroll ─────────────── */
  function setupStickyWatcher() {
    const heroEl = document.querySelector('.cmp-hero-section');
    const stickyCols = document.getElementById('cmp-sticky-columns');
    if (!heroEl || !stickyCols) return;

    window.addEventListener('scroll', () => {
      const heroBottom = heroEl.getBoundingClientRect().bottom;
      // Show pinned header when hero cards scroll above view
      stickyCols.classList.toggle('is-pinned', heroBottom < 52);
    }, { passive: true });
  }

  function setupScrollSpy() {
    const pills = stickyNavRoot.querySelectorAll('.cmp-nav-pill');
    const sections = [
      document.getElementById('cmp-overview'),
      ...tableRoot.querySelectorAll('.cmp-group')
    ].filter(Boolean);

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 120;
      let currentSlug = 'overview';

      sections.forEach(sec => {
        if (sec.offsetTop <= scrollPos) {
          currentSlug = sec.id.replace('cmp-sec-', '').replace('cmp-', '');
        }
      });

      pills.forEach(p => {
        p.classList.toggle('active', p.dataset.slug === currentSlug);
      });
    }, { passive: true });
  }

  function initHeaderScroll() {
    const hdr = document.getElementById('site-header');
    if (!hdr) return;
    window.addEventListener('scroll', () => {
      hdr.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* ── 9. Main Refresh Coordinator ───────────────────── */
  function refreshAll(ids) {
    const phones = ids.map(id => PHONES.find(p => p.id === id)).filter(Boolean);
    const groups = phones.length >= 2 ? buildGroups(phones) : [];

    renderHero(phones, ids);

    if (phones.length >= 2) {
      renderQuickLook(phones);
      renderStickyNav(groups, false, 0);
      renderStickyColumns(phones);
      renderTable(phones, groups);
    } else {
      renderEmptyState();
    }
  }

  /* ── Init ──────────────────────────────────────────── */
  function init() {
    initHeaderScroll();
    const ids = getSelectedIds();
    refreshAll(ids);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();