// Trade Wind & Co. — shared renderers across pages

// ===================== Watchlist (localStorage) =====================
const WATCHLIST_KEY = 'tw_watchlist_v1';

function getWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}
function isInWatchlist(boatId) {
  return getWatchlist().includes(boatId);
}
function toggleWatchlist(boatId) {
  const list = getWatchlist();
  const idx = list.indexOf(boatId);
  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.push(boatId);
  }
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  updateWatchlistBadge();
  return idx === -1; // true if just added
}
function updateWatchlistBadge() {
  const count = getWatchlist().length;
  document.querySelectorAll('[data-watchlist-count]').forEach((el) => {
    el.textContent = count > 0 ? `(${count})` : '';
  });
}

function categoryFilter(boats, key) {
  if (!key || key === 'all') return boats;
  return boats.filter((b) => b.category === key);
}

function sortBoats(boats, key) {
  const sorted = [...boats];
  if (key === 'price-low') sorted.sort((a, b) => listPriceFor(a) - listPriceFor(b));
  else if (key === 'price-high') sorted.sort((a, b) => listPriceFor(b) - listPriceFor(a));
  else if (key === 'savings') sorted.sort((a, b) => buyerSavings(b) - buyerSavings(a));
  else if (key === 'newest') sorted.sort((a, b) => b.year - a.year);
  else if (key === 'hours-low') sorted.sort((a, b) => a.engineHours - b.engineHours);
  return sorted;
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
  const isWatched = isInWatchlist(b.id);
  return `
    <div class="listing-card-wrap" style="position:relative;">
      <button class="watch-btn ${isWatched ? 'watched' : ''}" data-watch-id="${b.id}" aria-label="Save to watchlist" title="${isWatched ? 'Remove from watchlist' : 'Save to watchlist'}">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="${isWatched ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
        </svg>
      </button>
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
    </div>
  `;
}

// Bind heart-button click handlers across any rendered cards. Call after render.
function bindWatchlistButtons() {
  document.querySelectorAll('[data-watch-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.watchId;
      const added = toggleWatchlist(id);
      btn.classList.toggle('watched', added);
      btn.title = added ? 'Remove from watchlist' : 'Save to watchlist';
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');
    });
  });
}

function mountHeader(active) {
  const el = document.querySelector('[data-header]');
  if (!el) return;
  const nav = ['inventory', 'how-it-works', 'watchlist', 'contact'];
  const labels = {
    inventory: 'Inventory',
    'how-it-works': 'How it Works',
    watchlist: 'Watchlist',
    contact: 'Contact',
  };
  const links = nav
    .map((n) => {
      const href = `${n}.html`;
      const isActive = n === active ? ' active' : '';
      const badge = n === 'watchlist' ? ' <span data-watchlist-count></span>' : '';
      return `<a href="${href}" class="${isActive}">${labels[n]}${badge}</a>`;
    })
    .join('');
  el.innerHTML = `
    <div class="container">
      <a href="index.html" class="brand">
        <span class="brand-mark"><svg viewBox="0 0 32 32" width="36" height="36" aria-hidden="true"><rect width="32" height="32" rx="6" fill="#1f6e72"/><path d="M4 17 Q 10 13, 16 17 T 28 17" stroke="#f7f3eb" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M4 22 Q 10 18, 16 22 T 28 22" stroke="#d96846" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.85"/></svg></span>
        <span class="brand-name">Trade Wind <span class="amp">&amp;</span> Co.</span>
      </a>
      <nav class="nav">${links}</nav>
      <div class="contact-cta">
        <strong>${SETTINGS.phone}</strong>
      </div>
    </div>
  `;
  // Show watchlist count if user has saved boats
  updateWatchlistBadge();
}

function mountFooter() {
  const el = document.querySelector('[data-footer]');
  if (!el) return;
  el.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand">
            <span class="brand-mark"><svg viewBox="0 0 32 32" width="36" height="36" aria-hidden="true"><rect width="32" height="32" rx="6" fill="#f7f3eb"/><path d="M4 17 Q 10 13, 16 17 T 28 17" stroke="#1f6e72" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M4 22 Q 10 18, 16 22 T 28 22" stroke="#d96846" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.95"/></svg></span>
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
        <span>
          <a href="privacy.html">Privacy</a> &nbsp;·&nbsp;
          <a href="terms.html">Terms</a> &nbsp;·&nbsp;
          BVI acquisitions deemed reliable but not guaranteed.
        </span>
      </div>
    </div>
  `;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
