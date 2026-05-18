// Trade Wind & Co. — shared renderers across pages

function categoryFilter(boats, key) {
  if (!key || key === 'all') return boats;
  return boats.filter((b) => b.category === key);
}

function priceFilter(boats, range) {
  if (!range || range === 'all') return boats;
  return boats.filter((b) => {
    const list = listPriceFor(b);
    if (range === 'under-500') return list < 500000;
    if (range === '500-750') return list >= 500000 && list < 750000;
    if (range === '750-plus') return list >= 750000;
    return true;
  });
}

function renderListingCard(b) {
  const photo = b.photos[0]?.url || photoUrl(`${b.year} ${b.make} ${b.model}`, b.photos[0]?.label || 'Photo');
  const badge = b.badge ? `<div class="listing-badge">${b.badge}</div>` : '';
  const savings = buyerSavings(b);
  const savingsPill = savings > 0
    ? `<span class="listing-savings">Save ${fmtUSDShort(savings)} vs comp</span>`
    : '';
  return `
    <a class="listing-card" href="boat.html?id=${b.id}">
      <div class="listing-photo">
        <img src="${photo}" alt="${b.year} ${b.make} ${b.model} — ${b.name}" loading="lazy" />
        ${badge}
        <div class="listing-photo-count">${b.photoCount} photos</div>
      </div>
      <div class="listing-body">
        <div class="listing-category">${b.categoryLabel}</div>
        <div class="listing-title">${b.year} ${b.make} ${b.model} — ${b.name}</div>
        <div class="listing-headline">${b.headline}</div>
        <div class="listing-stub-row">
          <span><strong>${fmtNum(b.engineHours)}</strong> engine hrs</span>
          <span><strong>${b.cabins}</strong> cabins</span>
          <span><strong>ex-${b.originatingFleet}</strong></span>
        </div>
        <div class="listing-row">
          <div class="listing-price-block">
            <small>Delivered</small>
            <span class="listing-price">${fmtUSDShort(listPriceFor(b))}</span>
          </div>
          ${savingsPill}
        </div>
        <div class="listing-stub-row" style="margin-top:10px;">
          <span class="listing-loc">${b.location.harbor}, ${b.location.country}</span>
        </div>
      </div>
    </a>
  `;
}

function mountHeader(active) {
  const el = document.querySelector('[data-header]');
  if (!el) return;
  const nav = ['inventory', 'how-it-works', 'contact', 'admin'];
  const labels = {
    inventory: 'Inventory',
    'how-it-works': 'How it Works',
    contact: 'Contact',
    admin: 'Internal',
  };
  const links = nav
    .map((n) => {
      const href = `${n}.html`;
      const isActive = (n === active || (n === 'admin' && (active || '').startsWith('admin'))) ? ' active' : '';
      const adminCls = n === 'admin' ? ' admin' : '';
      return `<a href="${href}" class="${isActive}${adminCls}">${labels[n]}</a>`;
    })
    .join('');
  el.innerHTML = `
    <div class="container">
      <a href="index.html" class="brand">
        <span class="brand-mark">T</span>
        <span class="brand-name">Trade Wind <span class="amp">&amp;</span> Co.</span>
      </a>
      <nav class="nav">${links}</nav>
      <div class="contact-cta">
        <strong>${SETTINGS.phone}</strong>
      </div>
    </div>
  `;
}

// Admin sidebar — mounted on every admin-* page
function mountAdminSidebar(active) {
  const el = document.querySelector('[data-admin-sidebar]');
  if (!el) return;
  const sections = [
    {
      label: 'Overview',
      links: [
        { key: 'admin', href: 'admin.html', label: 'Dashboard' },
        { key: 'admin-cashflow', href: 'admin-cashflow.html', label: 'Cash Flow' },
      ],
    },
    {
      label: 'Pipeline',
      links: [
        { key: 'admin-leads', href: 'admin-leads.html', label: 'Leads' },
        { key: 'admin-deals', href: 'admin-deals.html', label: 'Active Deals' },
        { key: 'admin-sources', href: 'admin-sources.html', label: 'Sources' },
      ],
    },
    {
      label: 'Operations',
      links: [
        { key: 'admin-vendors', href: 'admin-vendors.html', label: 'Vendors' },
        { key: 'admin-emails', href: 'admin-emails.html', label: 'Email Templates' },
      ],
    },
  ];
  el.innerHTML = sections.map((s) => `
    <div class="nav-section">
      <div class="nav-label">${s.label}</div>
      ${s.links.map((l) => `
        <a href="${l.href}" class="${l.key === active ? 'active' : ''}">
          <span class="dot"></span>${l.label}
        </a>
      `).join('')}
    </div>
  `).join('');
}

function mountFooter() {
  const el = document.querySelector('[data-footer]');
  if (!el) return;
  el.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand">
            <span class="brand-mark" style="color:#fff;border-color:#fff;">T</span>
            <span class="brand-name">Trade Wind <span class="amp">&amp;</span> Co.</span>
          </div>
          <p>${SETTINGS.tagline} Curated ex-fleet catamarans, duty-paid and delivered to your US marina.</p>
          <p style="font-size:12px; color:rgba(255,255,255,0.5); margin-top:14px; line-height:1.5;">${SETTINGS.license}<br/>Maritime escrow administered by ${SETTINGS.escrowAgent}</p>
        </div>
        <div>
          <h4>Inventory</h4>
          <a href="inventory.html?cat=40ft">40 ft Class</a>
          <a href="inventory.html?cat=45ft">45 ft Class</a>
          <a href="inventory.html?cat=50ft">50 ft Class</a>
          <a href="inventory.html">All Inventory</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="how-it-works.html">How it Works</a>
          <a href="contact.html">About + Team</a>
          <a href="contact.html#contact-form">Contact</a>
          <a href="https://${SETTINGS.domain}">${SETTINGS.domain}</a>
        </div>
        <div>
          <h4>Get in Touch</h4>
          <a href="tel:${SETTINGS.phone}">${SETTINGS.phone}</a>
          <a href="mailto:${SETTINGS.email}">${SETTINGS.email}</a>
          <a href="#">${SETTINGS.hq}</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${SETTINGS.established} ${SETTINGS.brokerage}, LLC · ${SETTINGS.entityType}. All rights reserved.</span>
        <span>BVI acquisitions deemed reliable but not guaranteed. Prices subject to change.</span>
      </div>
    </div>
  `;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
