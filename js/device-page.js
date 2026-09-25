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

    // Sparse page fix: if fewer than 3 stats, center them with max-width
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

  function renderSpecSections() {
    const container = document.getElementById('spec-sections');
    if (!container) return;

    const sections = [];

    if (!isFoldable && phone.display) {
      const disp = phone.display;
      const rows = [];
      if (disp.size) rows.push(['Display Size', `${disp.size}in`]);
      if (disp.tech) rows.push(['Technology', disp.tech]);
      if (disp.refresh) rows.push(['Refresh Rate', `${disp.refresh}Hz`]);
      if (disp.res) rows.push(['Resolution', disp.res]);
      if (disp.peak_nits) rows.push(['Peak Brightness', `${disp.peak_nits.toLocaleString()} nits`]);
      if (disp.notes) rows.push(['Notes', disp.notes]);
      if (rows.length) sections.push({ title: 'Display', rows, key: 'display' });
    }

    if (isFoldable && phone.display) {
      const disp = phone.display;
      const rows = [];
      if (disp.inner) rows.push(['Inner Display', `${disp.inner}in ${disp.tech}`]);
      if (disp.outer) rows.push(['Outer Display', `${disp.outer}in ${disp.tech}`]);
      if (rows.length) sections.push({ title: 'Display', rows, key: 'display' });
    }

    const perfRows = [];
    if (phone.chip) perfRows.push(['Chip', phone.chip]);
    if (phone.process) perfRows.push(['Process', phone.process]);
    if (phone.storage_max_tb) perfRows.push(['Max Storage', `${phone.storage_max_tb} TB`]);
    if (perfRows.length) sections.push({ title: 'Performance', rows: perfRows, key: 'performance' });

    if (phone.camera) {
      const cam = phone.camera;
      const camRows = [];
      if (cam.main) camRows.push(['Main Camera', `${cam.main} MP` + (cam.main_aperture ? ` (${cam.main_aperture})` : '')]);
      if (cam.ultrawide) camRows.push(['Ultrawide', `${cam.ultrawide} MP`]);
      if (cam.tele) camRows.push(['Telephoto', `${cam.tele} MP` + (cam.tele_zoom ? ` (${cam.tele_zoom})` : '')]);
      if (cam.periscope_tele) camRows.push(['Periscope Telephoto', `${cam.periscope_tele} MP`]);
      if (cam.front) camRows.push(['Front Camera', `${cam.front} MP`]);
      if (cam.notes) camRows.push(['Notes', cam.notes]);
      if (camRows.length) sections.push({ title: 'Camera', rows: camRows, key: 'camera' });
    }

    const batteryRows = [];
    if (phone.battery_mah) batteryRows.push(['Capacity', `${phone.battery_mah.toLocaleString()} mAh` + estMark('battery_mah')]);
    if (phone.charging_w) batteryRows.push(['Charging', `${phone.charging_w}W`]);
    if (batteryRows.length) sections.push({ title: 'Battery', rows: batteryRows, key: 'battery' });

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
    if (phone.water) bodyRows.push(['Water Resistance', phone.water]);
    if (phone.colors) bodyRows.push(['Colors', phone.colors.join(', ')]);
    if (phone.biometrics) bodyRows.push(['Biometrics', phone.biometrics]);
    if (phone.notes && !phone.camera?.notes && !phone.display?.notes) bodyRows.push(['Notes', phone.notes]);
    if (bodyRows.length) sections.push({ title: 'Body', rows: bodyRows, key: 'body' });

    // Two-column layout: pair sections (Display+Performance, Camera+Battery, Body full-width)
    const sectionPairs = [
      ['display', 'performance'],
      ['camera', 'battery'],
      ['body']
    ];

    let html = '';
    sectionPairs.forEach(pair => {
      const pairSections = pair.map(key => sections.find(s => s.key === key)).filter(Boolean);
      if (pairSections.length === 0) return;
      
      if (pairSections.length === 2) {
        // Two-column layout
        html += `
          <div class="spec-pair">
            ${pairSections.map(section => `
              <div class="spec-section spec-col">
                <h2 class="spec-section-title section-heading">${section.title}</h2>
                <table class="spec-table">
                  <tbody>
                    ${section.rows.map(([label, value]) => `
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
        // Single full-width (Body)
        const section = pairSections[0];
        html += `
          <div class="spec-section spec-full">
            <h2 class="spec-section-title section-heading">${section.title}</h2>
            <table class="spec-table">
              <tbody>
                ${section.rows.map(([label, value]) => `
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