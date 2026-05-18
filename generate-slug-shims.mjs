// Generates one static HTML file per boat slug, so each /<slug> URL
// resolves to a real file Vercel can serve (regardless of whether the
// rewrites in vercel.json are firing).
//
// Each shim is a verbatim copy of boat.html. The boat.html JS now reads
// the slug from window.location.pathname when no ?id= query is present,
// so every shim renders the correct boat.
//
//   node generate-slug-shims.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import dataModule from './data.js';
const { BOATS } = dataModule;

const boatHtml = fs.readFileSync(path.join(__dirname, 'boat.html'), 'utf8');

let written = 0;
for (const b of BOATS) {
  if (!b.slug) {
    console.warn(`  skip ${b.id}: no slug`);
    continue;
  }
  const out = path.join(__dirname, `${b.slug}.html`);
  fs.writeFileSync(out, boatHtml);
  console.log(`  wrote ${b.slug}.html`);
  written++;
}
console.log(`\nDone. ${written} shim files written.`);
