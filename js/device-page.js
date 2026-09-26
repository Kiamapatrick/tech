(function () {
  const phoneId = window.PHONE_ID;
  if (!phoneId) return;

  const phone = PHONES.find(p => p.id === phoneId);
  if (!phone) return;

  document.title = `${phone.name} - goatedTech`;
  document.body.setAttribute('data-brand', phone.brand);

  const isFoldable = phone.category === 'foldable';
  const verified = phone._verified || {};

  function isUnverified(path) {
    return verified[path] === false;
  }

  function estMark(path) {
    return isUnverified(path) ? '<span class="est-badge" aria-label="Estimated or unverified"> est.</span>' : '';
  }

  function formatPrice(price) {
    if (price === null || price === undefined) return 'TBA';
    if (Array.isArray(price)) {
      return '$' + price.map(p => p.toLocaleString()).join(' - ');
    }
    return '$' + price.toLocaleString();
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function colorSwatch(colorName) {
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
    const key = colorName.toLowerCase();
    const bg = colorMap[key] || '#e0e0e0';
    const textColor = ['white', 'cloud white', 'starlight', 'silver', 'glacier', 'natural titanium', 'white titanium', 'desert titanium', 'light gold', 'sky blue', 'mist blue', 'sage', 'soft pink', 'pink', 'rose gold', 'yellow', 'gold', 'lavender'].includes(key) ? '#1d1d1f' : '#ffffff';
    return `<span class="color-swatch" style="background:${bg};color:${textColor}" title="${colorName}">${colorName}</span>`;
  }

  function renderHero() {
    const heroSection = document.querySelector('.device-hero .container');
    if (!heroSection) return;

    const nameEl = heroSection.querySelector('.device-name');
    const metaEl = heroSection.querySelector('.device-meta');
    const illustrationEl = heroSection.querySelector('.device-illustration');

    if (nameEl) nameEl.textContent = phone.name;

    if (metaEl) {
      const priceHtml = `<span>Price: ${formatPrice(phone.price)}${estMark('price')}</span>`;
      const releasedHtml = phone.released ? `<span>Released: ${formatDate(phone.released)}</span>` : '';
      metaEl.innerHTML = priceHtml + (releasedHtml ? ' | ' + releasedHtml : '');
    }

    if (illustrationEl) {
      illustrationEl.innerHTML = `<img src="../img/${phone.id}.svg" alt="" class="device-svg" aria-hidden="true">`;
    }
  }

  function renderHeadlineStats() {
    const container = document.querySelector('.headline-stats');
    if (!container) return;

    const stats = [];

    if (phone.chip) {
      stats.push({
        label: 'Chip',
        value: phone.chip + (phone.process ? ` (${phone.process})` : '')
      });
    }

    if (phone.display) {
      const disp = phone.display;
      let displayLabel = 'Display';
      let displayValue = '';
      if (isFoldable) {
        if (disp.inner && disp.outer) {
          displayValue = `${disp.inner}in inner / ${disp.outer}in outer ${disp.tech}`;
        } else if (disp.size) {
          displayValue = `${disp.size}in ${disp.tech}`;
        }
      } else if (disp.size) {
        displayValue = `${disp.size}in ${disp.tech}`;
        if (disp.refresh) displayValue += ` ${disp.refresh}Hz`;
        if (disp.res) displayValue += ` (${disp.res})`;
      }
      if (displayValue) {
        stats.push({ label: displayLabel, value: displayValue });
      }
    }

    if (phone.battery_mah) {
      stats.push({
        label: 'Battery',
        value: phone.battery_mah.toLocaleString() + ' mAh' + estMark('battery_mah')
      });
    }

    const standout = phone.camera?.notes || phone.display?.notes || phone.notes;
    if (standout) {
      stats.push({
        label: 'Standout',
        value: standout
      });
    }

    const statCount = stats.length;
    const isSparse = statCount < 3;

    container.innerHTML = stats.map(s => `
      <div class="stat${isSparse ? ' stat-sparse' : ''}">
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join('');

    if (isSparse) {
      container.style.justifyContent = 'center';
      container.style.maxWidth = '600px';
      container.style.marginLeft = 'auto';
      container.style.marginRight = 'auto';
    }
  }

  function buildSpecGroups() {
    const groups = [];
    const cam = phone.camera || {};

    // Network
    const networkRows = [];
    if (phone.network_tech) networkRows.push(['Technology', phone.network_tech]);
    if (phone.network_bands) networkRows.push(['Bands', phone.network_bands]);
    if (phone.cellular_modem) networkRows.push(['Modem', phone.cellular_modem]);
    if (networkRows.length) groups.push({ title: 'Network', rows: networkRows });

    // Launch
    const launchRows = [];
    if (phone.announced) launchRows.push(['Announced', phone.announced]);
    if (phone.released) launchRows.push(['Released', formatDate(phone.released)]);
    if (phone.status) launchRows.push(['Status', phone.status]);
    if (launchRows.length) groups.push({ title: 'Launch', rows: launchRows });

    // Body
    const bodyRows = [];
    if (isFoldable) {
      if (phone.dims_closed_mm) {
        const [w, h, d] = phone.dims_closed_mm;
        bodyRows.push(['Dimensions (closed)', `${w} x ${h} x ${d} mm` + estMark('dims_closed_mm')]);
      }
      if (phone.dims_open_mm) {
        const [w, h, d] = phone.dims_open_mm;
        bodyRows.push(['Dimensions (open)', `${w} x ${h} x ${d} mm` + estMark('dims_open_mm')]);
      }
    } else if (phone.dims_mm) {
      const [w, h, d] = phone.dims_mm;
      bodyRows.push(['Dimensions', `${w} x ${h} x ${d} mm` + estMark('dims_mm')]);
    }
    if (phone.weight_g) bodyRows.push(['Weight', `${phone.weight_g} g` + estMark('weight_g')]);
    if (phone.build) bodyRows.push(['Build', phone.build]);
    if (phone.sim) bodyRows.push(['SIM', phone.sim]);
    if (phone.water) bodyRows.push(['Water Resistance', phone.water]);
    if (phone.biometrics) bodyRows.push(['Biometrics', phone.biometrics]);
    if (bodyRows.length) groups.push({ title: 'Body', rows: bodyRows });

    // Display
    const displayRows = [];
    if (phone.display) {
      const disp = phone.display;
      if (isFoldable) {
        if (disp.inner) displayRows.push(['Inner Display', `${disp.inner}in ${disp.tech}`]);
        if (disp.outer) displayRows.push(['Outer Display', `${disp.outer}in ${disp.tech}`]);
        if (disp.res) displayRows.push(['Resolution', disp.res]);
        if (disp.refresh) displayRows.push(['Refresh Rate', `${disp.refresh}Hz`]);
        if (disp.peak_nits) displayRows.push(['Peak Brightness', `${disp.peak_nits.toLocaleString()} nits`]);
        if (disp.notes) displayRows.push(['Features', disp.notes]);
        if (disp.protection) displayRows.push(['Protection', disp.protection]);
      } else {
        if (disp.size) displayRows.push(['Size', `${disp.size}in`]);
        if (disp.tech) displayRows.push(['Type', disp.tech]);
        if (disp.res) displayRows.push(['Resolution', disp.res]);
        if (disp.refresh) displayRows.push(['Refresh Rate', `${disp.refresh}Hz`]);
        if (disp.peak_nits) displayRows.push(['Peak Brightness', `${disp.peak_nits.toLocaleString()} nits`]);
        if (disp.protection) displayRows.push(['Protection', disp.protection]);
        if (disp.notes) displayRows.push(['Features', disp.notes]);
      }
    }
    if (displayRows.length) groups.push({ title: 'Display', rows: displayRows });

    // Platform
    const platformRows = [];
    if (phone.os) platformRows.push(['OS', phone.os]);
    if (phone.chip) platformRows.push(['Chipset', phone.chip + (phone.process ? ` (${phone.process})` : '')]);
    if (phone.cpu) platformRows.push(['CPU', phone.cpu]);
    if (phone.gpu) platformRows.push(['GPU', phone.gpu]);
    if (phone.neural_engine) platformRows.push(['Neural Engine', phone.neural_engine]);
    if (platformRows.length) groups.push({ title: 'Platform', rows: platformRows });

    // Memory
    const memoryRows = [];
    if (phone.storage) {
      const storage = Array.isArray(phone.storage) ? phone.storage.join(', ') : phone.storage;
      memoryRows.push(['Storage', storage]);
    }
    if (phone.ram) memoryRows.push(['RAM', phone.ram]);
    if (memoryRows.length) groups.push({ title: 'Memory', rows: memoryRows });

    // Camera
    const cameraRows = [];
    if (cam.main) cameraRows.push(['Main Camera', `${cam.main} MP` + (cam.main_aperture ? ` (${cam.main_aperture})` : '')]);
    if (cam.ultrawide) cameraRows.push(['Ultrawide', `${cam.ultrawide} MP`]);
    if (cam.tele) cameraRows.push(['Telephoto', `${cam.tele} MP` + (cam.tele_zoom ? ` (${cam.tele_zoom})` : '')]);
    if (cam.periscope_tele) cameraRows.push(['Periscope Telephoto', `${cam.periscope_tele} MP`]);
    if (cam.front) cameraRows.push(['Front Camera', `${cam.front} MP`]);
    if (cam.notes) cameraRows.push(['Features', cam.notes]);
    if (cam.video) cameraRows.push(['Video', cam.video]);
    if (cameraRows.length) groups.push({ title: 'Camera', rows: cameraRows });

    // Sound
    const soundRows = [];
    if (phone.speakers) soundRows.push(['Speakers', phone.speakers]);
    if (phone.headphone_jack !== undefined) soundRows.push(['Headphone Jack', phone.headphone_jack ? '3.5mm' : 'None']);
    if (soundRows.length) groups.push({ title: 'Sound', rows: soundRows });

    // Connectivity
    const connectivityRows = [];
    if (phone.wifi) connectivityRows.push(['Wi‑Fi', phone.wifi]);
    if (phone.bluetooth) connectivityRows.push(['Bluetooth', phone.bluetooth]);
    if (phone.gps) connectivityRows.push(['GPS', phone.gps]);
    if (phone.nfc) connectivityRows.push(['NFC', phone.nfc ? 'Yes' : 'No']);
    if (phone.usb) connectivityRows.push(['USB', phone.usb]);
    if (connectivityRows.length) groups.push({ title: 'Connectivity', rows: connectivityRows });

    // Battery
    const batteryRows = [];
    if (phone.battery_mah) batteryRows.push(['Capacity', `${phone.battery_mah.toLocaleString()} mAh` + estMark('battery_mah')]);
    if (phone.charging_w) batteryRows.push(['Charging', `${phone.charging_w}W`]);
    if (phone.wireless_charging) batteryRows.push(['Wireless Charging', phone.wireless_charging]);
    if (phone.magsafe_charging) batteryRows.push(['MagSafe Charging', phone.magsafe_charging]);
    if (batteryRows.length) groups.push({ title: 'Battery', rows: batteryRows });

    // Misc
    const miscRows = [];
    if (phone.colors && phone.colors.length) {
      const swatches = phone.colors.map(c => colorSwatch(c)).join(' ');
      miscRows.push(['Colors', `<div class="color-swatch-row">${swatches}</div>`]);
    }
    if (phone.model_numbers) miscRows.push(['Model Numbers', phone.model_numbers]);
    if (phone.price) miscRows.push(['Launch Price', formatPrice(phone.price) + estMark('price')]);
    if (phone.note) miscRows.push(['Note', phone.note]);
    if (miscRows.length) groups.push({ title: 'Misc', rows: miscRows });

    return groups;
  }

  function renderSpecSections() {
    const container = document.getElementById('spec-sections');
    if (!container) return;

    const groups = buildSpecGroups();

    const sectionPairs = [
      ['Network', 'Launch'],
      ['Body', 'Display'],
      ['Platform', 'Memory'],
      ['Camera', 'Sound'],
      ['Connectivity', 'Battery'],
      ['Misc']
    ];

    let html = '';
    sectionPairs.forEach(pair => {
      const pairGroups = pair.map(title => groups.find(g => g.title === title)).filter(Boolean);
      if (pairGroups.length === 0) return;

      if (pairGroups.length === 2) {
        html += `
          <div class="spec-pair">
            ${pairGroups.map(group => `
              <div class="spec-section spec-col">
                <h2 class="spec-section-title section-heading">${group.title}</h2>
                <table class="spec-table">
                  <tbody>
                    ${group.rows.map(([label, value]) => `
                      <tr class="spec-row">
                        <td class="spec-label">${label}</td>
                        <td class="spec-value">${value}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        const group = pairGroups[0];
        html += `
          <div class="spec-section spec-full">
            <h2 class="spec-section-title section-heading">${group.title}</h2>
            <table class="spec-table">
              <tbody>
                ${group.rows.map(([label, value]) => `
                  <tr class="spec-row">
                    <td class="spec-label">${label}</td>
                    <td class="spec-value">${value}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    });

    container.innerHTML = html;
  }

  function renderCompareButton() {
    const btn = document.querySelector('.compare-btn');
    if (btn) {
      btn.href = `../compare.html?ids=${phone.id}`;
    }
  }

  renderHero();
  renderHeadlineStats();
  renderSpecSections();
  renderCompareButton();
})();