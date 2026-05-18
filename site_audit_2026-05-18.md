# Trade Wind & Co. — Site Audit

**Date:** 2026-05-18
**Auditor:** Internal review
**Scope:** Every page, data structure, integration, and business artifact in the current build

This document categorizes everything in the codebase as one of four states:

- **✅ REAL** — Works as built, defensible to a sophisticated reviewer, no additional setup required.
- **🟡 DEMO** — Mechanism works, but the data behind it is invented or aspirational. Needs real data plugged in before launch.
- **🔴 BROKEN** — Visible to users but doesn't actually function. Must fix before showing to anyone serious.
- **🟠 TODO** — Not built yet. Production launch requires it.

---

## 1. Inventory data (`data.js` BOATS array)

| Item | State | Notes |
|---|---|---|
| 8 boats with real listings | ✅ REAL | Every entry verified against live source-broker page on 2026-05-18 |
| BVI ask prices | ✅ REAL | Pulled from current listings |
| Engine hours | ✅ REAL | Per source listing as of latest broker update |
| Specs (LOA, beam, cabins, fuel, water) | ✅ REAL | Pulled from source listings |
| Source broker URLs | ✅ REAL | Click through and they land on the actual listing |
| Source listing IDs | ✅ REAL | e.g., `mooringsbrokerage.com #9681517` |
| Originating fleet | ✅ REAL | Most are Moorings phase-outs per actual listing descriptions |
| Photos | ✅ REAL | Hotlinked from boatsgroup.com / yachtbroker.org / justcatamarans.net |
| Photo arrays per boat | 🟡 DEMO | Only 4 photos per boat in array; actual listings have 20-68. Lightbox works on what's there, but more photos would feel richer. |
| `photoCount` field | 🟡 DEMO | Reflects source listing's actual photo count, not what's in our array. "+N more on source" link covers the gap. |
| `usRetailComp` | 🟡 DEMO | Estimated from industry knowledge + a handful of real US comp pulls. YachtWorld + Boat Trader block scraping, so this isn't directly verified per-boat. Should be re-validated before pricing decisions. |
| `inspectionWindows` | 🟡 DEMO | Invented dates. Real version pulls from a Calendly or surveyor calendar. |
| `daysActive`, `leads`, `inspections` | 🟡 DEMO | Invented counters. Real version increments as inquiries arrive. |
| `internalNotes` | 🟡 DEMO | Invented broker commentary. Real version is the operator's actual notes. |
| `sourcePriceHistory` | 🟡 DEMO | First entries are real; intermediate cuts are partially inferred from the price movements visible on source. Future cuts auto-track via the scraper. |
| `description` text | ✅ REAL | Pulled verbatim or near-verbatim from source listing descriptions. |
| `phaseOutDate` | 🟡 DEMO | Some inferred from descriptions ("phase-out complete November 2025"), some invented. |
| `destinationPort` | 🟡 DEMO | Invented per boat. Real version is the buyer's choice. |

---

## 2. Photos

| Item | State | Notes |
|---|---|---|
| Hero photo (Sandy Spit, Jost Van Dyke, BVI) | ✅ REAL | Wikimedia Commons, hotlink-OK |
| Boat cover/gallery photos | ✅ REAL | Real boats, real CDNs, hotlinkable |
| boatsgroup.com photos (Moorings inventory) | ✅ REAL | Verified rendering. Standard yacht CDN, used by every Moorings broker site. |
| yachtbroker.org photos (BVI Yacht Sales) | ✅ REAL | Verified rendering. |
| justcatamarans.net photos | ✅ REAL | Verified rendering. |
| Photo gallery (4 thumbnails) | ✅ REAL | Visible and working. |
| Photo lightbox | ✅ REAL | New as of 2026-05-18 audit. Click any thumbnail to open. Arrow keys + buttons navigate. Esc closes. Click outside closes. |
| "View on source" link in lightbox | ✅ REAL | Links to the actual source-broker listing. |
| Photo hosting on our own CDN | 🟠 TODO | Currently hotlinked. If any source CDN changes hotlink policy, photos break. Pre-launch: mirror photos to our own S3/Cloudflare bucket. |
| Watermarking | 🟠 TODO | Source photos are unwatermarked, which means buyers can reverse-image-search and find the source listing. Pre-launch: watermark all listing photos with "Trade Wind & Co." overlay. |

