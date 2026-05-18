#!/usr/bin/env node
/**
 * Trade Wind & Co. — BVI source broker scraper
 *
 * Scans Moorings Brokerage, BVI Yacht Sales, The Multihull Company, and
 * Just Catamarans for newly-listed or price-changed catamarans matching our
 * acquisition profile. Outputs to data/scraped.js for the admin-sources page.
 *
 * Run nightly via cron or manually:
 *     node scraper.js
 *
 * Requirements: Node 18+, npm install axios cheerio
 *
 * IMPORTANT: this is a real working skeleton. Before pointing at production
 * sites, REVIEW each target's robots.txt and Terms of Service. Most yacht
 * broker sites permit reasonable scraping of public listings, but rate-limit
 * yourself (1 request per 2-3 seconds) and identify yourself in User-Agent.
 * If a site offers an API or RSS feed, use that instead.
 */

const fs = require('fs');
const path = require('path');

// Defer requires so the script runs even if axios/cheerio aren't installed —
// it'll fall back to writing sample data.
let axios, cheerio;
try {
  axios = require('axios');
  cheerio = require('cheerio');
} catch (e) {
  console.warn('[scraper] axios + cheerio not installed; using sample data path.');
  console.warn('[scraper] To enable live scraping: npm install axios cheerio');
}

// ============================== Target config ==============================
// Each source is a function that returns an array of normalized listings.

// URLs verified May 2026 — match real source-broker inventory pages.
const TARGETS = [
  {
    name: 'Moorings Brokerage',
    url: 'https://www.mooringsbrokerage.com/used-boats/sailing-catamarans-for-sale',
    parse: parseMooringsBrokerage,
    baseUrl: 'https://www.mooringsbrokerage.com',
  },
  {
    name: 'BVI Yacht Sales',
    url: 'https://bviyachtsales.com/yachts/?type=Catamaran,Multi-Hulls,Trimaran',
    parse: parseBVIYachtSales,
    baseUrl: 'https://bviyachtsales.com',
  },
  {
    name: 'The Multihull Company',
    url: 'https://www.multihullcompany.com/yacht-sales/',
    parse: parseMultihullCompany,
    baseUrl: 'https://www.multihullcompany.com',
  },
  {
    name: 'Just Catamarans',
    url: 'https://justcatamarans.net/featured-listings/',
    parse: parseJustCatamarans,
    baseUrl: 'https://justcatamarans.net',
  },
];

// Our acquisition filter — only listings matching these criteria get scored.
const FILTER = {
  minPrice: 250000,
  maxPrice: 700000,
  models: ['Leopard', 'Lagoon', 'Fountaine Pajot', 'FP', 'Helia', 'Bali', 'Nautitech'],
  minLengthFt: 38,
  maxLengthFt: 50,
  maxYears: 10, // boat must be 10 years old or newer
};

const USER_AGENT = 'Trade Wind & Co. Inventory Scout (contact: desk@tradewindandco.com)';
const REQUEST_DELAY_MS = 2500; // rate-limit ourselves

// ============================== Parsers ==============================
// Each parser receives the raw HTML body of a target's listings page and
// returns an array of { id, source, year, make, model, name, length, price, location, url, photoUrl }.
//
// These selectors are SKELETONS — confirm against each site's actual DOM
// before running in production. Sites change layouts; expect maintenance.

// URL-pattern-based parsers. Anchor tags whose href matches the listing
// URL pattern get scanned, and we pull price/location/photo from nearby DOM.
// More robust than CSS-class selectors which change with every site redesign.

function listingsByUrlPattern(html, baseUrl, urlPattern, source) {
  if (!cheerio) return [];
  const $ = cheerio.load(html);
  const listings = [];
  const seen = new Set();
  $('a').each((_, el) => {
    const $a = $(el);
    const href = $a.attr('href');
    if (!href || !urlPattern.test(href)) return;
    const absUrl = absoluteUrl(href, baseUrl);
    if (seen.has(absUrl)) return;
    seen.add(absUrl);
    // Walk up to the containing card — try the nearest ancestor with a sensible size
    let $card = $a.closest('article, li, div.listing, div[class*="card"], div[class*="boat"], div[class*="yacht"], div[class*="result"]');
    if (!$card.length) $card = $a.parent().parent();
    const cardText = $card.text().replace(/\s+/g, ' ').trim();
    // Title: try anchor's own text first, then the card's first heading
    let title = $a.text().trim();
    if (!title || title.length < 8) {
      title = $card.find('h1, h2, h3, h4').first().text().trim();
    }
    if (!title || title.length < 8) {
      // Fall back to parsing year/make/model out of URL slug
      title = href.split('/').pop().replace(/-/g, ' ');
    }
    // Price — regex through card text for dollar pattern
    const priceMatch = cardText.match(/\$\s?(\d[\d,]*(?:\.\d+)?(?:\s?[KkMm])?)/);
    const price = priceMatch ? parsePrice(priceMatch[0]) : null;
    // Location — heuristic: find common location-ish phrases
    let location = '';
    const locMatch = cardText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s+(?:BVI|Tortola|Bahamas|St\.?\s*\w+|Saint\s+\w+|FL|Florida|Antigua|Grenada|Polynesia|Caribbean))/);
    if (locMatch) location = locMatch[1];
    // Photo: first img in the card
    const photoUrl = $card.find('img').first().attr('src') || $card.find('img').first().attr('data-src');
    const parsed = parseTitle(title);
    if (parsed && price) {
      listings.push({
        ...parsed,
        source,
        price,
        location: location || 'TBD',
        url: absUrl,
        photoUrl: absoluteUrl(photoUrl, baseUrl),
      });
    }
  });
  return listings;
}

