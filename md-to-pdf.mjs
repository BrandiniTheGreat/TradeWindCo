// Converts a markdown file to a print-friendly PDF using marked (md→html)
// and headless Chrome (html→pdf). No latex, no pandoc required.
//
//   node md-to-pdf.mjs <input.md> <output.pdf>

import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath || !outputPath) {
  console.error('Usage: node md-to-pdf.mjs <input.md> <output.pdf>');
  process.exit(1);
}

const md = fs.readFileSync(inputPath, 'utf8');
const bodyHtml = marked.parse(md);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${path.basename(inputPath, '.md')}</title>
<style>
  @page { size: Letter; margin: 0.75in 0.85in; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: Charter, 'Iowan Old Style', 'Source Serif Pro', Georgia, 'Times New Roman', serif;
    font-size: 11.5pt;
    line-height: 1.55;
    color: #1a1a1a;
    background: white;
  }
  h1, h2, h3, h4 {
    font-family: 'Playfair Display', Charter, Georgia, serif;
    color: #1f6e72;
    font-weight: 600;
    line-height: 1.25;
    page-break-after: avoid;
  }
  h1 {
    font-size: 22pt;
    margin: 0 0 4pt 0;
    letter-spacing: 0;
  }
  h1 + p, h1 + p strong { font-size: 12pt; color: #4a4a4a; }
  h2 {
    font-size: 15pt;
    margin: 24pt 0 8pt 0;
    border-top: 0.5pt solid #d4d0c5;
    padding-top: 14pt;
  }
  h2:first-of-type { border-top: none; padding-top: 0; }
  h3 { font-size: 12pt; margin: 14pt 0 6pt 0; }
  p { margin: 0 0 9pt 0; }
  ul, ol { margin: 0 0 9pt 0; padding-left: 22pt; }
  li { margin-bottom: 4pt; }
  li > strong:first-child { color: #1f6e72; }
  strong { color: #1a1a1a; }
  em { color: #4a4a4a; }
  hr {
    border: none;
    border-top: 0.5pt solid #d4d0c5;
    margin: 18pt 0;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 10pt 0 14pt 0;
    font-size: 10.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 0.5pt solid #c8c4b8;
    padding: 7pt 10pt;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #f4f1ea;
    font-weight: 600;
    color: #1f6e72;
  }
  pre {
    background: #f7f5ee;
    border-left: 2pt solid #1f6e72;
    padding: 10pt 14pt;
    font-family: 'JetBrains Mono', 'SF Mono', Consolas, Menlo, monospace;
    font-size: 9.5pt;
    line-height: 1.45;
    overflow: visible;
    white-space: pre-wrap;
    page-break-inside: avoid;
    margin: 8pt 0 12pt 0;
  }
  code {
    font-family: 'JetBrains Mono', 'SF Mono', Consolas, Menlo, monospace;
    font-size: 10pt;
    background: #f4f1ea;
    padding: 1pt 4pt;
    border-radius: 2pt;
  }
  pre code { background: none; padding: 0; }
  /* Compact the leading brand block */
  h1:first-of-type + p { margin-bottom: 0; font-size: 10.5pt; color: #4a4a4a; }
  /* Avoid orphan headers above a page break */
  h2, h3, h4 { page-break-inside: avoid; }
  /* Closing signature */
  p:last-of-type strong { font-size: 12pt; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

// Write HTML to a temp file so Chrome can load it as file://
const tmpHtmlPath = inputPath.replace(/\.md$/, '.tmp.html');
fs.writeFileSync(tmpHtmlPath, html);

// Locate Chrome
const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const chromePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!chromePath) {
  console.error('No Chrome / Edge installation found. Install one or edit CHROME_CANDIDATES.');
  process.exit(1);
}

const fileUri = 'file:///' + path.resolve(tmpHtmlPath).replace(/\\/g, '/');
const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--no-pdf-header-footer',
  `--print-to-pdf=${path.resolve(outputPath)}`,
  fileUri,
];

console.log(`Rendering ${path.basename(inputPath)} → ${path.basename(outputPath)} via ${path.basename(chromePath)}...`);
const result = spawnSync(chromePath, args, { stdio: 'inherit' });

// Clean up temp HTML
fs.unlinkSync(tmpHtmlPath);

if (result.status === 0 && fs.existsSync(outputPath)) {
  const size = fs.statSync(outputPath).size;
  console.log(`Done. ${outputPath} — ${(size / 1024).toFixed(1)} KB`);
} else {
  console.error('PDF generation failed (Chrome exit code:', result.status + ')');
  process.exit(1);
}
