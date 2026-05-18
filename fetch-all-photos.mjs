// Trade Wind & Co. — full photo refresh pipeline
//
// For each boat in BOATS, this script:
//   1. Fetches the source-broker listing page
//   2. Extracts EVERY photo URL on that page (broker-specific patterns)
//   3. Downloads + watermarks each one with "tradewindandco.com"
//   4. Writes a mapping file the data.js update can reference
//
// Runs end-to-end in ~3-8 minutes depending on broker response times.
// Idempotent — re-running overwrites prior downloads.
//
//   node fetch-all-photos.mjs

import { Jimp, loadFont, measureText } from 'jimp';
import { SANS_32_WHITE } from 'jimp/fonts';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import dataModule from './data.js';
const { BOATS } = dataModule;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_DIR = path.join(__dirname, 'photos');
const WATERMARK_TEXT = 'tradewindandco.com';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'image/avif,image/webp,image/apng,image/jpeg,image/*,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const PAGE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.has('format')) u.searchParams.delete('format');
    return u.toString();
  } catch {
    return url;
  }
}

function refererFor(url) {
  try {
    const host = new URL(url).hostname;
    if (host.includes('boatsgroup.com')) return 'https://www.mooringsbrokerage.com/';
    if (host.includes('yachtbroker.org')) return 'https://bviyachtsales.com/';
    if (host.includes('justcatamarans.net')) return 'https://justcatamarans.net/';
    return undefined;
  } catch {
    return undefined;
  }
}

async function fetchHTML(url) {
  const response = await axios.get(url, {
    timeout: 30000,
    headers: PAGE_HEADERS,
  });
  return response.data;
}

async function fetchImageBuffer(url) {
  const normalized = normalizeUrl(url);
  const headers = { ...BROWSER_HEADERS };
  const referer = refererFor(normalized);
  if (referer) headers['Referer'] = referer;
  const response = await axios.get(normalized, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers,
  });
  return Buffer.from(response.data);
}

async function watermarkAndSave(buffer, outputPath, font) {
  const image = await Jimp.read(buffer);
  if (image.bitmap.width > 1600) image.resize({ w: 1600 });
  const padding = 24;
  const finalWidth = image.bitmap.width;
  const finalHeight = image.bitmap.height;
  const textWidth = measureText(font, WATERMARK_TEXT);
  const textHeight = 32;
  const x = Math.max(0, finalWidth - textWidth - padding);
  const y = Math.max(0, finalHeight - textHeight - padding);
  image.print({ font, x, y, text: WATERMARK_TEXT });
  const outBuffer = await image.getBuffer('image/jpeg', { quality: 84 });
  fs.writeFileSync(outputPath, outBuffer);
}

// ===================== Per-broker photo URL extractors =====================
// Each extractor: scans the page HTML for every photo URL that belongs to THIS
// listing on THIS broker's CDN. Returns a deduped, source-order array.

