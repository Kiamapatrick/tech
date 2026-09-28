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

  function formatPrice(price) {
    if (price === null || price === undefined) return 'TBA';
    if (Array.isArray(price)) {
      return '$' + price.map(p => p.toLocaleString()).join(' - ');
    }
    return '$' + price.toLocaleString();
  }

  function getNumericValue(value) {
    if (!value || value === '-' || value === 'TBA') return null;
    const cleaned = value.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  function isLowerBetter(label) {
    const lowerBetterLabels = ['Weight', 'Price', 'Launch Price', 'Thickness', 'Depth'];
    return lowerBetterLabels.some(l => label.toLowerCase().includes(l.toLowerCase()));
  }

  function buildSpecRows(phones) {
    const isFoldable = phones.some(p => p.category === 'foldable');
    const rows = [];

    // Network
    const networkRows = [];
    const networkTech = phones.map(p => p.network_tech || '-');
    if (networkTech.some(v => v !== '-')) {
      networkRows.push({ label: 'Technology', values: networkTech, path: 'network_tech', numeric: false });
    }
    const networkBands = phones.map(p => p.network_bands || '-');
    if (networkBands.some(v => v !== '-')) {
      networkRows.push({ label: 'Bands', values: networkBands, path: 'network_bands', numeric: false });
    }
    const cellularModem = phones.map(p => p.cellular_modem || '-');
    if (cellularModem.some(v => v !== '-')) {
      networkRows.push({ label: 'Modem', values: cellularModem, path: 'cellular_modem', numeric: false });
    }
    if (networkRows.length) rows.push({ group: 'Network', items: networkRows });

    // Launch
    const launchRows = [];
    const announced = phones.map(p => p.announced || '-');
    if (announced.some(v => v !== '-')) {
      launchRows.push({ label: 'Announced', values: announced, path: 'announced', numeric: false });
    }
    const released = phones.map(p => p.released ? new Date(p.released).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-');
    if (released.some(v => v !== '-')) {
      launchRows.push({ label: 'Released', values: released, path: 'released', numeric: false });
    }
    const status = phones.map(p => p.status || '-');
    if (status.some(v => v !== '-')) {
      launchRows.push({ label: 'Status', values: status, path: 'status', numeric: false });
    }
    if (launchRows.length) rows.push({ group: 'Launch', items: launchRows });

    // Body
    const bodyRows = [];
    if (isFoldable) {
      const dimsClosed = phones.map(p => {
        if (!p.dims_closed_mm) return '-';
        const [w, h, d] = p.dims_closed_mm;
        return `${w} x ${h} x ${d} mm` + estMark(p, 'dims_closed_mm');
      });
      if (dimsClosed.some(v => v !== '-')) {
        bodyRows.push({ label: 'Dimensions (closed)', values: dimsClosed, path: 'dims_closed_mm', numeric: false });
      }
      const dimsOpen = phones.map(p => {
        if (!p.dims_open_mm) return '-';
        const [w, h, d] = p.dims_open_mm;
        return `${w} x ${h} x ${d} mm` + estMark(p, 'dims_open_mm');
      });
      if (dimsOpen.some(v => v !== '-')) {
        bodyRows.push({ label: 'Dimensions (open)', values: dimsOpen, path: 'dims_open_mm', numeric: false });
      }
    } else {
      const dims = phones.map(p => {
        if (!p.dims_mm) return '-';
        const [w, h, d] = p.dims_mm;
        return `${w} x ${h} x ${d} mm` + estMark(p, 'dims_mm');
      });
      if (dims.some(v => v !== '-')) {
        bodyRows.push({ label: 'Dimensions', values: dims, path: 'dims_mm', numeric: false });
      }
    }
    const weight = phones.map(p => p.weight_g ? `${p.weight_g} g` + estMark(p, 'weight_g') : '-');
    if (weight.some(v => v !== '-')) {
      bodyRows.push({ label: 'Weight', values: weight, path: 'weight_g', numeric: true });
    }
    const build = phones.map(p => p.build || '-');
    if (build.some(v => v !== '-')) {
      bodyRows.push({ label: 'Build', values: build, path: 'build', numeric: false });
    }
    const sim = phones.map(p => p.sim || '-');
    if (sim.some(v => v !== '-')) {
      bodyRows.push({ label: 'SIM', values: sim, path: 'sim', numeric: false });
    }
    const water = phones.map(p => p.water || '-');
    if (water.some(v => v !== '-')) {
      bodyRows.push({ label: 'Water Resistance', values: water, path: 'water', numeric: false });
    }
    const biometrics = phones.map(p => p.biometrics || '-');
    if (biometrics.some(v => v !== '-')) {
      bodyRows.push({ label: 'Biometrics', values: biometrics, path: 'biometrics', numeric: false });
    }
    if (bodyRows.length) rows.push({ group: 'Body', items: bodyRows });

    // Display
    const displayRows = [];
    const dispType = phones.map(p => p.display?.tech || '-');
    if (dispType.some(v => v !== '-')) {
      displayRows.push({ label: 'Type', values: dispType, path: 'display.tech', numeric: false });
    }
    const dispSize = phones.map(p => p.display?.size ? `${p.display.size}in` : '-');
    if (dispSize.some(v => v !== '-')) {
      displayRows.push({ label: 'Size', values: dispSize, path: 'display.size', numeric: true });
    }
    const dispRes = phones.map(p => p.display?.res || '-');
    if (dispRes.some(v => v !== '-')) {
      displayRows.push({ label: 'Resolution', values: dispRes, path: 'display.res', numeric: false });
    }
    const dispRefresh = phones.map(p => p.display?.refresh ? `${p.display.refresh}Hz` : '-');
    if (dispRefresh.some(v => v !== '-')) {
      displayRows.push({ label: 'Refresh Rate', values: dispRefresh, path: 'display.refresh', numeric: true });
    }
    const dispPeak = phones.map(p => p.display?.peak_nits ? `${p.display.peak_nits.toLocaleString()} nits` : '-');
    if (dispPeak.some(v => v !== '-')) {
      displayRows.push({ label: 'Peak Brightness', values: dispPeak, path: 'display.peak_nits', numeric: true });
    }
    const dispProtect = phones.map(p => p.display?.protection || '-');
    if (dispProtect.some(v => v !== '-')) {
      displayRows.push({ label: 'Protection', values: dispProtect, path: 'display.protection', numeric: false });
    }
    const dispNotes = phones.map(p => p.display?.notes || '-');
    if (dispNotes.some(v => v !== '-')) {
      displayRows.push({ label: 'Features', values: dispNotes, path: 'display.notes', numeric: false });
    }
    if (displayRows.length) rows.push({ group: 'Display', items: displayRows });

    // Platform
    const platformRows = [];
    const os = phones.map(p => p.os || '-');
    if (os.some(v => v !== '-')) {
      platformRows.push({ label: 'OS', values: os, path: 'os', numeric: false });
    }
    const chipset = phones.map(p => p.chip ? `${p.chip}` + (p.process ? ` (${p.process})` : '') : '-');
    if (chipset.some(v => v !== '-')) {
      platformRows.push({ label: 'Chipset', values: chipset, path: 'chip', numeric: false });
    }
    const cpu = phones.map(p => p.cpu || '-');
    if (cpu.some(v => v !== '-')) {
      platformRows.push({ label: 'CPU', values: cpu, path: 'cpu', numeric: false });
    }
    const gpu = phones.map(p => p.gpu || '-');
    if (gpu.some(v => v !== '-')) {
      platformRows.push({ label: 'GPU', values: gpu, path: 'gpu', numeric: false });
    }
    const neural = phones.map(p => p.neural_engine || '-');
    if (neural.some(v => v !== '-')) {
      platformRows.push({ label: 'Neural Engine', values: neural, path: 'neural_engine', numeric: false });
    }
    if (platformRows.length) rows.push({ group: 'Platform', items: platformRows });

    // Memory
    const memoryRows = [];
    const storage = phones.map(p => {
      if (!p.storage) return '-';
      return Array.isArray(p.storage) ? p.storage.join(', ') : p.storage;
    });
    if (storage.some(v => v !== '-')) {
      memoryRows.push({ label: 'Storage', values: storage, path: 'storage', numeric: false });
    }
    const ram = phones.map(p => p.ram || '-');
    if (ram.some(v => v !== '-')) {
      memoryRows.push({ label: 'RAM', values: ram, path: 'ram', numeric: true });
    }
    if (memoryRows.length) rows.push({ group: 'Memory', items: memoryRows });

    // Camera
    const cameraRows = [];
    const camMain = phones.map(p => {
      if (!p.camera?.main) return '-';
      return `${p.camera.main} MP` + (p.camera.main_aperture ? ` (${p.camera.main_aperture})` : '') + estMark(p, 'camera.main');
    });
    if (camMain.some(v => v !== '-')) {
      cameraRows.push({ label: 'Main Camera', values: camMain, path: 'camera.main', numeric: true });
    }
    const camUltra = phones.map(p => {
      if (!p.camera?.ultrawide) return '-';
      return `${p.camera.ultrawide} MP` + (p.camera.ultrawide_aperture ? ` (${p.camera.ultrawide_aperture})` : '');
    });
    if (camUltra.some(v => v !== '-')) {
      cameraRows.push({ label: 'Ultrawide', values: camUltra, path: 'camera.ultrawide', numeric: true });
    }
    const camTele = phones.map(p => {
      if (!p.camera?.tele) return '-';
      return `${p.camera.tele} MP` + (p.camera.tele_zoom ? ` (${p.camera.tele_zoom})` : '');
    });
    if (camTele.some(v => v !== '-')) {
      cameraRows.push({ label: 'Telephoto', values: camTele, path: 'camera.tele', numeric: true });
    }
    const camPeri = phones.map(p => {
      if (!p.camera?.periscope_tele) return '-';
      return `${p.camera.periscope_tele} MP` + (p.camera.periscope_zoom ? ` (${p.camera.periscope_zoom})` : '');
    });
    if (camPeri.some(v => v !== '-')) {
      cameraRows.push({ label: 'Periscope Telephoto', values: camPeri, path: 'camera.periscope_tele', numeric: true });
    }
    const camFront = phones.map(p => {
      if (!p.camera?.front) return '-';
      return `${p.camera.front} MP` + (p.camera.front_aperture ? ` (${p.camera.front_aperture})` : '');
    });
    if (camFront.some(v => v !== '-')) {
      cameraRows.push({ label: 'Front Camera', values: camFront, path: 'camera.front', numeric: true });
    }
    const camNotes = phones.map(p => p.camera?.notes || '-');
    if (camNotes.some(v => v !== '-')) {
      cameraRows.push({ label: 'Features', values: camNotes, path: 'camera.notes', numeric: false });
    }
    const camVideo = phones.map(p => p.camera?.video || '-');
    if (camVideo.some(v => v !== '-')) {
      cameraRows.push({ label: 'Video', values: camVideo, path: 'camera.video', numeric: false });
    }
    if (cameraRows.length) rows.push({ group: 'Camera', items: cameraRows });

    // Sound
    const soundRows = [];
    const speakers = phones.map(p => p.speakers || '-');
    if (speakers.some(v => v !== '-')) {
      soundRows.push({ label: 'Speakers', values: speakers, path: 'speakers', numeric: false });
    }
    const jack = phones.map(p => p.headphone_jack !== undefined ? (p.headphone_jack ? '3.5mm' : 'None') : '-');
    if (jack.some(v => v !== '-')) {
      soundRows.push({ label: 'Headphone Jack', values: jack, path: 'headphone_jack', numeric: false });
    }
    if (soundRows.length) rows.push({ group: 'Sound', items: soundRows });

    // Connectivity
    const connectivityRows = [];
    const wifi = phones.map(p => p.wifi || '-');
    if (wifi.some(v => v !== '-')) {
      connectivityRows.push({ label: 'Wi‑Fi', values: wifi, path: 'wifi', numeric: false });
    }
    const bluetooth = phones.map(p => p.bluetooth || '-');
    if (bluetooth.some(v => v !== '-')) {
      connectivityRows.push({ label: 'Bluetooth', values: bluetooth, path: 'bluetooth', numeric: false });
    }
    const gps = phones.map(p => p.gps || '-');
    if (gps.some(v => v !== '-')) {
      connectivityRows.push({ label: 'GPS', values: gps, path: 'gps', numeric: false });
    }
    const nfc = phones.map(p => p.nfc ? 'Yes' : (p.nfc === false ? 'No' : '-'));
    if (nfc.some(v => v !== '-')) {
      connectivityRows.push({ label: 'NFC', values: nfc, path: 'nfc', numeric: false });
    }
    const usb = phones.map(p => p.usb || '-');
    if (usb.some(v => v !== '-')) {
      connectivityRows.push({ label: 'USB', values: usb, path: 'usb', numeric: false });
    }
    if (connectivityRows.length) rows.push({ group: 'Connectivity', items: connectivityRows });

    // Battery
    const batteryRows = [];
    const capacity = phones.map(p => p.battery_mah ? `${p.battery_mah.toLocaleString()} mAh` + estMark(p, 'battery_mah') : '-');
    if (capacity.some(v => v !== '-')) {
      batteryRows.push({ label: 'Capacity', values: capacity, path: 'battery_mah', numeric: true });
    }
    const charging = phones.map(p => p.charging_w ? `${p.charging_w}W` : '-');
    if (charging.some(v => v !== '-')) {
      batteryRows.push({ label: 'Wired Charging', values: charging, path: 'charging_w', numeric: true });
    }
    const wireless = phones.map(p => p.wireless_charging || '-');
    if (wireless.some(v => v !== '-')) {
      batteryRows.push({ label: 'Wireless Charging', values: wireless, path: 'wireless_charging', numeric: false });
    }
    const magsafe = phones.map(p => p.magsafe_charging || '-');
    if (magsafe.some(v => v !== '-')) {
      batteryRows.push({ label: 'MagSafe Charging', values: magsafe, path: 'magsafe_charging', numeric: false });
    }
    if (batteryRows.length) rows.push({ group: 'Battery', items: batteryRows });

    // Price
    const priceRows = [];
    const launchPrice = phones.map(p => formatPrice(p.price) + estMark(p, 'price'));
    if (launchPrice.some(v => v !== '-')) {
      priceRows.push({ label: 'Launch Price', values: launchPrice, path: 'price', numeric: true });
    }
    if (priceRows.length) rows.push({ group: 'Price', items: priceRows });

    // Colors (Misc)
    const miscRows = [];
    const colors = phones.map(p => {
      if (!p.colors || !p.colors.length) return '-';
      const colorMap = {
        'black': '#1d1d1f', 'space black': '#1d1d1f', 'midnight': '#1d1d1f', 'graphite': '#3a3a3c', 'jet black': '#1d1d1f',
        'white': '#ffffff', 'cloud white': '#ffffff', 'starlight': '#f5f0e8', 'silver': '#d1d1d6',
        'gold': '#f7c873', 'rose gold': '#f7c6c6', 'soft pink': '#f7c6c6', 'pink': '#f5b7c0',
        'blue': '#4a90d9', 'mist blue': '#a8c0e8', 'sierra blue': '#6c8fc0', 'pacific blue': '#5b8bd5', 'deep blue': '#2c3e6b', 'ultramarine': '#3f51b5', 'teal': '#008080', 'glacier': '#e8f0f8',
        'green': '#4caf50', 'sage': '#8aae8a', 'yellow': '#f0c840',
        'purple': '#8a4fff', 'lavender': '#c8b8e8',
        'red': '#d92e2e', 'coral': '#ff6f61', 'cosmic orange': '#e86c00', 'burgundy': '#800020',
        'space gray': '#8e8e93', 'natural titanium': '#d4d4d8', 'blue titanium': '#6e8db8', 'white titanium': '#f0f0f0', 'black titanium': '#2a2a2e', 'desert titanium': '#d4c4a8',
        'light gold': '#e8d4a0', 'sky blue': '#87ceeb'
      };
      return `<div class="color-swatch-row">${p.colors.map(c => {
        const key = c.toLowerCase();
        const bg = colorMap[key] || '#e0e0e0';
        const textColor = ['white', 'cloud white', 'starlight', 'silver', 'glacier', 'natural titanium', 'white titanium', 'desert titanium', 'light gold', 'sky blue', 'mist blue', 'sage', 'soft pink', 'pink', 'rose gold', 'yellow', 'gold', 'lavender'].includes(key) ? '#1d1d1f' : '#ffffff';
        return `<span class="color-swatch" style="background:${bg};color:${textColor}" title="${c}">${c}</span>`;
      }).join('')}</div>`;
    });
    if (colors.some(v => v !== '-')) {
      miscRows.push({ label: 'Colors', values: colors, path: 'colors', numeric: false, raw: true });
    }
    const models = phones.map(p => p.model_numbers || '-');
    if (models.some(v => v !== '-')) {
      miscRows.push({ label: 'Model Numbers', values: models, path: 'model_numbers', numeric: false });
    }
    const note = phones.map(p => p.note || '-');
    if (note.some(v => v !== '-')) {
      miscRows.push({ label: 'Note', values: note, path: 'note', numeric: false, raw: true });
    }
    if (miscRows.length) rows.push({ group: 'Misc', items: miscRows });

    return rows;
  }

  function renderPickers(selectedIds) {
    const slotCount = Math.max(2, selectedIds.length);
    pickerContainer.innerHTML = '';

    for (let i = 0; i < slotCount; i++) {
      const slot = document.createElement('div');
      slot.className = 'picker-slot';
      slot.dataset.index = i;

      const select = document.createElement('select');
      select.className = 'picker-select';
      select.innerHTML = '<option value="">Select a phone...</option>' + buildSelectOptions(selectedIds[i]);
      select.addEventListener('change', () => {
        const newIds = Array.from(pickerContainer.querySelectorAll('.picker-select'))
          .map(s => s.value)
          .filter(v => v);
        updateUrl(newIds);
        renderTable(newIds);
        renderSizeComparison(newIds);
      });
      slot.appendChild(select);

      if (i < 2) {
        const swapBtn = document.createElement('button');
        swapBtn.type = 'button';
        swapBtn.className = 'picker-swap';
        swapBtn.textContent = i === 0 ? 'Swap' : 'Swap';
        swapBtn.setAttribute('aria-label', i === 0 ? 'Swap with second phone' : 'Swap with first phone');
        swapBtn.addEventListener('click', () => {
          const selects = pickerContainer.querySelectorAll('.picker-select');
          const val0 = selects[0].value;
          const val1 = selects[1].value;
          if (val0 && val1) {
            selects[0].value = val1;
            selects[1].value = val0;
            const newIds = Array.from(selects).map(s => s.value).filter(v => v);
            updateUrl(newIds);
            renderTable(newIds);
            renderSizeComparison(newIds);
          }
        });
        slot.appendChild(swapBtn);
      }

      if (selectedIds[i]) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'picker-remove';
        removeBtn.innerHTML = 'x';
        removeBtn.setAttribute('aria-label', 'Remove this phone');
        removeBtn.addEventListener('click', () => {
          const selects = pickerContainer.querySelectorAll('.picker-select');
          const newIds = Array.from(selects).map(s => s.value).filter(v => v && v !== selectedIds[i]);
          updateUrl(newIds);
          renderTable(newIds);
          renderSizeComparison(newIds);
        });
        slot.appendChild(removeBtn);
      }

      pickerContainer.appendChild(slot);
    }
  }

  function renderTable(selectedIds) {
    const phones = selectedIds.map(id => PHONES.find(p => p.id === id)).filter(Boolean);

    if (phones.length < 2) {
      tableWrapper.innerHTML = `
        <div class="compare-empty-state">
          <h2>Select phones to compare</h2>
          <p>Use the dropdowns above to choose at least 2 phones.</p>
          ${selectedIds.some(id => !PHONES.some(p => p.id === id)) ? '<p class="compare-warning">One or more selected phones not found.</p>' : ''}
        </div>
      `;
      return;
    }

    const specGroups = buildSpecRows(phones);

    if (specGroups.length === 0) {
      tableWrapper.innerHTML = '<p class="compare-empty-state">No comparable specs available for selected phones.</p>';
      return;
    }

    let showDifferencesOnly = false;

    function buildTableHtml(filterDiffs) {
      let html = `
        <div class="compare-table-container">
          <div class="compare-table-header">
            <div class="compare-table-header-cell"></div>
            ${phones.map(p => `
              <div class="compare-table-header-cell" data-brand="${p.brand}">${p.name}</div>
            `).join('')}
          </div>
          <div class="compare-table-controls">
            <label class="compare-toggle">
              <input type="checkbox" id="show-diff-toggle" ${filterDiffs ? 'checked' : ''}>
              <span>Show only differences</span>
            </label>
          </div>
          <div class="compare-table-scroll">
            <table class="compare-table">
              <thead>
                <tr>
                  <th class="spec-label sticky-col">Specification</th>
                  ${phones.map(p => `
                    <th class="spec-value sticky-col" data-brand="${p.brand}">${p.name}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
      `;

      specGroups.forEach(group => {
        html += `
          <tr class="spec-row group-header">
            <th class="spec-label sticky-col" colspan="${phones.length + 1}" style="background: var(--surface); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); border-bottom: 2px solid var(--line);">${group.group}</th>
          </tr>
        `;

        group.items.forEach(item => {
          const allEmpty = item.values.every(v => v === '-' || v === 'TBA');
          if (allEmpty) return;

          const differs = item.values.length > 1 && new Set(item.values).size > 1;
          if (filterDiffs && !differs) return;

          let bestIdx = -1;
          if (item.numeric) {
            const nums = item.values.map(v => getNumericValue(v));
            const valid = nums.map((n, i) => n !== null ? { val: n, idx: i } : null).filter(Boolean);
            if (valid.length > 1) {
              if (isLowerBetter(item.label)) {
                bestIdx = valid.reduce((best, cur) => cur.val < best.val ? cur : best).idx;
              } else {
                bestIdx = valid.reduce((best, cur) => cur.val > best.val ? cur : best).idx;
              }
            }
          }

          html += `
            <tr class="spec-row ${differs ? 'differs-row' : ''}">
              <td class="spec-label sticky-col">${item.label}</td>
              ${item.values.map((v, i) => {
                const isBest = i === bestIdx;
                const barHtml = (item.numeric && getNumericValue(v) !== null) ?
                  `<div class="compare-bar" style="--bar-width: ${getBarWidth(item, phones)}%;"></div>` : '';
                return `
                  <td class="spec-value ${differs ? 'differs' : ''} ${isBest ? 'best' : ''}" data-brand="${phones[i].brand}">
                    ${v}
                    ${isBest ? '<span class="best-badge">Best</span>' : ''}
                    ${barHtml}
                  </td>
                `;
              }).join('')}
            </tr>
          `;
        });
      });

      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;

      return html;
    }

    function getBarWidth(item, phones) {
      const nums = item.values.map(v => getNumericValue(v)).filter(n => n !== null);
      if (nums.length === 0) return 0;
      const max = Math.max(...nums);
      const val = getNumericValue(item.values[phones.indexOf(phones.find(p => true))]) || 0;
      return max > 0 ? Math.max(5, (val / max) * 100) : 0;
    }

    function getBarWidthForValue(item, value) {
      const nums = item.values.map(v => getNumericValue(v)).filter(n => n !== null);
      if (nums.length === 0) return 0;
      const max = Math.max(...nums);
      const val = getNumericValue(value);
      return max > 0 ? Math.max(5, (val / max) * 100) : 0;
    }

    tableWrapper.innerHTML = buildTableHtml(false);

    const toggle = tableWrapper.querySelector('#show-diff-toggle');
    if (toggle) {
      toggle.addEventListener('change', e => {
        showDifferencesOnly = e.target.checked;
        tableWrapper.innerHTML = buildTableHtml(showDifferencesOnly);
        const newToggle = tableWrapper.querySelector('#show-diff-toggle');
        if (newToggle) newToggle.checked = showDifferencesOnly;
      });
    }

    // Animate compare bars
    requestAnimationFrame(() => {
      tableWrapper.querySelectorAll('.compare-bar').forEach(bar => {
        const width = bar.style.getPropertyValue('--bar-width');
        bar.style.setProperty('--bar-width', '0%');
        requestAnimationFrame(() => {
          bar.style.transition = 'transform 600ms cubic-bezier(0.25, 0.1, 0.25, 1)';
          bar.style.setProperty('--bar-width', width);
        });
      });
    });
  }

  // Size comparison rendering
  function renderSizeComparison(selectedIds) {
    const phones = selectedIds.map(id => PHONES.find(p => p.id === id)).filter(Boolean);

    let sizeContainer = document.getElementById('size-comparison');
    if (!sizeContainer) {
      sizeContainer = document.createElement('section');
      sizeContainer.id = 'size-comparison';
      sizeContainer.className = 'section-band';
      sizeContainer.style.background = 'var(--white)';
      tableWrapper.parentElement.insertBefore(sizeContainer, tableWrapper);
    }

    if (phones.length < 2) {
      sizeContainer.innerHTML = '';
      return;
    }

    const phoneData = phones.map(p => {
      let h, w, d;
      if (p.category === 'foldable' && p.dims_closed_mm) {
        [w, h, d] = p.dims_closed_mm;
      } else if (p.dims_mm) {
        [w, h, d] = p.dims_mm;
      } else {
        return null;
      }
      return { phone: p, h, w, d };
    }).filter(Boolean);

    if (phoneData.length < 2) {
      sizeContainer.innerHTML = '';
      return;
    }

    const maxHeightMm = Math.max(...phoneData.map(p => p.h));
    const maxDisplayHeight = 360;
    const scale = maxDisplayHeight / maxHeightMm;

    const silhouettesHtml = phoneData.map(p => {
      const displayH = Math.round(p.h * scale);
      const displayW = Math.round(p.w * scale);
      const displayD = p.d;

      const rx = Math.max(4, Math.round(12 * scale));

      let camModuleHtml = '';
      const camCount = getCameraCount(p.phone);
      const camSize = Math.max(6, Math.round(8 * scale));
      const camGap = Math.max(3, Math.round(4 * scale));
      const camY = Math.round(20 * scale);
      const camStartX = (displayW - (camCount * camSize + (camCount - 1) * camGap)) / 2;

      if (camCount === 1) {
        camModuleHtml = `<rect x="${camStartX}" y="${camY}" width="${camSize}" height="${camSize}" rx="${Math.max(2, Math.round(camSize * 0.25))}" fill="#1a1a2e" opacity="0.35"/>`;
      } else if (camCount === 2) {
        camModuleHtml = `
          <rect x="${camStartX}" y="${camY}" width="${camSize}" height="${camSize}" rx="${Math.max(2, Math.round(camSize * 0.25))}" fill="#1a1a2e" opacity="0.35"/>
          <rect x="${camStartX + camSize + camGap}" y="${camY}" width="${camSize}" height="${camSize}" rx="${Math.max(2, Math.round(camSize * 0.25))}" fill="#1a1a2e" opacity="0.35"/>
        `;
      } else if (camCount >= 3) {
        const row1Y = camY;
        const row2Y = camY + camSize + camGap;
        camModuleHtml = `
          <rect x="${camStartX + camSize + camGap}" y="${row1Y}" width="${camSize}" height="${camSize}" rx="${Math.max(2, Math.round(camSize * 0.25))}" fill="#1a1a2e" opacity="0.35"/>
          <rect x="${camStartX}" y="${row2Y}" width="${camSize}" height="${camSize}" rx="${Math.max(2, Math.round(camSize * 0.25))}" fill="#1a1a2e" opacity="0.35"/>
          <rect x="${camStartX + 2 * (camSize + camGap)}" y="${row2Y}" width="${camSize}" height="${camSize}" rx="${Math.max(2, Math.round(camSize * 0.25))}" fill="#1a1a2e" opacity="0.35"/>
        `;
      }

      const islandW = Math.max(24, Math.round(40 * scale));
      const islandH = Math.max(4, Math.round(4 * scale));
      const islandX = (displayW - islandW) / 2;
      const islandY = Math.round(8 * scale);

      const depthW = Math.max(2, Math.round(displayD * scale * 0.3));
      const depthX = displayW + Math.round(4 * scale);

      return `
        <div class="size-phone" style="display: inline-block; vertical-align: bottom; margin: 0 1.5rem; text-align: center; opacity: 0; transform: scaleY(0); transform-origin: bottom; transition: opacity 400ms cubic-bezier(0.25, 0.1, 0.25, 1), transform 600ms cubic-bezier(0.25, 0.1, 0.25, 1);" data-height="${displayH}">
          <div class="size-silhouette" style="position: relative; display: inline-block;">
            <svg width="${displayW + depthW + 12}" height="${displayH + 20}" style="position: absolute; left: -6px; top: -6px; pointer-events: none; z-index: 0;">
              <rect x="6" y="10" width="${displayW}" height="${displayH}" rx="${rx}" fill="#000000" opacity="0.07"/>
            </svg>
            <svg width="${displayW + depthW}" height="${displayH}" style="display: block; z-index: 1;">
              <defs>
                <linearGradient id="body-grad-${p.phone.id}-size" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#fafafa" stop-opacity="0.95"/>
                  <stop offset="30%" stop-color="#f0f0f5" stop-opacity="0.9"/>
                  <stop offset="70%" stop-color="#e8e8f0" stop-opacity="0.85"/>
                  <stop offset="100%" stop-color="#d8d8e8" stop-opacity="0.8"/>
                </linearGradient>
                <linearGradient id="highlight-${p.phone.id}-size" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
                  <stop offset="50%" stop-color="#ffffff" stop-opacity="0.1"/>
                  <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="${displayW}" height="${displayH}" rx="${rx}" fill="url(#body-grad-${p.phone.id}-size)"/>
              <rect x="2" y="2" width="${displayW - 4}" height="${Math.max(8, Math.round(30 * scale))}" rx="${rx - 1}" fill="url(#highlight-${p.phone.id}-size)"/>
              ${camModuleHtml}
              <rect x="${islandX}" y="${islandY}" width="${islandW}" height="${islandH}" rx="${Math.max(1, Math.round(islandH / 2))}" fill="#1a1a2e" opacity="0.25"/>
              <rect x="${depthX}" y="${Math.round(20 * scale)}" width="${depthW}" height="${displayH - Math.round(40 * scale)}" rx="1" fill="#d8d8e8" opacity="0.4"/>
            </svg>
          </div>
          <div class="size-label" style="margin-top: 0.75rem; font-size: 0.8rem; color: var(--muted); line-height: 1.4; opacity: 0; transition: opacity 300ms cubic-bezier(0.25, 0.1, 0.25, 1) 200ms;">
            <div style="font-weight: 600; color: var(--ink);">${p.phone.name}</div>
            <div>${p.h} × ${p.w} × ${p.d} mm</div>
            ${p.phone.category === 'foldable' ? '<div style="font-size: 0.7rem; opacity: 0.7;">(shown closed)</div>' : ''}
          </div>
        </div>
      `;
    }).join('');

    sizeContainer.innerHTML = `
      <div class="container" style="text-align: center;">
        <h2 class="section-heading" style="margin-bottom: 2rem;">Size Comparison</h2>
        <div class="size-comparison-row" style="display: flex; align-items: flex-end; justify-content: center; min-height: ${maxDisplayHeight + 80}px; padding: 1rem 0;">
          ${silhouettesHtml}
        </div>
        <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--muted);">All phones shown at relative scale. Tallest phone = 360px.</p>
      </div>
    `;

    requestAnimationFrame(() => {
      sizeContainer.querySelectorAll('.size-phone').forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'scaleY(1)';
        }, i * 80);
        const label = el.querySelector('.size-label');
        if (label) {
          setTimeout(() => { label.style.opacity = '1'; }, i * 80 + 300);
        }
      });
    });
  }

  function getCameraCount(phone) {
    if (!phone.camera) return 0;
    let count = 0;
    if (phone.camera.main) count++;
    if (phone.camera.ultrawide) count++;
    if (phone.camera.tele) count++;
    if (phone.camera.periscope_tele) count++;
    return count;
  }

  function init() {
    const selectedIds = getSelectedIds();
    renderPickers(selectedIds);
    renderTable(selectedIds);
    renderSizeComparison(selectedIds);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();