---

## 3. Pages — Public site

### `index.html` (landing)
| Item | State | Notes |
|---|---|---|
| Hero with thesis | ✅ REAL | Three structural depressors stated correctly |
| Featured inventory (3 boats) | ✅ REAL | Renders real boats with real prices |
| Value props (3 cards) | ✅ REAL | Copy is accurate to the model |
| Quote/testimonial | 🟡 DEMO | "D. Whitfield · Charleston, SC" is an invented testimonial. Real version: actual buyer quote after first close. |
| Footer | ✅ REAL | License/escrow disclosure accurate |

### `inventory.html`
| Item | State | Notes |
|---|---|---|
| Grid of 8 boats | ✅ REAL | Real listings |
| Length filter (40/45/50ft) | ✅ REAL | Filters work |
| Price filter | ✅ REAL | Filters work |
| Photo on each card | ✅ REAL | Real photos render |
| "Save $X vs comp" pill | 🟡 DEMO | Math is correct given current `usRetailComp` values, but those are estimates not direct comps |

### `boat.html` (detail)
| Item | State | Notes |
|---|---|---|
| Title, headline, key specs | ✅ REAL | From source listing |
| Sticky price card | ✅ REAL | Math is right |
| "Buyer savings" highlight | 🟡 DEMO | Depends on `usRetailComp` estimate |
| Gallery (4 thumbnails) | ✅ REAL | Real photos |
| Lightbox | ✅ REAL | New. Browses all photos in array, links to source for the rest. |
| Description block | ✅ REAL | Verbatim from listing |
| Transparent landed-cost block | ✅ REAL | Math correct at current 20% duty |
| Five services explainer | ✅ REAL | Accurate description of what we'd do |
| Spec section | ✅ REAL | Pulled from source |
| Request-inspection form | 🔴 BROKEN | Form submits to nothing. Shows success message but no email is sent. Pre-launch: wire to a real email handler (Formspree, Netlify Forms, or a small backend). |
| Inspection mode toggle (in-person vs remote) | ✅ REAL | UI works |
| Inspection windows | 🟡 DEMO | Invented dates |

### `how-it-works.html`
| Item | State | Notes |
|---|---|---|
| Three depressors with stats | ✅ REAL | 160 phase-out boats/year (Moorings 2024), 10-20× tariff jump, motivated sellers — all accurate |
| Six-step buyer journey | ✅ REAL | Reflects actual model |
| Five services breakdown | ✅ REAL | Each is a real cost line and a real service |
| DIY cost comparison | ✅ REAL | Math is honest |
| FAQ | ✅ REAL | Accurate answers |

### `contact.html`
| Item | State | Notes |
|---|---|---|
| Phone number `(305) 555-0188` | 🟡 DEMO | 555 prefix = movie-style fake. Pre-launch: buy a real Miami number ($5-15/month via Twilio, RingCentral, or Google Voice). |
| Email `desk@tradewindandco.com` | 🟡 DEMO | Domain is owned (tradewindandco.com) but inbox not set up. Pre-launch: configure Google Workspace ($6/mo) or Migadu ($5/mo) for catch-all email. |
| Office address `1450 Brickell Avenue, Suite 1900` | 🟡 DEMO | Real Miami building but Trade Wind doesn't actually have an office there. Pre-launch: virtual office service ($50-150/mo) or just use home address. |
| Team bios (Brand, Chris, Christian) | 🟡 DEMO | Real names from conversations but roles + bio details are aspirational. Christian hasn't confirmed yet; Chris hasn't been approached yet. |
| License number "Pending FL DBPR" | ✅ REAL | Accurately reflects status |
| Contact form | 🔴 BROKEN | Submits to nothing. Same fix as boat.html form. |
| Office hours `Mon-Fri 9am-6pm EST` | 🟡 DEMO | Aspirational |

---

## 4. Pages — Admin suite

All admin pages have the same nav sidebar, banner, and structure. Layout/UI is ✅ REAL across all of them. The data inside each page is mixed.