function uniqOrdered(arr) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (!seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

function extractBoatsgroup(html, listingId) {
  // boatsgroup.com URLs include the listing ID and look like:
  // https://images.boatsgroup.com/resize/1/15/17/2019-leopard-40-sail-9681517-20250212103347404-1_XLARGE.jpg?format=webp&w=1200&h=900&exact=yes
  // We want the XLARGE variant (or whatever maps to the original boat).
  // Be inclusive: match ANY .jpg URL on the boatsgroup CDN that contains the listing ID.
  const pattern = new RegExp(
    `https:\\/\\/images\\.boatsgroup\\.com\\/resize\\/[^"' ]*${listingId}[^"' ]*\\.jpg(?:\\?[^"' ]*)?`,
    'g',
  );
  const all = html.match(pattern) || [];
  // Prefer XLARGE; collapse the same photo at different sizes by stripping the
  // size suffix and dedup keys.
  const collapsed = new Map();
  for (const url of all) {
    // Photo key = the timestamp + index portion (eg 20250212103347404-1)
    const m = url.match(/(\d{14,17}-\d+)/);
    const key = m ? m[1] : url;
    // Prefer XLARGE variant for this key
    const existing = collapsed.get(key);
    if (!existing) {
      collapsed.set(key, url);
    } else if (!existing.includes('XLARGE') && url.includes('XLARGE')) {
      collapsed.set(key, url);
    } else if (existing.includes('LARGE') && url.includes('XLARGE')) {
      collapsed.set(key, url);
    }
  }
  return [...collapsed.values()];
}

function extractYachtBroker(html, listingId) {
  // yachtbroker.org URLs: https://cdn.yachtbroker.org/images/highdef/2848720_df9255df_1.jpg
  // Listing ID at the start, then a hash, then index.
  const pattern = new RegExp(
    `https:\\/\\/cdn\\.yachtbroker\\.org\\/images\\/highdef\\/${listingId}_[^"' ]+?\\.jpg`,
    'g',
  );
  const matches = html.match(pattern) || [];
  // Sort by trailing index for source order
  return uniqOrdered(matches).sort((a, b) => {
    const ai = parseInt(a.match(/_(\d+)\.jpg$/)?.[1] || '0', 10);
    const bi = parseInt(b.match(/_(\d+)\.jpg$/)?.[1] || '0', 10);
    return ai - bi;
  });
}

function extractJustCatamarans(html, slug) {
  // justcatamarans.net URLs: https://justcatamarans.net/wp-content/uploads/YYYY/MM/<slug>-<n>.jpg
  // The slug part typically matches the boat title (e.g. 2015-Bali-4.5-catamaran-FOUR-SEVENS-22.jpg).
  // We don't know the exact slug, so collect ALL /wp-content/uploads/*.jpg on the page
  // and trust the page to only contain this listing's photos.
  const pattern = /https:\/\/justcatamarans\.net\/wp-content\/uploads\/[^"' )]+\.jpg/g;
  const matches = html.match(pattern) || [];
  // Filter to "large" sizes if possible. WP attaches sizes like -1024x768 or -300x200; the
  // original (no size suffix) is the full image. Prefer originals.
  const collapsed = new Map();
  for (const url of matches) {
    // Strip WP size suffix to get the canonical key
    const key = url.replace(/-\d+x\d+(?=\.jpg)/, '');
    const existing = collapsed.get(key);
    if (!existing) {
      collapsed.set(key, url);
    } else {
      // Prefer URL without size suffix
      if (!/-\d+x\d+\.jpg$/.test(url) && /-\d+x\d+\.jpg$/.test(existing)) {
        collapsed.set(key, url);
      }
    }
  }
  return [...collapsed.values()];
}

function getListingId(boat) {
  // Try to pull #NNNNN out of sourceListing first
  const m1 = boat.sourceListing?.match(/#(\d+)/);
  if (m1) return m1[1];
  // Fall back to digits in sourceUrl
  const m2 = boat.sourceUrl?.match(/(\d{6,})/);
  if (m2) return m2[1];
  return null;
}

async function extractPhotoUrls(boat) {
  const html = await fetchHTML(boat.sourceUrl);
  const host = boat.sourceUrl ? new URL(boat.sourceUrl).hostname : '';
  if (host.includes('mooringsbrokerage.com') || host.includes('boatsgroup.com')) {
    const id = getListingId(boat);
    if (!id) throw new Error('No listing ID found for boatsgroup boat');
    return extractBoatsgroup(html, id);
  }
  if (host.includes('bviyachtsales.com')) {
    const id = getListingId(boat);
    if (!id) throw new Error('No listing ID found for bviyachtsales boat');
    return extractYachtBroker(html, id);
  }
  if (host.includes('justcatamarans.net')) {
    return extractJustCatamarans(html, boat.slug);
  }
  throw new Error(`Unknown source host: ${host}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function clearDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    fs.unlinkSync(path.join(dir, f));
  }
}

async function main() {
  ensureDir(PHOTOS_DIR);
  console.log(`Loading font (SANS_32_WHITE)...`);
  const font = await loadFont(SANS_32_WHITE);
  console.log(`Loaded. Processing ${BOATS.length} boats.\n`);

  const newPhotos = {};

  for (const boat of BOATS) {
    console.log(`\n=== ${boat.id} ===`);
    console.log(`  Source: ${boat.sourceUrl}`);

    let urls;
    try {
      urls = await extractPhotoUrls(boat);
    } catch (err) {
      console.log(`  FAILED to extract source photos: ${err.message}`);
      console.log(`  Keeping existing ${boat.photos?.length || 0} photos.`);
      continue;
    }

    console.log(`  Found ${urls.length} unique photo URL(s) on source page.`);
    if (urls.length === 0) {
      console.log(`  No URLs extracted — likely the source page uses lazy-load JSON we can't parse with regex.`);
      console.log(`  Keeping existing ${boat.photos?.length || 0} photos.`);
      continue;
    }

    const boatDir = path.join(PHOTOS_DIR, boat.id);
    clearDir(boatDir);
    ensureDir(boatDir);

    // Preserve existing labels for the first few photos (they describe the cover, helm, etc.)
    const existingLabels = (boat.photos || []).map((p) => p.label);

    const photoEntries = [];
    let okCount = 0;
    let failCount = 0;
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const outName = `${i + 1}.jpg`;
      const outPath = path.join(boatDir, outName);
      try {
        process.stdout.write(`  [${i + 1}/${urls.length}] downloading... `);
        const buf = await fetchImageBuffer(url);
        await watermarkAndSave(buf, outPath, font);
        const label = existingLabels[i] || `View ${i + 1}`;
        photoEntries.push({ url: `photos/${boat.id}/${outName}`, label });
        console.log('OK');
        okCount++;
      } catch (err) {
        console.log(`FAIL: ${err.message}`);
        failCount++;
      }
      // Minor throttle to be polite to source CDN
      await new Promise((r) => setTimeout(r, 150));
    }
    console.log(`  -> ${okCount} OK, ${failCount} failed`);

    newPhotos[boat.id] = photoEntries;
  }

  fs.writeFileSync(
    path.join(__dirname, '_new-photos.json'),
    JSON.stringify(newPhotos, null, 2),
  );
  console.log(`\nDone. _new-photos.json written.`);
  console.log(`\nFinal counts:`);
  for (const [id, photos] of Object.entries(newPhotos)) {
    console.log(`  ${id.padEnd(28)} ${photos.length} photos`);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
