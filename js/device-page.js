(function () {
  const phoneId = window.PHONE_ID;
  if (!phoneId) return;

  const phone = PHONES.find(p => p.id === phoneId);
  if (!phone) return;

  document.title = `${phone.name} — goatedTech`;
  document.body.setAttribute('data-brand', phone.brand);

  const isFoldable = phone.category === 'foldable';
  const isApple = phone.brand === 'Apple';

  function formatPrice(price) {
    if (price === null || price === undefined) return 'TBA';
    if (Array.isArray(price)) {
      return '$' + price.map(p => p.toLocaleString()).join(' – ');
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

    const illustration = heroSection.querySelector('.device-illustration');
    const nameEl = heroSection.querySelector('.device-name');
    const metaEl = heroSection.querySelector('.device-meta');

    if (nameEl) nameEl.textContent = phone.name;

    if (metaEl) {
      const priceHtml = `<span>Price: ${formatPrice(phone.price)}</span>`;
      const releasedHtml = phone.released ? `<span>Released: ${formatDate(phone.released)}</span>` : '';
      metaEl.innerHTML = priceHtml + (releasedHtml ? ' • ' + releasedHtml : '');
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
          displayValue = `${disp.inner}″ inner / ${disp.outer}″ outer ${disp.tech}`;
        } else if (disp.size) {
          displayValue = `${disp.size}″ ${disp.tech}`;
        }
      } else if (disp.size) {
        displayValue = `${disp.size}″ ${disp.tech}`;
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
        value: phone.battery_mah.toLocaleString() + ' mAh'
      });
    }

    const standout = phone.camera?.notes || phone.display?.notes || phone.notes;
    if (standout) {
      stats.push({
        label: 'Standout',
        value: standout
      });
    }

    container.innerHTML = stats.map(s => `
      <div class="stat">
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join('');
  }

  function buildSpecRows(group, fields) {
    const rows = [];
    fields.forEach(([key, label, formatter]) => {
      const value = formatter ? formatter(phone[key]) : phone[key];
      if (value !== null && value !== undefined && value !== '') {
        rows.push({ label, value });
      }
    });
    return rows;
  }

  function renderSpecSections() {
    const container = document.getElementById('spec-sections');
    if (!container) return;

    const sections = [];

    if (!isFoldable && phone.display) {
      const disp = phone.display;
      const rows = [];
      if (disp.size) rows.push(['Display Size', `${disp.size}″`]);
      if (disp.tech) rows.push(['Technology', disp.tech]);
      if (disp.refresh) rows.push(['Refresh Rate', `${disp.refresh}Hz`]);
      if (disp.res) rows.push(['Resolution', disp.res]);
      if (disp.peak_nits) rows.push(['Peak Brightness', `${disp.peak_nits.toLocaleString()} nits`]);
      if (disp.notes) rows.push(['Notes', disp.notes]);
      if (rows.length) sections.push({ title: 'Display', rows });
    }

    if (isFoldable && phone.display) {
      const disp = phone.display;
      const rows = [];
      if (disp.inner) rows.push(['Inner Display', `${disp.inner}″ ${disp.tech}`]);
      if (disp.outer) rows.push(['Outer Display', `${disp.outer}″ ${disp.tech}`]);
      if (rows.length) sections.push({ title: 'Display', rows });
    }

    const perfRows = [];
    if (phone.chip) perfRows.push(['Chip', phone.chip]);
    if (phone.process) perfRows.push(['Process', phone.process]);
    if (phone.storage_max_tb) perfRows.push(['Max Storage', `${phone.storage_max_tb} TB`]);
    if (perfRows.length) sections.push({ title: 'Performance', rows: perfRows });

    if (phone.camera) {
      const cam = phone.camera;
      const camRows = [];
      if (cam.main) camRows.push(['Main Camera', `${cam.main} MP` + (cam.main_aperture ? ` (${cam.main_aperture})` : '')]);
      if (cam.ultrawide) camRows.push(['Ultrawide', `${cam.ultrawide} MP`]);
      if (cam.tele) camRows.push(['Telephoto', `${cam.tele} MP` + (cam.tele_zoom ? ` (${cam.tele_zoom})` : '')]);
      if (cam.periscope_tele) camRows.push(['Periscope Telephoto', `${cam.periscope_tele} MP`]);
      if (cam.front) camRows.push(['Front Camera', `${cam.front} MP`]);
      if (cam.notes) camRows.push(['Notes', cam.notes]);
      if (camRows.length) sections.push({ title: 'Camera', rows: camRows });
    }

    const batteryRows = [];
    if (phone.battery_mah) batteryRows.push(['Capacity', `${phone.battery_mah.toLocaleString()} mAh`]);
    if (phone.charging_w) batteryRows.push(['Charging', `${phone.charging_w}W`]);
    if (batteryRows.length) sections.push({ title: 'Battery', rows: batteryRows });

    const bodyRows = [];
    if (isFoldable) {
      if (phone.dims_closed_mm) {
        const [w, h, d] = phone.dims_closed_mm;
        bodyRows.push(['Dimensions (closed)', `${w} × ${h} × ${d} mm`]);
      }
      if (phone.dims_open_mm) {
        const [w, h, d] = phone.dims_open_mm;
        bodyRows.push(['Dimensions (open)', `${w} × ${h} × ${d} mm`]);
      }
    } else if (phone.dims_mm) {
      const [w, h, d] = phone.dims_mm;
      bodyRows.push(['Dimensions', `${w} × ${h} × ${d} mm`]);
    }
    if (phone.weight_g) bodyRows.push(['Weight', `${phone.weight_g} g`]);
    if (phone.water) bodyRows.push(['Water Resistance', phone.water]);
    if (phone.colors) bodyRows.push(['Colors', phone.colors.join(', ')]);
    if (phone.biometrics) bodyRows.push(['Biometrics', phone.biometrics]);
    if (phone.notes && !phone.camera?.notes && !phone.display?.notes) bodyRows.push(['Notes', phone.notes]);
    if (bodyRows.length) sections.push({ title: 'Body', rows: bodyRows });

    container.innerHTML = sections.map(section => `
      <div class="spec-section">
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
    `).join('');
  }

  function renderCompareButton() {
    const btn = document.querySelector('.compare-btn');
    if (btn) {
      btn.href = `compare.html?ids=${phone.id}`;
    }
  }

  renderHero();
  renderHeadlineStats();
  renderSpecSections();
  renderCompareButton();
})();