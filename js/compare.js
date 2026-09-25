(function () {
  const MAX_PHONES = 3;
  const pickerContainer = document.getElementById('compare-picker');
  const tableWrapper = document.getElementById('compare-table-wrapper');

  function getSelectedIds() {
    const params = new URLSearchParams(window.location.search);
    const idsParam = params.get('ids');
    if (!idsParam) return [];
    return idsParam.split(',').filter(id => PHONES.some(p => p.id === id)).slice(0, MAX_PHONES);
  }

  function updateUrl(ids) {
    const params = new URLSearchParams(window.location.search);
    if (ids.length) {
      params.set('ids', ids.join(','));
    } else {
      params.delete('ids');
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }

  function buildSelectOptions(selectedId) {
    return PHONES.map(p => `
      <option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${p.name}</option>
    `).join('');
  }

  function isUnverified(phone, path) {
    const verified = phone._verified || {};
    return verified[path] === false;
  }

  function estMark(phone, path) {
    return isUnverified(phone, path) ? '<span class="est-badge" aria-label="Estimated or unverified"> est.</span>' : '';
  }

  function renderPickers(selectedIds) {
    const slotCount = Math.max(2, selectedIds.length);
    pickerContainer.innerHTML = '';

    for (let i = 0; i < slotCount; i++) {
      const slot = document.createElement('div');
      slot.className = 'picker-slot';
      const select = document.createElement('select');
      select.className = 'picker-select';
      select.innerHTML = '<option value="">Select a phone…</option>' + buildSelectOptions(selectedIds[i]);
      select.addEventListener('change', () => {
        const newIds = Array.from(pickerContainer.querySelectorAll('.picker-select'))
          .map(s => s.value)
          .filter(v => v);
        updateUrl(newIds);
        renderTable(newIds);
      });
      slot.appendChild(select);
      pickerContainer.appendChild(slot);
    }
  }

  function getDisplayValue(phone, field) {
    const isFoldable = phone.category === 'foldable';

    switch (field) {
      case 'display':
        if (isFoldable && phone.display) {
          const d = phone.display;
          const parts = [];
          if (d.inner) parts.push(`${d.inner}″ inner`);
          if (d.outer) parts.push(`${d.outer}″ outer`);
          if (d.tech) parts.push(d.tech);
          return parts.join(' / ') || '—';
        }
        if (phone.display) {
          const d = phone.display;
          const parts = [];
          if (d.size) parts.push(`${d.size}″`);
          if (d.tech) parts.push(d.tech);
          if (d.refresh) parts.push(`${d.refresh}Hz`);
          if (d.res) parts.push(`(${d.res})`);
          if (d.peak_nits) parts.push(`${d.peak_nits.toLocaleString()} nits`);
          return parts.join(' ') || '—';
        }
        return '—';

      case 'performance':
        const perfParts = [];
        if (phone.chip) perfParts.push(phone.chip);
        if (phone.process) perfParts.push(`(${phone.process})`);
        if (phone.storage_max_tb) perfParts.push(`${phone.storage_max_tb} TB max storage`);
        return perfParts.join(' • ') || '—';

      case 'camera':
        if (!phone.camera) return '—';
        const cam = phone.camera;
        const camParts = [];
        if (cam.main) camParts.push(`Main: ${cam.main} MP` + (cam.main_aperture ? ` (${cam.main_aperture})` : ''));
        if (cam.ultrawide) camParts.push(`Ultrawide: ${cam.ultrawide} MP`);
        if (cam.tele) camParts.push(`Tele: ${cam.tele} MP` + (cam.tele_zoom ? ` (${cam.tele_zoom})` : ''));
        if (cam.periscope_tele) camParts.push(`Periscope: ${cam.periscope_tele} MP`);
        if (cam.front) camParts.push(`Front: ${cam.front} MP`);
        if (cam.notes) camParts.push(cam.notes);
        return camParts.join(' • ') || '—';

      case 'battery':
        const batParts = [];
        if (phone.battery_mah) batParts.push(`${phone.battery_mah.toLocaleString()} mAh` + estMark(phone, 'battery_mah'));
        if (phone.charging_w) batParts.push(`${phone.charging_w}W charging`);
        return batParts.join(' • ') || '—';

      case 'body':
        const bodyParts = [];
        if (isFoldable) {
          if (phone.dims_closed_mm) {
            const [w, h, d] = phone.dims_closed_mm;
            bodyParts.push(`Closed: ${w}×${h}×${d} mm` + estMark(phone, 'dims_closed_mm'));
          }
          if (phone.dims_open_mm) {
            const [w, h, d] = phone.dims_open_mm;
            bodyParts.push(`Open: ${w}×${h}×${d} mm` + estMark(phone, 'dims_open_mm'));
          }
        } else if (phone.dims_mm) {
          const [w, h, d] = phone.dims_mm;
          bodyParts.push(`${w}×${h}×${d} mm` + estMark(phone, 'dims_mm'));
        }
        if (phone.weight_g) bodyParts.push(`${phone.weight_g} g` + estMark(phone, 'weight_g'));
        if (phone.water) bodyParts.push(phone.water);
        if (phone.colors) bodyParts.push(phone.colors.join(', '));
        if (phone.biometrics) bodyParts.push(phone.biometrics);
        return bodyParts.join(' • ') || '—';

      case 'price':
        if (phone.price === null || phone.price === undefined) return 'TBA';
        if (Array.isArray(phone.price)) {
          return '$' + phone.price.map(p => p.toLocaleString()).join(' – ') + estMark(phone, 'price');
        }
        return '$' + phone.price.toLocaleString() + estMark(phone, 'price');

      default:
        return '—';
    }
  }

  function renderTable(selectedIds) {
    const phones = selectedIds.map(id => PHONES.find(p => p.id === id)).filter(Boolean);

    if (phones.length < 2) {
      tableWrapper.innerHTML = '<p style="text-align:center; color: var(--muted); padding: 2rem;">Select at least 2 phones to compare</p>';
      return;
    }

    const specGroups = [
      { key: 'display', label: 'Display' },
      { key: 'performance', label: 'Performance' },
      { key: 'camera', label: 'Camera' },
      { key: 'battery', label: 'Battery' },
      { key: 'body', label: 'Body' },
      { key: 'price', label: 'Price' },
    ];

    let hasData = false;
    const rowsHtml = specGroups.map(group => {
      const values = phones.map(p => getDisplayValue(p, group.key));
      const allEmpty = values.every(v => v === '—' || v === 'TBA');
      if (allEmpty) return '';
      hasData = true;

      const differs = values.length > 1 && new Set(values).size > 1;

      return `
        <tr class="spec-row">
          <th class="spec-label">${group.label}</th>
          ${values.map((v, i) => `
            <td class="spec-value ${differs ? 'differs' : ''}" data-brand="${phones[i].brand}">${v}</td>
          `).join('')}
        </tr>
      `;
    }).join('');

    if (!hasData) {
      tableWrapper.innerHTML = '<p style="text-align:center; color: var(--muted); padding: 2rem;">No comparable specs available</p>';
      return;
    }

    const headersHtml = phones.map(p => `
      <th class="spec-value" style="background: var(--white); font-weight: 600; font-size: 1rem;" data-brand="${p.brand}">${p.name}</th>
    `).join('');

    tableWrapper.innerHTML = `
      <table class="compare-table">
        <thead>
          <tr>
            <th class="spec-label">Specification</th>
            ${headersHtml}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  }

  function init() {
    const selectedIds = getSelectedIds();
    renderPickers(selectedIds);
    renderTable(selectedIds);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();