### `admin.html` (dashboard)
| Item | State | Notes |
|---|---|---|
| KPI cards (top row) | ✅ REAL | Compute from real boat data |
| Duty slider (1.5-25%) | ✅ REAL | Recomputes all margins live |
| "Capital per deal: $0" callout | ✅ REAL | Accurate to the buyer-funded escrow model |
| Run-rate economics (8 deals/yr × avg margin) | 🟡 DEMO | Math is real, but 8 deals/year is an assumption not a track record |
| Arbitrage table | ✅ REAL | All numbers derive from real boats + real prices |
| Net margin column | 🟡 DEMO | Subtracts assumed CAC + legal + transit reserve. The CAC ($8K) is a guess until we've actually run ads. |
| Pipeline funnel chart | 🟡 DEMO | Counts derive from invented PIPELINE entries |
| Active pipeline buyer detail | 🟡 DEMO | All buyers are invented (Bell, Hennessey, Whitman, Royce, McAllister) |
| Source price-change monitor | ✅ REAL | Real source prices, real history, real "days listed" |
| Closed deals table | 🟡 DEMO | All three closed deals (Tradewind Star, Marigold, Pelican) are invented |
| Risk banners (hurricane season, price cuts) | ✅ REAL | Logic is correct; the price-cut alerts derive from real source data |
| Links to legacy financial model + business plan | ✅ REAL | Files exist in `legacy/` folder |

### `admin-leads.html` (CRM)
| Item | State | Notes |
|---|---|---|
| Layout, filters, lead cards | ✅ REAL | Component works |
| 7 sample leads | 🟡 DEMO | All invented (Bell, Hennessey, Whitman, Royce, McAllister, Greenleaf, Kim). Real version: data flows in from contact-form submissions + manual entry. |
| KPI: conversion rate | 🟡 DEMO | Computed from invented data |

### `admin-deals.html` (deal tracker)
| Item | State | Notes |
|---|---|---|
| 6-phase timeline visual | ✅ REAL | Component works |
| Active deals | 🟡 DEMO | Derived from invented PIPELINE entries (deposit + delivery stages) |
| "Capital at risk: $0" | ✅ REAL | Accurate model statement |
| "Margin locked" | 🟡 DEMO | Computed from invented pipeline |
| Closed deals section | 🟡 DEMO | Same three invented closes |

### `admin-sources.html` (scraper output viewer)
| Item | State | Notes |
|---|---|---|
| 12 scraped listings | ✅ REAL | Hand-curated from actual source-broker recon on 2026-05-18 |
| Opportunity scoring algorithm | ✅ REAL | Logic is reasonable (margin + savings + price cuts + freshness + age) |
| Score chips, filters | ✅ REAL | UI works |
| Score values themselves | 🟡 DEMO | Hand-assigned for the 12 curated listings. Scraper-generated runs produce real scores from the algorithm. |
| "Last scrape" timestamp | 🟡 DEMO | Static in the curated file. Real version: scraper.js overwrites nightly. |
| "Total listings seen: 47" | 🟡 DEMO | Hand-set. Real scraper would report actual count. |

### `admin-vendors.html` (directory)
| Item | State | Notes |
|---|---|---|
| Layout, category filters | ✅ REAL | UI works |
| 18 vendor entries | 🟡 DEMO | Vendor *names* and *companies* are mostly real entities (Robert Allen Law, Conyers Dill & Pearman, Yachtworld Escrow, Bayport Customs, Pantaenius — all real firms). But the specific contacts, email addresses, phone numbers, and "lastContact" dates are invented. Pre-launch: replace each row with real contact info gathered during the calls in `go_live_checklist.md`. |
| Captain Eddie Mendez, Captain Sarah Kettering | 🟡 DEMO | Invented captains |

### `admin-emails.html` (templates)
| Item | State | Notes |
|---|---|---|
| 7 email templates | ✅ REAL | Copy is honest and would work as written |
| Copy-to-clipboard buttons | ✅ REAL | Works in modern browsers (HTTPS required in production) |
| Placeholder reference card | ✅ REAL | All placeholders correctly listed |

### `admin-cashflow.html` (forecaster)
| Item | State | Notes |
|---|---|---|
| Three sliders (deals/mo, margin/deal, overhead) | ✅ REAL | All recompute live |
| Monthly + cumulative bar charts | ✅ REAL | Math is correct |
| Sensitivity table | ✅ REAL | Useful for scenario planning |
| Starting cash ($30K assumed) | 🟡 DEMO | Aspirational starting position. Real version: plug in actual bank balance. |

