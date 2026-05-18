// Trade Wind & Co. — photo watermark + mirror pipeline
//
// Downloads every photo URL listed in BOATS from data.js, applies a
// "tradewindandco.com" watermark in the bottom-right, and writes the
// result to `photos/<boat-id>/<n>.jpg`. Run once per inventory refresh.
//
// Why: source brokers (boatsgroup.com, yachtbroker.org, justcatamarans.net)
// can change hotlink policies at any time. Watermarked + mirrored photos
// also defend against reverse-image-search disintermediation when we
// repost on Boat Trader / YachtWorld / Facebook Marketplace.
//
//   node watermark.mjs
//
// After it runs successfully, update data.js photo URLs to point at the
// new local paths (script prints the mapping at the end).

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

// boatsgroup.com URLs include ?format=webp which jimp can't decode. Strip it.
function normalizeUrl(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.has('format')) {
      u.searchParams.delete('format');
    }
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
  const { width } = image.bitmap;

  // Resize if huge — cap at 1600 wide to keep page weight reasonable.
  if (width > 1600) {
    image.resize({ w: 1600 });
  }

  // Compute padding-aware bottom-right placement.
  const padding = 24;
  const finalWidth = image.bitmap.width;
  const finalHeight = image.bitmap.height;
  const textWidth = measureText(font, WATERMARK_TEXT);
  const textHeight = 32;
  const x = Math.max(0, finalWidth - textWidth - padding);
  const y = Math.max(0, finalHeight - textHeight - padding);

  image.print({ font, x, y, text: WATERMARK_TEXT });

  const outBuffer = await image.getBuffer('image/jpeg', { quality: 86 });
  fs.writeFileSync(outputPath, outBuffer);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  ensureDir(PHOTOS_DIR);
  console.log(`Loading font (SANS_32_WHITE)...`);
  const font = await loadFont(SANS_32_WHITE);
  console.log(`Loaded. Processing ${BOATS.length} boats.`);

  const mapping = {};
  let totalOK = 0;
  let totalFail = 0;

  for (const boat of BOATS) {
    const boatDir = path.join(PHOTOS_DIR, boat.id);
    ensureDir(boatDir);
    mapping[boat.id] = [];

    for (let i = 0; i < boat.photos.length; i++) {
      const photo = boat.photos[i];
      if (!photo.url) {
        mapping[boat.id].push({ ...photo });
        continue;
      }
      const outName = `${i + 1}.jpg`;
      const outPath = path.join(boatDir, outName);
      const relPath = `photos/${boat.id}/${outName}`;
      try {
        process.stdout.write(`  ${boat.id} [${i + 1}/${boat.photos.length}] downloading... `);
        const buf = await fetchImageBuffer(photo.url);
        await watermarkAndSave(buf, outPath, font);
        console.log('OK');
        mapping[boat.id].push({ url: relPath, label: photo.label });
        totalOK++;
      } catch (err) {
        console.log('FAIL:', err.message);
        mapping[boat.id].push({ ...photo });
        totalFail++;
      }
    }
  }

  console.log(`\nDone. ${totalOK} OK, ${totalFail} failed.\n`);
  console.log(`Watermarked mirror at: ${PHOTOS_DIR}`);
  console.log(`\n--- Suggested data.js updates ---`);
  for (const [boatId, photos] of Object.entries(mapping)) {
    console.log(`// ${boatId}`);
    console.log(`photos: ${JSON.stringify(photos, null, 2)},`);
  }

  // Write mapping file for the post-processing step (data-update.mjs reads this).
  fs.writeFileSync(
    path.join(__dirname, 'photos', '_mapping.json'),
    JSON.stringify(mapping, null, 2),
  );
  console.log(`\nMapping written to photos/_mapping.json`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
