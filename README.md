# Trade Wind & Co.

Caribbean catamaran import service — duty-paid and delivered to your US marina.

Production website + admin tooling for **[tradewindandco.com](https://tradewindandco.com)**.

## What this is

Static site (plain HTML / CSS / JS, no build step) — the customer-facing website plus the operational dashboard. The business sources used catamarans from BVI / Caribbean broker phase-out inventory, handles US import duty + customs + ocean delivery, and resells at a duty-paid delivered price below comparable US-listed inventory.

## Quick start

```bash
# Browse locally — no install required
python -m http.server 8080
# → http://localhost:8080
```

No build step, no framework. Just files.

## Deployment to Vercel

1. **Import repo** at [vercel.com/new](https://vercel.com/new) → `BrandiniTheGreat/TradeWindCo`
2. **Framework Preset:** Other
3. **Build Command:** leave empty
4. **Output Directory:** leave empty (defaults to root)
5. **Install Command:** can be left default, or set to `echo "static, no install"` to skip the scraper's npm install
6. Deploy → get a `*.vercel.app` URL in ~30 seconds
7. **Point DNS** for `tradewindandco.com` at Vercel (Vercel handles HTTPS automatically)

## Pre-launch setup checklist

These are the steps that take this from "demo with working code" to "real business ready to receive inquiries." None of them are coding tasks — they're account setups.

### Tier 0 — Must do before any real buyer sees the site

- [ ] **Sign up for Formspree** ([formspree.io](https://formspree.io), free tier = 50 submissions/month)
  - Create a form, copy your form ID (looks like `xrgjabcd`)
  - In `contact.html`, replace `YOUR_FORMSPREE_ID` with your ID
  - In `boat.html`, replace `YOUR_FORMSPREE_ID` with your ID (same one is fine)
  - Test by submitting a form — you should receive an email within seconds

- [ ] **Set up Google Workspace** ($6/user/mo at [workspace.google.com](https://workspace.google.com))
  - Add `desk@tradewindandco.com`, `inquiries@tradewindandco.com`, `chris@`, `christian@` as needed
  - Verify SPF/DKIM/DMARC for deliverability

- [ ] **Get a real phone number**
  - **Free:** Google Voice with a 305 (Miami) area code → forwards to your cell
  - **Paid:** Twilio ($1/mo + per-minute) or RingCentral ($30/mo) with call recording
  - Update `SETTINGS.phone` in `data.js`

- [ ] **Real office address** (or a virtual mailbox)
  - Update `SETTINGS.address` + `SETTINGS.cityStateZip` in `data.js`
  - Virtual office options: Regus, Davinci, Anytime Mailbox ($30-150/mo)

- [ ] **Change the admin password**
  - Open `admin-auth.js`
  - Compute new hash: in browser console, run `crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOURNEWPASSWORD')).then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))`
  - Paste the resulting hex string into `ADMIN_PASS_HASH`

- [ ] **Test on real mobile devices** — iPhone Safari + Android Chrome. Walk every page.

- [ ] **Test the contact form end-to-end** after Formspree wire-up

### Tier 1 — Add in first 30 days post-launch

- [ ] **Plausible Analytics** ([plausible.io](https://plausible.io), $9/mo, privacy-friendly)
  - After signup, add this single line to the `<head>` of every public HTML file (between the `<link rel="stylesheet">` and `</head>`):
    ```html
    <script defer data-domain="tradewindandco.com" src="https://plausible.io/js/script.js"></script>
    ```
  - Pages to add it to: `index.html`, `inventory.html`, `boat.html`, `how-it-works.html`, `contact.html`, `watchlist.html`, `compare.html`, `privacy.html`, `terms.html`

- [ ] **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console))
  - Add domain, verify ownership, submit `sitemap.xml`

- [ ] **Google Business Profile** — free, takes a week. Critical for boomer buyer demographic.

- [ ] **BBB profile** — free, 2-week verification.

- [ ] **Industry association memberships** — YBAA (~$300/yr), MTAM (~$200/yr). Badges in footer = real social proof.

- [ ] **First lead magnet PDF**: *"Free Guide to Importing a Caribbean Catamaran"* in exchange for email.

- [ ] **Real team headshots** — $200-500 for a Miami photographer.

- [ ] **Watermark photos + mirror to own CDN** (Cloudflare R2 or AWS S3). Currently hotlinking source-broker CDNs.

## File structure

### Public pages
- `index.html` — landing with thesis + featured inventory + by-the-numbers panel
- `inventory.html` — filterable grid with sort controls
- `boat.html?id=X` — detail page with photo lightbox, landed-cost breakdown, inspection request form
- `how-it-works.html` — three depressors + six-step buyer journey + five services + DIY cost comparison
- `contact.html` — quote form, team, license disclosure
- `watchlist.html` — saved boats (localStorage-only, no auth required)
- `compare.html?ids=a,b,c` — side-by-side specs/landed-cost/savings (up to 4 boats)
- `privacy.html` — Privacy Policy
- `terms.html` — Terms of Service

### Admin pages (password-gated)
All admin pages require the password set in `admin-auth.js` and carry `noindex,nofollow` meta tags so they don't appear in search engines.

- `admin.html` — dashboard with live duty slider, arbitrage table, pipeline funnel, risk banners, run-rate economics
- `admin-leads.html` — CRM
- `admin-deals.html` — 6-phase deal timeline tracker
- `admin-sources.html` — scraped acquisition candidates with opportunity scoring
- `admin-vendors.html` — vendor directory
- `admin-emails.html` — email templates with copy-to-clipboard
- `admin-cashflow.html` — 6-month forecaster with live sliders

### Data + logic
- `data.js` — `SETTINGS`, `BOATS` (8 real listings), `LEADS`, `PIPELINE`, `VENDORS`, `EMAIL_TEMPLATES`, pricing helpers
- `data/scraped.js` — auto-generated by `scraper.js`
- `app.js` — shared renderers (header, footer, listing card, admin sidebar, watchlist, sort)
- `admin-auth.js` — password gate for admin pages
- `styles.css` — Caribbean palette (sea-glass teal / warm sand / coral)

### SEO / Sharing
- `favicon.svg` — wave motif, teal + cream + coral
- `og-image.svg` — Open Graph share image (1200×630)
- `sitemap.xml` — search engine sitemap
- `robots.txt` — crawler directives (admin pages disallowed)

### Scraper
- `scraper.js` — Node.js script (axios + cheerio) that pulls live inventory from Moorings Brokerage, BVI Yacht Sales, The Multihull Company, and Just Catamarans. Filters by acquisition profile, scores opportunities, tracks price history across runs. Output: `data/scraped.js`.

```bash
npm install
node scraper.js
```

Schedule via Vercel Cron, GitHub Actions, or local cron for nightly refreshes.

### Internal reference docs (not in repo)
Operational playbooks, periodic site audits, original business plan, and financial models live alongside the project locally but are excluded from version control via `.gitignore`. They contain margins, vendor contact details, and internal economics that don't belong in a public-facing repo.

## Inventory data

All 8 boats in `BOATS` are **real listings** verified against live source-broker pages on 2026-05-18:

| Boat | Source | BVI Ask |
|---|---|---|
| 2019 Leopard 40 Araume IV | Moorings Brokerage | $309,000 |
| 2019 Leopard 40 Ocean Breeze | Moorings Brokerage | $305,700 |
| 2020 Leopard 40 Game Day | Moorings Brokerage | $319,000 |
| 2020 Leopard 45 Kokamo | Moorings Brokerage | $419,000 |
| 2019 Leopard 45 Soul Rebel | BVI Yacht Sales | $355,000 |
| 2014 Lagoon 450F Miss Summer | BVI Yacht Sales | $445,000 |
| 2020 Lagoon 42 Frost Free | Moorings Brokerage | $329,000 |
| 2015 Bali 4.5 Four Sevens | Just Catamarans | $449,000 |

Photos hotlinked from each source's CDN.

## License

Private. © 2026 Trade Wind & Co., LLC.