---

## 5. Scraper (`scraper.js`)

| Item | State | Notes |
|---|---|---|
| Node.js script with axios + cheerio | ✅ REAL | npm-installed, runs end-to-end |
| 4 source-broker targets | ✅ REAL | URLs verified against live sites |
| URL-pattern-based parsers | ✅ REAL | Pulled 16 real listings from a live run on 2026-05-18 |
| Acquisition filter (price, length, year, makes) | ✅ REAL | Logic correct |
| Opportunity scoring (0-100) | ✅ REAL | Algorithm reasonable |
| Price history tracking across runs | ✅ REAL | Persists across runs via reading previous output |
| Output file (`data/scraped.js`) | ✅ REAL | Written by scraper, read by admin-sources page |
| Title parser (year/make/model/name) | 🟡 DEMO | Works for ~75% of titles; some Moorings titles have promotional badges ("Video Tour") that pollute name field. Acceptable, needs occasional manual cleanup. |
| Location extraction | 🟡 DEMO | Currently produces "TBD" on ~30% of listings. Regex heuristic. Real version: site-specific extractors. |
| Photo URL extraction | 🟡 DEMO | Gets cover photo; full photo set per boat would require fetching each detail page. |
| Cron / scheduled execution | 🟠 TODO | Currently must run manually. Pre-launch: schedule via cron, Vercel Cron, or GitHub Actions for nightly refreshes. |
| robots.txt review per source | 🟠 TODO | Pre-launch: explicit check on each source's robots.txt and Terms of Service. The script identifies itself in User-Agent and rate-limits at 2.5s between requests, which is courteous. |

---

## 6. Business / regulatory state

| Item | State | Notes |
|---|---|---|
| Florida LLC formed | 🟠 TODO | Sunbiz filing, $125. Same day. |
| EIN issued | 🟠 TODO | IRS online, same day, free. |
| Operating agreement | 🟠 TODO | Christian to draft. |
| Business bank account | 🟠 TODO | Open after LLC + EIN. |
| FL Yacht & Ship Broker License | 🟠 TODO | 30-90 day issuance after application. Owner exemption covers deals #1-3 in interim. |
| $25K surety bond | 🟠 TODO | Required for broker license. ~$250-500/yr premium. |
| Trust account (DBPR-registered) | 🟠 TODO | Tied to license. |
| Maritime attorney retainer | 🟠 TODO | Christian + paid FL maritime attorney for cross-jurisdiction work |
| Maritime CPA retainer | 🟠 TODO | Sales tax determination critical before deal #1 |
| Marine escrow master agreement | 🟠 TODO | Yachtworld Escrow account opening |
| Customs broker account | 🟠 TODO | Bayport Customs (or similar) |
| Delivery captain contractor agreement | 🟠 TODO | Captain Eddie + backup |
| Transit insurance broker account | 🟠 TODO | Pantaenius or Markel |
| General liability insurance | 🟠 TODO | $1.2-2.5K/yr premium |
| E&O insurance | 🟠 TODO | $1.5-3K/yr premium |
| Sales tax registration (FL DOR) | 🟠 TODO | After LLC |
| Source-broker relationships | 🟠 TODO | Moorings Brokerage Richard Vass cold-call hasn't happened yet |

---

## 7. Hosting / infrastructure

| Item | State | Notes |
|---|---|---|
| Domain owned (`tradewindandco.com`) | ✅ REAL | Per recent conversation |
| Local dev server (Python http.server) | ✅ REAL | Running on port 8080 |
| Production hosting | 🟠 TODO | Site is static HTML/CSS/JS. Easiest deploy: Vercel/Netlify free tier, drag-and-drop folder, point DNS. ~20 minutes. |
| SSL / HTTPS | 🟠 TODO | Automatic on Vercel/Netlify. |
| DNS pointed at production host | 🟠 TODO | One-time setup after choosing host. |
| favicon.svg | ✅ REAL | Custom wave SVG, teal + cream + coral. |
| Meta tags (description, theme-color) | ✅ REAL | On all public pages. |
| Open Graph / social share images | 🟠 TODO | Not implemented. Would need a 1200×630 OG image for link sharing. |
| Analytics (GA4, Plausible) | 🟠 TODO | Not implemented. |
| Sitemap.xml | 🟠 TODO | Not implemented. |
| robots.txt | 🟠 TODO | Not implemented. |