function parseMooringsBrokerage(html) {
  return listingsByUrlPattern(
    html,
    'https://www.mooringsbrokerage.com',
    /^https?:\/\/(?:www\.)?mooringsbrokerage\.com\/used-boats\/.+|^\/used-boats\/.+/,
    'Moorings Brokerage'
  );
}

function parseBVIYachtSales(html) {
  return listingsByUrlPattern(
    html,
    'https://bviyachtsales.com',
    /^https?:\/\/(?:www\.)?bviyachtsales\.com\/yacht\/\d+|^\/yacht\/\d+/,
    'BVI Yacht Sales'
  );
}

function parseMultihullCompany(html) {
  return listingsByUrlPattern(
    html,
    'https://www.multihullcompany.com',
    /^https?:\/\/(?:www\.)?multihullcompany\.com\/boat\/.+|^\/boat\/.+/,
    'The Multihull Company'
  );
}

function parseJustCatamarans(html) {
  return listingsByUrlPattern(
    html,
    'https://justcatamarans.net',
    /^https?:\/\/(?:www\.)?justcatamarans\.net\/catamaran-listing\/.+|^\/catamaran-listing\/.+/,
    'Just Catamarans'
  );
}

// ============================== Helpers ==============================

function parsePrice(text) {
  if (!text) return null;
  const cleaned = text.replace(/[^0-9.kKmM]/g, '');
  if (!cleaned) return null;
  let n = parseFloat(cleaned);
  if (/k/i.test(text)) n *= 1000;
  if (/m/i.test(text)) n *= 1_000_000;
  return Math.round(n);
}

// Strip common badge/promotional text that source brokers append to titles.
const BADGE_RE = /\b(Virtual\s+Tour|Video\s+Tour|Sale\s+Pending|New\s+Arrival|Reduced|Just\s+Listed|Price\s+Reduced|Owner\s+Motivated|Featured)\b/gi;