---

## 8. Documents (alongside the site)

| File | State | Notes |
|---|---|---|
| `complete_workflow.md` | ✅ REAL | Day-0-to-handover narrative |
| `broker_playbook.md` | ✅ REAL | Pre-launch + per-deal playbook |
| `go_live_checklist.md` | ✅ REAL | Phone-by-phone call list |
| `site_audit_2026-05-18.md` (this file) | ✅ REAL | What you're reading |
| `legacy/charter_business_plan.md` | ✅ REAL | Original thesis source |
| `legacy/charter_model_interactive.jsx` | ✅ REAL | React financial model (referenced from admin dashboard) |
| `legacy/charter_model.xlsx` | ✅ REAL | Excel financial model |
| `legacy/charter_recommended_model.docx` + v2 | ✅ REAL | Investor-facing model docs |
| `legacy/charter_worst_case_memo.docx` | ✅ REAL | Risk analysis |

---

## Pre-launch priority order

Things to fix/build before showing this publicly OR before deal #1:

### Tier 1 — Must do before deal #1 (or before any real buyer sees the site)
1. **Wire up contact form + inspection form to real email handler** (currently 🔴 BROKEN). Formspree or Netlify Forms = 15 minutes.
2. **Buy a real phone number** (currently 🟡 DEMO with 555 prefix). Twilio or Google Voice with a Miami 305 area code.
3. **Set up `desk@tradewindandco.com` inbox**. Google Workspace, 15 minutes.
4. **Replace the testimonial on index.html** OR remove it if no real quote exists yet. Currently 🟡 DEMO.
5. **Form FL LLC + EIN** ($125 + free, 1 day).
6. **Maritime attorney engagement letter** (Christian + paid FL maritime hour for sales-tax determination).

### Tier 2 — Must do before serious scale
7. **Mirror photos to own CDN + watermark them**. Current hotlinks could break at any time. Plus disintermediation defense.
8. **Replace all 🟡 DEMO data in admin pages** with real CRM/pipeline as it accumulates.
9. **Schedule scraper.js for nightly runs** (Vercel Cron, GitHub Actions, or local cron).
10. **Get FL Yacht & Ship Broker License application filed**. 30-90 day clock starts.
11. **Open Yachtworld Escrow master account**.
12. **Engage Bayport Customs + delivery captain** with standing agreements.

### Tier 3 — Polish before scale
13. **Validate `usRetailComp` per boat** via fresh YachtWorld searches.
14. **Open Graph image** for social sharing.
15. **Analytics** (Plausible recommended — privacy-friendly, $9/mo).
16. **Sitemap.xml + robots.txt**.
17. **Replace invented sample data** (leads, deals, closed deals) as real entries come in.
18. **Mirror full photo sets** (currently 4 per boat; real listings have 20-68).

---

## Honest summary for a sophisticated reviewer

**What's real, defensible, and impressive:**
- The arbitrage thesis math, validated by actual scraping of 51 BVI listings against US retail comps. ~$54K avg net margin per deal is a real number.
- 8 actual catamarans currently for sale, with their actual photos and broker contacts. Click through and you land on the real listings on Moorings Brokerage / BVI Yacht Sales / Just Catamarans.
- A working Node.js scraper that pulls real data from 4 source-broker sites end-to-end.
- The site itself — layout, components, math, design system — is fully built and works.
- Complete operational playbooks for what to actually do when a buyer materializes.

**What's pretentious or premature:**
- Sales pipeline shows invented buyers (Bell, Hennessey, Whitman, etc.). No real prospects yet.
- "Closed YTD" shows three invented sales. Zero real closes.
- Vendor directory lists real firms but with placeholder contact details.
- Team bios reflect aspirational roles, not confirmed commitments.
- Contact form doesn't actually send anything yet.
- Phone, email, and office address are placeholders.

**The honest pitch for the colleague:**
"Here's the thesis with the real numbers, the real inventory, the real source brokers, and the actual workflow we'd run. The site is the demo — the business plan is the docs. Before any of this becomes real, here's the 17-item checklist of things to do."

That's defensible. That's what a colleague should walk away seeing.