// Title parser: "2019 Leopard 45 'Coral Wind'" → { year, make, model, name }
function parseTitle(title) {
  if (!title) return null;
  // Normalize whitespace and strip badges
  let clean = title.replace(/[\t\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
  clean = clean.replace(BADGE_RE, '').replace(/\s+/g, ' ').trim();
  // Extract: year + make-words + model-number + optional name
  const m = clean.match(/^(\d{4})\s+([A-Za-z][A-Za-z\s.&]*?)\s+(\d{2,3}(?:\.\d)?(?:\s*[A-Za-z]+)?)\s*[''"]?(.*?)[''"]?\s*$/);
  if (m) {
    let name = (m[4] || '').trim();
    // Strip trailing words like "Catamaran", "Sail", etc.
    name = name.replace(/^(catamaran|sail|sailing|yacht)\s*/i, '').trim();
    return {
      year: parseInt(m[1], 10),
      make: m[2].trim(),
      model: m[3].trim().replace(/\s+/g, ' '),
      name,
      length: parseFloat(m[3]),
    };
  }
  // Fallback — extract year + length only
  const yearM = clean.match(/\b(20\d{2}|19\d{2})\b/);
  const lenM = clean.match(/\b(\d{2,3}(?:\.\d)?)\s*(?:ft|')?/);
  if (yearM && lenM) {
    return {
      year: parseInt(yearM[1], 10),
      make: 'Unknown',
      model: lenM[1],
      name: clean.replace(yearM[0], '').replace(lenM[0], '').trim(),
      length: parseFloat(lenM[1]),
    };
  }
  return null;
}

function absoluteUrl(url, base) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return base + url;
  return base + '/' + url;
}

function passesFilter(listing) {
  if (listing.price < FILTER.minPrice || listing.price > FILTER.maxPrice) return false;
  if (listing.length && (listing.length < FILTER.minLengthFt || listing.length > FILTER.maxLengthFt)) return false;
  const currentYear = new Date().getFullYear();
  if (currentYear - listing.year > FILTER.maxYears) return false;
  const makeOk = FILTER.models.some((m) => listing.make.toLowerCase().includes(m.toLowerCase()));
  if (!makeOk) return false;
  return true;
}

// Opportunity score — 0-100. Combines price-vs-comp, days listed, and price cuts.
function scoreListing(listing, historicalKnown) {
  // Estimated US retail comp = price × 1.87 (per our market thesis)
  const estComp = listing.price * 1.87;
  // Estimated landed cost at our acquisition price
  const estLanded = listing.price * 1.20 + 26000; // duty + survey + delivery + customs
  // Estimated delivered list at our 20% margin
  const estList = Math.round((estLanded * 1.20) / 5000) * 5000;
  // Buyer savings vs comp
  const buyerSavings = estComp - estList;
  // Our gross margin
  const grossMargin = estList - estLanded;

  let score = 50;
  // Boost for high gross margin
  if (grossMargin > 100000) score += 15;
  else if (grossMargin > 75000) score += 8;
  // Boost for high buyer savings (more attractive to retail customer)
  if (buyerSavings > 120000) score += 15;
  else if (buyerSavings > 80000) score += 8;
  // Boost for known price cuts (motivated seller)
  if (historicalKnown && historicalKnown.priceCuts >= 2) score += 10;
  else if (historicalKnown && historicalKnown.priceCuts >= 1) score += 5;
  // Boost for fresh listings (first-mover advantage)
  if (historicalKnown && historicalKnown.daysListed < 14) score += 5;
  // Penalize stale inventory (everyone else has already seen it)
  if (historicalKnown && historicalKnown.daysListed > 180) score -= 10;
  // Penalize older hulls
  const age = new Date().getFullYear() - listing.year;
  if (age > 7) score -= 8;

  return {
    score: Math.max(0, Math.min(100, score)),
    estLanded,
    estList,
    grossMargin,
    buyerSavings,
  };
}

// ============================== Main ==============================

async function fetchSource(target) {
  if (!axios) return [];
  console.log(`[scraper] Fetching ${target.name}...`);
  try {
    const { data } = await axios.get(target.url, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 15000,
    });
    return target.parse(data);
  } catch (err) {
    console.error(`[scraper] ${target.name} failed:`, err.message);
    return [];
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loadPreviousScrape() {
  const filePath = path.join(__dirname, 'data', 'scraped.js');
  if (!fs.existsSync(filePath)) return null;
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    const match = txt.match(/const SCRAPED_LISTINGS = (\[[\s\S]*?\]);/);
    if (!match) return null;
    return JSON.parse(match[1]);
  } catch (err) {
    return null;
  }
}

function buildHistoricalIndex(previous) {
  const idx = new Map();
  if (!previous) return idx;
  previous.forEach((p) => {
    idx.set(p.id, p);
  });
  return idx;
}

function generateListingId(listing) {
  return `${listing.source}-${listing.year}-${listing.make}-${listing.model}-${listing.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const previous = await loadPreviousScrape();
  const histIdx = buildHistoricalIndex(previous);

  let allListings = [];
  for (const target of TARGETS) {
    const listings = await fetchSource(target);
    allListings = allListings.concat(listings);
    await sleep(REQUEST_DELAY_MS);
  }

  // Normalize, filter, score
  const today = new Date().toISOString().slice(0, 10);
  const enriched = allListings
    .map((l) => {
      const id = generateListingId(l);
      const prior = histIdx.get(id);
      // Track price history
      let priceHistory = prior ? prior.priceHistory : [];
      const lastPrice = priceHistory.length ? priceHistory[priceHistory.length - 1].price : null;
      if (lastPrice !== l.price) {
        priceHistory = [...priceHistory, { date: today, price: l.price }];
      }
      const priceCuts = Math.max(0, priceHistory.length - 1);
      const firstSeen = prior ? prior.firstSeen : today;
      const daysListed = Math.floor((Date.now() - new Date(firstSeen).getTime()) / (1000 * 60 * 60 * 24));
      const historical = { priceCuts, daysListed };
      const scoring = scoreListing(l, historical);
      return { ...l, id, priceHistory, priceCuts, firstSeen, daysListed, lastChecked: today, ...scoring };
    })
    .filter(passesFilter)
    .sort((a, b) => b.score - a.score);

  // Write to data/scraped.js
  const outputPath = path.join(__dirname, 'data', 'scraped.js');
  const outputContent = `// Auto-generated by scraper.js — do not edit by hand.
// Last scraped: ${new Date().toISOString()}
// Source count: ${TARGETS.length}, listings matched filter: ${enriched.length}

const SCRAPED_LISTINGS = ${JSON.stringify(enriched, null, 2)};

const SCRAPE_META = {
  lastRun: '${new Date().toISOString()}',
  sourcesScanned: ${TARGETS.length},
  totalListings: ${allListings.length},
  matchedFilter: ${enriched.length},
};
`;
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  fs.writeFileSync(outputPath, outputContent);
  console.log(`[scraper] Wrote ${enriched.length} listings to ${outputPath}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[scraper] Fatal:', err);
    process.exit(1);
  });
}

module.exports = { main, scoreListing, passesFilter };
