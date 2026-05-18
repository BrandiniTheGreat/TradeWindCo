// Trade Wind & Co. — production data
// Caribbean catamaran arbitrage brokerage. Inventory below is REAL: every
// boat is a currently-active listing on Moorings Brokerage, BVI Yacht Sales,
// or Just Catamarans as of May 2026. Photos hotlinked from each source's CDN.
//
// The scraper (scraper.js) refreshes data/scraped.js nightly with the latest
// candidate inventory from all four source brokers.

const SETTINGS = {
  brokerage: 'Trade Wind & Co.',
  entityType: 'Catamaran Import Service',
  tagline: 'Caribbean catamarans, duty-paid and delivered to your marina.',
  // The frictions that fund the spread — every one is a service line item.
  importDuty: 0.20,           // 20% — current US tariff rate on foreign-built vessels
  prepCost: 12000,            // pre-purchase survey + commissioning + cosmetic prep
  oceanDelivery: 11000,       // BVI → Florida ocean delivery
  customsRegistration: 3000,  // customs broker + USCG documentation
  marginTarget: 0.20,         // we list at landed cost × (1 + marginTarget)
  retailComp: 1.87,           // US-listed comparable cats retail at ~1.87× BVI ask (docs)
  // Per-deal soft costs deducted from gross margin to reach net
  cacPerDeal: 8000,
  legalPerDeal: 3500,
  transitReserve: 3500,
  capitalPerDeal: 0,
  escrowAgent: 'Yachtworld Escrow',
  // Regulatory
  license: 'Pending FL DBPR Yacht & Ship Broker License (FS 326)',
  // Contact
  domain: 'tradewindandco.com',
  phone: '(305) 555-0188',
  email: 'desk@tradewindandco.com',
  emailLeads: 'inquiries@tradewindandco.com',
  hq: 'Miami, Florida',
  address: '1450 Brickell Avenue, Suite 1900',
  cityStateZip: 'Miami, FL 33131',
  officeHours: 'Mon–Fri 9am–6pm EST · Sat by appointment',
  established: 2026,
  team: [
    { name: 'Brand Marshall', role: 'Founder · Sourcing & Strategy', bio: 'Twenty years of cross-border logistics. Builds the BVI sourcing pipeline and runs the marketing side.' },
    { name: 'Chris Halloway', role: 'Operations · Deal Execution', bio: 'Former rental-property operator. Runs the customer relationship from inspection through handover. FL Yacht & Ship Salesperson License pending.' },
    { name: 'Christian Reyes', role: 'General Counsel', bio: 'Commercial litigation attorney with insurance expertise. Drafts our contracts and reviews every transaction.' },
  ],
};

// ============================== Pricing math ==============================

function landedCost(boat, duty) {
  const d = duty ?? SETTINGS.importDuty;
  return boat.bviAsk + SETTINGS.prepCost + boat.bviAsk * d + SETTINGS.oceanDelivery + SETTINGS.customsRegistration;
}
function listPriceFor(boat, duty) {
  const raw = landedCost(boat, duty) * (1 + SETTINGS.marginTarget);
  return Math.round(raw / 5000) * 5000;
}
function grossMargin(boat, duty) {
  return listPriceFor(boat, duty) - landedCost(boat, duty);
}
function perDealCost() {
  return SETTINGS.cacPerDeal + SETTINGS.legalPerDeal + SETTINGS.transitReserve;
}
function netMargin(boat, duty) {
  return grossMargin(boat, duty) - perDealCost();
}
function buyerSavings(boat, duty) {
  return boat.usRetailComp - listPriceFor(boat, duty);
}

// ============================== Photos ==============================
// HERO photo — Sandy Spit, Jost Van Dyke, BVI. Wikimedia Commons, hotlink-OK.
const HERO_PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/d/df/Sandy_Spit%2C_Jost_Van_Dyke.jpg';

// Placeholder for any boat that ever ends up with missing photos.
function photoUrl(label, view, w = 1200, h = 700) {
  const text = encodeURIComponent(`${label}\n— ${view} —`);
  return `https://placehold.co/${w}x${h}/1f6e72/f7f3eb?text=${text}&font=playfair`;
}

// ============================== Inventory (REAL listings) ==============================

const BOATS = [
  {
    id: 'leopard40-araume-iv',
    slug: 'araume-iv',
    category: '40ft',
    categoryLabel: '40 ft · 4-cabin',
    year: 2019,
    make: 'Leopard',
    model: '40',
    name: 'Araume IV',
    headline: 'Ex-Moorings owner-version 4-cabin — completed world-class refit at the St Lucia base.',
    loa: '39\' 4"',
    beam: '21\' 1"',
    draft: '4\' 1"',
    cabins: 4,
    heads: 2,
    berths: 8,
    engines: 'Twin Yanmar 3YM30 AE — 29 hp ea., Sail Drive SD20',
    engineHours: 2405,
    fuelGal: 95,
    waterGal: 206,
    sails: 'Main + jib (factory rig, well maintained)',
    electronics: 'Raymarine plotter · autopilot · standard Moorings nav suite',
    extras: 'Generator · A/C · 2-blade aluminum props · holding tank · post-refit cosmetics May 2026',
    originatingFleet: 'Moorings',
    phaseOutDate: '2025-04-15',
    bviAsk: 309000,
    usRetailComp: 555000,
    usComps: [
      { year: 2019, make: 'Leopard', model: '40', priceUSD: 535000, location: 'Fort Lauderdale, FL', source: 'YachtWorld', searchUrl: 'https://www.yachtworld.com/boats-for-sale/type-sail/class-catamaran/make-leopard/model-leopard-40/' },
      { year: 2019, make: 'Leopard', model: '40', priceUSD: 565000, location: 'Annapolis, MD', source: 'The Multihull Company', searchUrl: 'https://www.multihullcompany.com/sailboats-for-sale/' },
      { year: 2020, make: 'Leopard', model: '40', priceUSD: 589000, location: 'St. Petersburg, FL', source: 'Just Catamarans', searchUrl: 'https://justcatamarans.net/listings/' },
    ],
    location: { harbor: 'Road Town', country: 'Tortola, BVI', region: 'British Virgin Islands' },
    destinationPort: 'Fort Lauderdale, FL',
    inspectionWindows: ['Jun 3–10', 'Jun 24–Jul 1', 'Jul 22–29'],
    remoteVideoAvailable: true,
    sourceBroker: 'Moorings Brokerage',
    sourceListing: 'mooringsbrokerage.com #9681517',
    sourceUrl: 'https://www.mooringsbrokerage.com/used-boats/2019-leopard-40-virgin-islands-british-araume-iv-9681517',
    sourceListed: '2026-02-04',
    sourceLastChecked: '2026-05-18',
    sourcePriceHistory: [
      { date: '2026-02-04', price: 329000 },
      { date: '2026-04-02', price: 318000 },
      { date: '2026-05-08', price: 309000 },
    ],
    badge: 'Anchor Listing',
    status: 'available',
    daysActive: 103,
    leads: 14,
    inspections: 1,
    photos: [
      { url: 'photos/leopard40-araume-iv/1.jpg', label: 'At anchor, BVI' },
      { url: 'photos/leopard40-araume-iv/2.jpg', label: 'Cockpit & helm' },
      { url: 'photos/leopard40-araume-iv/3.jpg', label: 'Saloon & galley' },
      { url: 'photos/leopard40-araume-iv/4.jpg', label: 'Owner\'s cabin' },
    ],
    photoCount: 57,
    description:
      'Ex-Moorings Leopard 40 in owner-version 4-cabin configuration. Recently completed world-class refit at the St Lucia base following a comprehensive independent survey. Featuring the modern Simonis & Voogd-designed hull with forward-facing galley, panoramic saloon windows, and large sliding glass doors creating fluid indoor-outdoor living between saloon and aft cockpit. Twin Yanmar 3YM30s with Sail Drive SD20, holding tank, generator, and complete navigation suite. Survey-clean, dock-ready. Broker: Richard Vass, The Moorings Yacht Brokerage.',
    internalNotes:
      'Moorings has cut twice (-$20K). Local broker indicates seller would entertain $305K cash close. Sea-Tech Marine confirmed surveyor access on 48h notice.',
  },
  {
    id: 'leopard40-ocean-breeze',
    slug: 'ocean-breeze',
    category: '40ft',
    categoryLabel: '40 ft · 3-cabin owner',
    year: 2019,
    make: 'Leopard',
    model: '40',
    name: 'Ocean Breeze',
    headline: 'Ex-Moorings 3-cabin owner version — phase-out complete November 2025, French Polynesia base.',
    loa: '39\' 4"',
    beam: '22\' 1"',
    draft: '4\' 1"',
    cabins: 3,
    heads: 2,
    berths: 6,
    engines: 'Twin Yanmar 3YM30AE — 29 hp ea., Sail Drive SD20',
    engineHours: 2950,
    fuelGal: 95,
    waterGal: 206,
    sails: 'Main + jib + Code-D (factory)',
    electronics: 'Raymarine Axiom · autopilot · Moorings nav suite',
    extras: 'Generator · A/C · solar panels on hard-top bimini · ash white interior · holding tank',
    originatingFleet: 'Moorings (Raiatea)',
    phaseOutDate: '2025-11-04',
    bviAsk: 305700,
    usRetailComp: 555000,
    usComps: [
      { year: 2019, make: 'Leopard', model: '40', priceUSD: 539000, location: 'Miami, FL', source: 'YachtWorld', searchUrl: 'https://www.yachtworld.com/boats-for-sale/type-sail/class-catamaran/make-leopard/model-leopard-40/' },
      { year: 2019, make: 'Leopard', model: '40', priceUSD: 569000, location: 'Newport, RI', source: 'The Multihull Company', searchUrl: 'https://www.multihullcompany.com/sailboats-for-sale/' },
      { year: 2020, make: 'Leopard', model: '40', priceUSD: 599000, location: 'San Diego, CA', source: 'Boat Trader', searchUrl: 'https://www.boattrader.com/sailboats/make-leopard/model-40/' },
    ],
    location: { harbor: 'Uturoa (Raiatea)', country: 'French Polynesia', region: 'Repositioning to Caribbean' },
    destinationPort: 'Fort Lauderdale, FL',
    inspectionWindows: ['Remote video only until Aug 15 (mid-passage)', 'In-person Sep 12 onward at Tortola arrival'],
    remoteVideoAvailable: true,
    sourceBroker: 'Moorings Brokerage',
    sourceListing: 'mooringsbrokerage.com #9851646',
    sourceUrl: 'https://www.mooringsbrokerage.com/used-boats/2019-leopard-40-french-polynesia-ocean-breeze-9851646',
    sourceListed: '2026-01-22',
    sourceLastChecked: '2026-05-18',
    sourcePriceHistory: [
      { date: '2026-01-22', price: 322000 },
      { date: '2026-03-19', price: 305700 },
    ],
    badge: 'Under Deposit',
    status: 'under-deposit',
    daysActive: 116,
    leads: 9,
    inspections: 0,
    photos: [
      { url: 'photos/leopard40-ocean-breeze/1.jpg', label: 'Profile, Polynesia' },
      { url: 'photos/leopard40-ocean-breeze/2.jpg', label: 'Helm station' },
      { url: 'photos/leopard40-ocean-breeze/3.jpg', label: 'Saloon (owner version)' },
      { url: 'photos/leopard40-ocean-breeze/4.jpg', label: 'Owner\'s cabin (3-cabin layout)' },
    ],
    photoCount: 62,
    description:
      'Single-owner 3-cabin Leopard 40 with ash white interior finish, regularly maintained through The Moorings Raiatea charter program. Complete phase-out maintenance executed November 2025 prior to leaving the fleet. Generator, A/C, and solar panels fitted to the hard-top bimini for battery charging. Price includes Papeetized French tax — €260K with tax included. Buyer (Bell, Miami FL) under deposit; close scheduled on Tortola arrival following reposition. Broker: Moorings Yacht Brokerage, Dania Beach.',
    internalNotes:
      'Under deposit since 4/14 — buyer wired $30K. Hull arrival in Tortola tracking Sep 12. Insurance binder in place through transit.',
  },
  {
    id: 'leopard40-game-day',
    slug: 'game-day',
    category: '40ft',
    categoryLabel: '40 ft · 3-cabin owner',
    year: 2020,
    make: 'Leopard',
    model: '40',
    name: 'Game Day',
    headline: 'Ex-Moorings 3-cabin owner Leopard 40 in BVI — no storm damage, lighter ash interior.',
    loa: '39\' 4"',
    beam: '21\' 1"',
    draft: '4\' 1"',
    cabins: 3,
    heads: 2,
    berths: 6,
    engines: 'Twin Yanmar 3YM30 AE — 29 hp ea. (2019), Sail Drive SD20',
    engineHours: 2890,
    fuelGal: 95,
    waterGal: 206,
    sails: 'Main + jib (factory rig)',
    electronics: 'Raymarine plotter · autopilot · standard Moorings nav suite',
    extras: 'A/C · generator · Yanmar engines · electric davits · walk-through forward door · lighter ash interior',
    originatingFleet: 'Moorings',
    phaseOutDate: '2025-08-22',
    bviAsk: 319000,
    usRetailComp: 580000,
    usComps: [
      { year: 2020, make: 'Leopard', model: '40', priceUSD: 555000, location: 'Fort Lauderdale, FL', source: 'YachtWorld', searchUrl: 'https://www.yachtworld.com/boats-for-sale/type-sail/class-catamaran/make-leopard/model-leopard-40/' },
      { year: 2020, make: 'Leopard', model: '40', priceUSD: 595000, location: 'Newport, RI', source: 'The Multihull Company', searchUrl: 'https://www.multihullcompany.com/sailboats-for-sale/' },
      { year: 2021, make: 'Leopard', model: '40', priceUSD: 625000, location: 'St. Petersburg, FL', source: 'Boat Trader', searchUrl: 'https://www.boattrader.com/sailboats/make-leopard/model-40/' },
    ],
    location: { harbor: 'Tortola', country: 'Tortola, BVI', region: 'British Virgin Islands' },
    destinationPort: 'Stuart, FL',
    inspectionWindows: ['Jun 14–21', 'Jul 5–12', 'Aug 9–16'],
    remoteVideoAvailable: true,
    sourceBroker: 'Moorings Brokerage',
    sourceListing: 'mooringsbrokerage.com #9425408',
    sourceUrl: 'https://www.mooringsbrokerage.com/used-boats/2020-leopard-40-virgin-islands-british-game-day-9425408',
    sourceListed: '2026-01-15',
    sourceLastChecked: '2026-05-18',
    sourcePriceHistory: [
      { date: '2026-01-15', price: 339000 },
      { date: '2026-04-08', price: 319000 },
    ],
    status: 'available',
    daysActive: 123,
    leads: 8,
    inspections: 0,
    photos: [
      { url: 'photos/leopard40-game-day/1.jpg', label: 'On the hook' },
      { url: 'photos/leopard40-game-day/2.jpg', label: 'Cockpit' },
      { url: 'photos/leopard40-game-day/3.jpg', label: 'Saloon (ash interior)' },
      { url: 'photos/leopard40-game-day/4.jpg', label: 'Owner\'s cabin' },
    ],
    photoCount: 66,
    description:
      'Newer ex-Moorings 3-cabin owner-version Leopard 40 with the lighter ash interior. Modern Simonis & Voogd design with forward-facing galley and panoramic saloon. No storm damage history. Equipped with air conditioning, generator, Yanmar engines, electric davits, and walk-through forward door. Available with phase-out OR as-is/where-is. Broker: Giles Wood, Moorings Yacht Brokerage.',
    internalNotes:
      'Recent $20K price cut. Seller open to as-is/where-is which removes phase-out lead time. Strong candidate for fast-close buyer.',
  },
  {
    id: 'leopard45-kokamo',
    slug: 'kokamo',
    category: '45ft',
    categoryLabel: '45 ft · 4-cabin crewed-spec',
    year: 2020,
    make: 'Leopard',
    model: '45',
    name: 'Kokamo',
    headline: 'Rare crewed-version Leopard 45 with upgraded spec — reduced usage from Covid years.',
    loa: '45\' 0"',
    beam: '24\' 2"',
    draft: '4\' 11"',
    cabins: 4,
    heads: 5,
    berths: 10,
    engines: 'Twin Yanmar 4JH45 — 45 hp ea. (2019), SD60 saildrives',
    engineHours: 1273,
    fuelGal: 91,
    waterGal: 103,
    sails: 'Ullman fully battened main · roller-furling genoa · electric Lewmar winches',
    electronics: 'Raymarine full suite · autopilot · ADS-B AIS',
    extras: 'Northern Lights 9 kW genset · Sea Recovery watermaker · flexi teak cockpit · cockpit refrigerator · inverter · 2× Cruisair 16K BTU A/C · 2× 100W solar · hardtop bimini',
    originatingFleet: 'Moorings (crewed program)',
    phaseOutDate: '2024-12-08',
    bviAsk: 419000,
    usRetailComp: 725000,
    usComps: [
      { year: 2019, make: 'Leopard', model: '45', priceUSD: 695000, location: 'Miami, FL', source: 'YachtWorld', searchUrl: 'https://www.yachtworld.com/boats-for-sale/type-sail/class-catamaran/make-leopard/model-leopard-45/' },
      { year: 2020, make: 'Leopard', model: '45', priceUSD: 745000, location: 'Charleston, SC', source: 'The Multihull Company', searchUrl: 'https://www.multihullcompany.com/sailboats-for-sale/' },
      { year: 2020, make: 'Leopard', model: '45', priceUSD: 765000, location: 'Newport, RI', source: 'Boat Trader', searchUrl: 'https://www.boattrader.com/sailboats/make-leopard/model-45/' },
    ],
    location: { harbor: 'Tortola', country: 'Tortola, BVI', region: 'British Virgin Islands' },
    destinationPort: 'Stuart, FL',
    inspectionWindows: ['May 31–Jun 7', 'Jun 21–28', 'Jul 12–19'],
    remoteVideoAvailable: true,
    sourceBroker: 'Moorings Brokerage',
    sourceListing: 'mooringsbrokerage.com #9478689',
    sourceUrl: 'https://www.mooringsbrokerage.com/used-boats/2020-leopard-45-virgin-islands-british-kokamo-9478689',
    sourceListed: '2025-12-14',
    sourceLastChecked: '2026-05-18',
    sourcePriceHistory: [
      { date: '2025-12-14', price: 449000 },
      { date: '2026-03-01', price: 419000 },
    ],
    badge: 'Featured',
    status: 'inspection-scheduled',
    daysActive: 156,
    inspections: 2,
    leads: 22,
    photos: [
      { url: 'photos/leopard45-kokamo/1.jpg', label: 'Under sail' },
      { url: 'photos/leopard45-kokamo/2.jpg', label: 'Flybridge helm' },
      { url: 'photos/leopard45-kokamo/3.jpg', label: 'Saloon & galley' },
      { url: 'photos/leopard45-kokamo/4.jpg', label: 'Master cabin' },
    ],
    photoCount: 68,
    description:
      'Rare crewed-version Leopard 45 with upgraded specification throughout — only 1,273 engine hours due to reduced usage during Covid years. Notable upgrades include flexi teak in cockpits, cockpit refrigerator, watermaker, inverter, and 2× Cruisair 16K BTU air conditioning. Northern Lights 9kW generator, Sea Recovery watermaker, dual 100W solar panels, hardtop bimini. Ullman fully-battened mainsail with electric Lewmar primary winches and roller-furling genoa. Broker: Giles Wood, Moorings Yacht Brokerage.',
    internalNotes:
      'Best margin/effort ratio in current inventory at $106K gross at 20% duty. Two inspections pending (Whitman 5/31, Royce 6/21). Hold price at $419K — broker confirmed seller firm above $410K.',
  },
  {
    id: 'leopard45-soul-rebel',
    slug: 'soul-rebel',
    category: '45ft',
    categoryLabel: '45 ft · 4-cabin + crew',
    year: 2019,
    make: 'Leopard',
    model: '45',
    name: 'Soul Rebel',
    headline: 'Single-owner ex-Moorings Leopard 45, lithium-ready, Raymarine Axiom suite.',
    loa: '45\' 0"',
    beam: '24\' 1"',
    draft: '4\' 11"',
    cabins: 4,
    heads: 4,
    berths: 10,
    engines: 'Twin Yanmar 4JH45C — 45 hp ea., saildrives',
    engineHours: 2800,
    fuelGal: 185,
    waterGal: 206,
    sails: 'Stackpack lazyjack main · furling headsail · electric Lewmar primary winches',
    electronics: 'Raymarine Axiom 9 · autopilot · navigation suite',
    extras: 'Northern Lights 9 kW genset · Sea Recovery 117 L/hr watermaker · 630 Ah house battery · Corian galley · Vitrifrigo 2-drawer fridge/freezer · mainsheet bridle · crew cabin',
    originatingFleet: 'Moorings',
    phaseOutDate: '2024-05-30',
    bviAsk: 355000,
    usRetailComp: 675000,
    usComps: [
      { year: 2019, make: 'Leopard', model: '45', priceUSD: 649000, location: 'Fort Lauderdale, FL', source: 'YachtWorld', searchUrl: 'https://www.yachtworld.com/boats-for-sale/type-sail/class-catamaran/make-leopard/model-leopard-45/' },
      { year: 2019, make: 'Leopard', model: '45', priceUSD: 685000, location: 'Annapolis, MD', source: 'The Multihull Company', searchUrl: 'https://www.multihullcompany.com/sailboats-for-sale/' },
      { year: 2020, make: 'Leopard', model: '45', priceUSD: 705000, location: 'St. Petersburg, FL', source: 'Just Catamarans', searchUrl: 'https://justcatamarans.net/listings/' },
    ],
    location: { harbor: 'Virgin Gorda', country: 'BVI', region: 'British Virgin Islands' },
    destinationPort: 'Fort Lauderdale, FL',
    inspectionWindows: ['May 31–Jun 7', 'Jun 21–28', 'Jul 19–26'],
    remoteVideoAvailable: true,
    sourceBroker: 'BVI Yacht Sales',
    sourceListing: 'bviyachtsales.com #2848720',
    sourceUrl: 'https://bviyachtsales.com/yacht/2848720/2019-Robertson&Caine-45-Leopard-SoulRebel',
    sourceListed: '2024-09-10',
    sourceLastChecked: '2026-05-18',
    sourcePriceHistory: [
      { date: '2024-09-10', price: 399000 },
      { date: '2025-04-22', price: 379000 },
      { date: '2025-11-04', price: 365000 },
      { date: '2026-03-15', price: 355000 },
    ],
    badge: 'Widest Spread',
    status: 'available',
    daysActive: 615,
    leads: 19,
    inspections: 1,
    photos: [
      { url: 'photos/leopard45-soul-rebel/1.jpg', label: 'Profile, Virgin Gorda' },
      { url: 'photos/leopard45-soul-rebel/2.jpg', label: 'Cockpit & helm' },
      { url: 'photos/leopard45-soul-rebel/3.jpg', label: 'Saloon' },
      { url: 'photos/leopard45-soul-rebel/4.jpg', label: 'Master cabin' },
    ],
    photoCount: 21,
    description:
      'Single-owner 2019 Leopard 45 in 4-cabin + crew cabin configuration, primary Moorings charter service Jan 2019 - May 2024, then transferred out of charter for handover work mid-2024 and lightly used since. Twin Yanmar 45HP engines with saildrives, Northern Lights 9kW generator, Sea Recovery 117 L/hr watermaker, 630Ah house bank, Raymarine Axiom 9 navigation suite. Large galley with Corian countertops and Vitrifrigo 2-drawer fridge/freezer. Stackpack lazyjack, mainsheet bridle, furling headsail. Routine maintenance only since charter exit. Broker: Ted Reshetiloff, BVI Yacht Sales.',
    internalNotes:
      'Three price cuts (-$44K total) since Sep 2024. Seller motivated — extended dockage exposure. Highest buyer-savings opportunity in current inventory at $135K vs comp.',
  },
  {
    id: 'lagoon450f-miss-summer',
    slug: 'miss-summer',
    category: '45ft',
    categoryLabel: '45 ft · 4-cabin + crew',
    year: 2014,
    make: 'Lagoon',
    model: '450F',
    name: 'Miss Summer',
    headline: 'Heavily refit 2014 Lagoon 450F — 1200Ah lithium, 600W solar, 2022 standing rigging. Survey passed with NO recommendations.',
    loa: '45\' 0"',
    beam: '25\' 10"',
    draft: '4\' 3"',
    cabins: 4,
    heads: 4,
    berths: 12,
    engines: 'Twin Yanmar 4JH5E — 54 hp ea., SD60 saildrives (replaced 2022), 3-blade fixed Volvo props (2021)',
    engineHours: 3000,
    fuelGal: 275,
    waterGal: 185,
    sails: '2022 standing rigging · refreshed canvas',
    electronics: 'Mastervolt inverter/charger · Raymarine navigation',
    extras: 'Cummins Onan 13.5 kW genset · 1200 Ah lithium bank · 600W solar · Micro-Air EasyStarts · 2 cabin AC overnight off-grid · high-output watermaker · refreshed upholstery & canvas · 4× 175L water tanks',
    originatingFleet: 'Private owner (refit-focused)',
    phaseOutDate: null,
    bviAsk: 445000,
    usRetailComp: 725000,
    usComps: [
      { year: 2014, make: 'Lagoon', model: '450', priceUSD: 525000, location: 'Tampa, FL', source: 'YachtWorld', searchUrl: 'https://www.yachtworld.com/boats-for-sale/type-sail/class-catamaran/make-lagoon/model-lagoon-450/' },
      { year: 2015, make: 'Lagoon', model: '450', priceUSD: 625000, location: 'San Diego, CA', source: 'The Multihull Company', searchUrl: 'https://www.multihullcompany.com/sailboats-for-sale/' },
      { year: 2015, make: 'Lagoon', model: '450 (lithium refit)', priceUSD: 745000, location: 'Annapolis, MD', source: 'YachtWorld', searchUrl: 'https://www.yachtworld.com/boats-for-sale/type-sail/class-catamaran/make-lagoon/' },
    ],
    location: { harbor: 'Nanny Cay', country: 'Tortola, BVI', region: 'British Virgin Islands' },
    destinationPort: 'Tampa, FL',
    inspectionWindows: ['Jun 7–14', 'Jul 5–12', 'Aug 23–30'],
    remoteVideoAvailable: true,
    sourceBroker: 'BVI Yacht Sales',
    sourceListing: 'bviyachtsales.com #2847342',
    sourceUrl: 'https://bviyachtsales.com/yacht/2847342/2014-Lagoon-45-450F-MissSummer',
    sourceListed: '2025-11-30',
    sourceLastChecked: '2026-05-18',
    sourcePriceHistory: [
      { date: '2025-11-30', price: 479000 },
      { date: '2026-02-15', price: 459000 },
      { date: '2026-04-20', price: 445000 },
    ],
    badge: 'Off-Grid Ready',
    status: 'available',
    daysActive: 170,
    leads: 11,
    inspections: 0,
    photos: [
      { url: 'photos/lagoon450f-miss-summer/1.jpg', label: 'Profile, Nanny Cay' },
      { url: 'photos/lagoon450f-miss-summer/2.jpg', label: 'Cockpit' },
      { url: 'photos/lagoon450f-miss-summer/3.jpg', label: 'Saloon (lithium-quiet)' },
      { url: 'photos/lagoon450f-miss-summer/4.jpg', label: 'Master cabin' },
    ],
    photoCount: 21,
    description:
      'Although Miss Summer is a 2014 model, nothing about this yacht reflects her age. Exceptional level of refit including 1200Ah lithium house bank, Mastervolt inverter/charger suite, 600W solar, Micro-Air EasyStarts delivering true off-grid capability — silent nights on lithium power with one to two air-conditioning units overnight, no generator required. 2022 standing rigging, SD60 saildrives, refreshed upholstery and canvas. Cummins Onan 13.5kW generator, high-output watermaker. Most recent survey passed with NO recommendations. Broker: Elizabeth Day, BVI Yacht Sales.',
    internalNotes:
      'Premium refit positioning supports higher retail comp ($725K). Margin tighter than other inventory but appeals to off-grid liveaboard buyer profile. Survey-clean.',
  },
  {
    id: 'lagoon42-frost-free',
    slug: 'frost-free',
    category: '40ft',
    categoryLabel: '42 ft · 4-cabin',
    year: 2020,
    make: 'Lagoon',
    model: '42',
    name: 'Frost Free',
    headline: 'Released from Moorings charter with minimal Covid-era usage — upgraded Northern Lights generator + Sea Recovery watermaker.',
    loa: '42\' 0"',
    beam: '25\' 3"',
    draft: '4\' 1"',
    cabins: 4,
    heads: 4,
    berths: 8,
    engines: 'Twin Yanmar 4JH45 — 45 hp ea., 3-blade aluminum props',
    engineHours: 1850,
    fuelGal: 158,
    waterGal: 185,
    sails: 'Main + self-tacking jib (factory rig)',
    electronics: 'B&G chart plotter · autopilot · Moorings nav suite',
    extras: 'Northern Lights 6 kW genset · Sea Recovery watermaker · A/C · galley fully equipped · extensive nav electronics',
    originatingFleet: 'Moorings',
    phaseOutDate: '2025-09-18',
    bviAsk: 329000,
    usRetailComp: 585000,
    usComps: [
      { year: 2019, make: 'Lagoon', model: '42', priceUSD: 549000, location: 'Fort Lauderdale, FL', source: 'YachtWorld', searchUrl: 'https://www.yachtworld.com/boats-for-sale/type-sail/class-catamaran/make-lagoon/model-lagoon-42/' },
      { year: 2020, make: 'Lagoon', model: '42', priceUSD: 595000, location: 'Annapolis, MD', source: 'The Multihull Company', searchUrl: 'https://www.multihullcompany.com/sailboats-for-sale/' },
      { year: 2020, make: 'Lagoon', model: '42', priceUSD: 619000, location: 'Newport, RI', source: 'Just Catamarans', searchUrl: 'https://justcatamarans.net/listings/' },
    ],
    location: { harbor: 'Marigot', country: 'Saint Martin (French)', region: 'Northern Caribbean' },
    destinationPort: 'Fort Lauderdale, FL',
    inspectionWindows: ['Jun 21–28', 'Jul 26–Aug 2', 'Sep 6–13'],
    remoteVideoAvailable: true,
    sourceBroker: 'Moorings Brokerage',
    sourceListing: 'mooringsbrokerage.com #9955610',
    sourceUrl: 'https://www.mooringsbrokerage.com/used-boats/2020-lagoon-42-virgin-islands-british-frost-free-9955610',
    sourceListed: '2026-03-11',
    sourceLastChecked: '2026-05-18',
    sourcePriceHistory: [{ date: '2026-03-11', price: 329000 }],
    status: 'available',
    daysActive: 68,
    leads: 8,
    inspections: 0,
    photos: [
      { url: 'photos/lagoon42-frost-free/1.jpg', label: 'Profile' },
      { url: 'photos/lagoon42-frost-free/2.jpg', label: 'Cockpit' },
      { url: 'photos/lagoon42-frost-free/3.jpg', label: 'Saloon' },
      { url: 'photos/lagoon42-frost-free/4.jpg', label: 'Cabin' },
    ],
    photoCount: 8,
    description:
      'Released from the Moorings charter fleet with minimal usage during the Covid period — only 1,850 engine hours on a 2020-model hull. Notable upgrades include Northern Lights 6kW generator and Sea Recovery watermaker. Well-spec\'d throughout with extensive galley equipment and navigation electronics. B&G chart plotter, autopilot, complete Moorings nav suite. Twin Yanmar 4JH45s with 3-blade aluminum props. Broker: Giles Wood, Moorings Yacht Brokerage.',
    internalNotes:
      'Just listed — no source price movement yet. Saint Martin location (French side) is European-VAT-not-paid which simplifies our offshore-export documentation. Photo set on source is light at 8 shots.',
  },
  {
    id: 'bali45-four-sevens',
    slug: 'four-sevens',
    category: '45ft',
    categoryLabel: '45 ft · 3-cabin owner',
    year: 2015,
    make: 'Bali',
    model: '4.5',
    name: 'Four Sevens',
    headline: 'Solar + lithium 2015 Bali 4.5 — generous owner version, Grenada-based, ready for cruising or liveaboard.',
    loa: '45\' 0"',
    beam: '24\' 7"',
    draft: '4\' 5"',
    cabins: 3,
    heads: 3,
    berths: 8,
    engines: 'Twin Nanni diesel — 50 hp ea. (100 hp total)',
    engineHours: 3200,
    fuelGal: 158,
    waterGal: 211,
    sails: 'Main + self-tacking jib (Bali signature folding aft door layout)',
    electronics: 'Raymarine plotter · autopilot · radar',
    extras: 'Solar panel array · lithium house bank · generator · large refrigerator/freezer · 48" smart TV · expansive viewing windows · spacious storage · folding garage door',
    originatingFleet: 'Private owner',
    phaseOutDate: null,
    bviAsk: 449000,
    usRetailComp: 735000,
    usComps: [
      { year: 2015, make: 'Bali', model: '4.5', priceUSD: 695000, location: 'Tampa, FL', source: 'YachtWorld', searchUrl: 'https://www.yachtworld.com/boats-for-sale/type-sail/class-catamaran/make-bali/model-bali-4-5/' },
      { year: 2016, make: 'Bali', model: '4.5', priceUSD: 749000, location: 'San Diego, CA', source: 'The Multihull Company', searchUrl: 'https://www.multihullcompany.com/sailboats-for-sale/' },
      { year: 2015, make: 'Bali', model: '4.5', priceUSD: 765000, location: 'Fort Lauderdale, FL', source: 'Just Catamarans', searchUrl: 'https://justcatamarans.net/listings/' },
    ],
    location: { harbor: 'St. Georges', country: 'Grenada', region: 'Southern Caribbean' },
    destinationPort: 'Tampa, FL',
    inspectionWindows: ['Jun 14–28', 'Jul 19–Aug 9 (extended window)', 'Nov 8–22'],
    remoteVideoAvailable: true,
    sourceBroker: 'Just Catamarans',
    sourceListing: 'justcatamarans.net/bali-4-5-four-sevens',
    sourceUrl: 'https://justcatamarans.net/catamaran-listing/bali-4-5-four-sevens/',
    sourceListed: '2025-08-14',
    sourceLastChecked: '2026-05-18',
    sourcePriceHistory: [
      { date: '2025-08-14', price: 489000 },
      { date: '2025-12-02', price: 469000 },
      { date: '2026-03-30', price: 449000 },
    ],
    badge: 'Liveaboard Ready',
    status: 'inquiry',
    daysActive: 277,
    leads: 7,
    inspections: 0,
    photos: [
      { url: 'photos/bali45-four-sevens/1.jpg', label: 'Profile, Grenada' },
      { url: 'photos/bali45-four-sevens/2.jpg', label: 'Flybridge' },
      { url: 'photos/bali45-four-sevens/3.jpg', label: 'Saloon (open concept)' },
      { url: 'photos/bali45-four-sevens/4.jpg', label: 'Owner\'s cabin' },
    ],
    photoCount: 20,
    description:
      'Owner-version Bali 4.5 with the signature folding aft door layout (saloon opens fully to cockpit, single indoor-outdoor living space). Equipped for cruising or liveaboard: solar panel array, lithium house bank, generator, large refrigerator/freezer, 48" smart TV, expansive viewing windows. Twin Nanni 50hp diesels. Three-cabin owner version with three heads. Currently at Port Louis Marina, Grenada. Broker: Just Catamarans (Harbour Towne Marina, Dania Beach FL).',
    internalNotes:
      'Three price cuts (-$40K total) since Aug 2025. Grenada delivery adds 2-3 days vs BVI departure but customs paperwork identical. Hennessey Group (Sarasota, FL) inquiry from 5/11 — inspection booking pending.',
  },
];

// ============================== Sales pipeline ==============================

const PIPELINE = [
  { id: 'inq-soul-rebel', boatId: 'leopard45-soul-rebel', buyer: 'Bell · Miami, FL', stage: 'inquiry', stageDate: '2026-05-08', note: 'Remote video walkthrough completed; awaiting second-look on Leopard 45.' },
  { id: 'inq-bali45-foursevens', boatId: 'bali45-four-sevens', buyer: 'Hennessey Group · Sarasota, FL', stage: 'inquiry', stageDate: '2026-05-11', note: 'Three-call sequence; inspection slot pending for Jun 17.' },
  { id: 'insp-kokamo', boatId: 'leopard45-kokamo', buyer: 'M. Whitman · Stuart, FL', stage: 'inspection', stageDate: '2026-05-31', note: 'Flying down for sea trial May 31; survey with Sea-Tech Marine.' },
  { id: 'insp-kokamo-2', boatId: 'leopard45-kokamo', buyer: 'D. Royce · Annapolis, MD', stage: 'inspection', stageDate: '2026-06-21', note: 'Second inspection — backup buyer if Whitman walks.' },
  { id: 'dep-ocean-breeze', boatId: 'leopard40-ocean-breeze', buyer: 'Bell · Miami, FL', stage: 'deposit', stageDate: '2026-04-14', note: 'Wired $30K deposit. Close on hull arrival Tortola Sep 12.' },
];

const CLOSED_DEALS = [
  { id: 'closed-leopard45-tradewindstar', label: '2019 Leopard 45 "Tradewind Star"', bviAsk: 415000, delivered: 615000, duty: 0.20, closed: '2026-03-22', buyer: 'McAllister Family Trust · Naples, FL', destination: 'Naples, FL' },
  { id: 'closed-helia44-marigold', label: '2018 Fountaine Pajot Helia 44 "Marigold"', bviAsk: 395000, delivered: 590000, duty: 0.20, closed: '2026-01-09', buyer: 'D. Whitfield · Charleston, SC', destination: 'Charleston, SC' },
  { id: 'closed-lagoon42-pelican', label: '2017 Lagoon 42 "Pelican"', bviAsk: 275000, delivered: 425000, duty: 0.20, closed: '2025-11-20', buyer: 'Greenleaf · Sarasota, FL', destination: 'Sarasota, FL' },
];

const PIPELINE_STAGES = [
  { key: 'inquiry', label: 'Inquiry', cls: 'stage-1' },
  { key: 'inspection', label: 'Inspection', cls: 'stage-2' },
  { key: 'deposit', label: 'Under Deposit', cls: 'stage-3' },
  { key: 'delivery', label: 'Under Delivery', cls: 'stage-4' },
  { key: 'closed', label: 'Closed YTD', cls: 'stage-5' },
];

// ============================== Leads / CRM ==============================

const LEADS = [
  {
    id: 'lead-bell-miami',
    name: 'Bell · Miami, FL',
    contact: 'tbell@gmail.com · (305) 555-0117',
    boatId: 'leopard45-soul-rebel',
    status: 'qualified',
    firstContact: '2026-04-29',
    lastContact: '2026-05-08',
    source: 'YachtWorld referral',
    notes: 'Remote video walkthrough done 5/8. Wants 2nd look + financing terms on Soul Rebel.',
    budget: '$650K',
    timeline: 'Q3 2026',
    financing: 'Pre-approved · Trident Funding',
  },
  {
    id: 'lead-hennessey-sarasota',
    name: 'Hennessey Group · Sarasota, FL',
    contact: 'jhennessey@hennesseygrp.com · (941) 555-0142',
    boatId: 'bali45-four-sevens',
    status: 'inquiry',
    firstContact: '2026-05-11',
    lastContact: '2026-05-15',
    source: 'Google Ads — "import catamaran Caribbean"',
    notes: 'Flying down to inspect Four Sevens. Group decision — three principals. Wants delivery to St. Pete.',
    budget: '$800K',
    timeline: 'Q3 2026',
    financing: 'Cash',
  },
  {
    id: 'lead-whitman-stuart',
    name: 'M. Whitman · Stuart, FL',
    contact: 'mwhitman@whitmanfamily.com · (772) 555-0199',
    boatId: 'leopard45-kokamo',
    status: 'inspection-booked',
    firstContact: '2026-04-22',
    lastContact: '2026-05-14',
    source: 'Cruisers Forum thread',
    notes: 'In-person inspection May 31. Sea-Tech Marine engaged. Has owned a Leopard 38 before.',
    budget: '$650K',
    timeline: 'Q2 2026',
    financing: 'Pre-approved · Essex Credit',
  },
  {
    id: 'lead-royce-annapolis',
    name: 'D. Royce · Annapolis, MD',
    contact: 'royce@roycecpa.com · (410) 555-0166',
    boatId: 'leopard45-kokamo',
    status: 'inspection-booked',
    firstContact: '2026-05-12',
    lastContact: '2026-05-15',
    source: 'LinkedIn outreach',
    notes: 'Backup buyer for Kokamo. CPA, very analytical. Wants to see L12M source price history.',
    budget: '$650K',
    timeline: 'Q2-Q3 2026',
    financing: 'Cash',
  },
  {
    id: 'lead-mcallister-naples',
    name: 'McAllister Family Trust · Naples, FL',
    contact: 'gm@mcallistertrust.com · (239) 555-0150',
    boatId: null,
    status: 'closed',
    firstContact: '2025-12-19',
    lastContact: '2026-03-22',
    source: 'Print ad — Cruising World',
    notes: 'Closed 3/22 on Tradewind Star. Repeat buyer potential.',
    budget: '$700K',
    timeline: 'Closed',
    financing: 'Cash',
  },
  {
    id: 'lead-greenleaf-sarasota',
    name: 'Greenleaf · Sarasota, FL',
    contact: 'eg@greenleafmarine.com · (941) 555-0108',
    boatId: null,
    status: 'unqualified',
    firstContact: '2026-05-13',
    lastContact: '2026-05-13',
    source: 'Facebook group — Caribbean Sailing',
    notes: 'Budget $200K — below our threshold. Referred to Multihull Co. brokerage.',
    budget: '$200K',
    timeline: 'TBD',
    financing: 'TBD',
  },
  {
    id: 'lead-kim-sf',
    name: 'A. Kim · San Francisco, CA',
    contact: 'akim@kimmarine.com · (415) 555-0184',
    boatId: 'bali45-four-sevens',
    status: 'inquiry',
    firstContact: '2026-05-14',
    lastContact: '2026-05-15',
    source: 'Google search — direct',
    notes: 'West Coast buyer — wants Pacific delivery option on Four Sevens. Need to quote alt route via Panama.',
    budget: '$850K',
    timeline: 'Q4 2026',
    financing: 'Pre-approved · Sterling Associates',
  },
];

const LEAD_STAGES = [
  { key: 'inquiry', label: 'Inquiry' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'inspection-booked', label: 'Inspection Booked' },
  { key: 'under-deposit', label: 'Under Deposit' },
  { key: 'closed', label: 'Closed' },
  { key: 'unqualified', label: 'Unqualified' },
];

// ============================== Vendor directory ==============================

const VENDORS = [
  { category: 'Legal — US', name: 'Robert Allen Law', role: 'US maritime attorney', contact: 'rallen@robertallenlaw.com · (305) 372-9800', location: 'Miami, FL', notes: 'Retained — drafts purchase agreements, escrow disbursement instructions, owner-exemption opinions.', lastContact: '2026-05-10' },
  { category: 'Legal — US', name: 'Christian Reyes', role: 'General counsel (internal)', contact: 'christian@tradewindandco.com', location: 'Miami, FL', notes: 'In-house counsel. Insurance litigation background. Reviews every transaction.', lastContact: '2026-05-15' },
  { category: 'Legal — BVI', name: 'Conyers Dill & Pearman', role: 'BVI maritime attorney', contact: 'm.smith@conyers.com · +1 284 494 7558', location: 'Road Town, Tortola, BVI', notes: 'BVI Ships Registry work, bill of sale, lien releases, BVI Customs export.', lastContact: '2026-05-12' },
  { category: 'Accounting', name: 'Whitley Marine CPA', role: 'Maritime CPA', contact: 'jwhitley@whitleymarine.com · (954) 555-0177', location: 'Fort Lauderdale, FL', notes: 'Sales tax modeling, S-corp planning, quarterly estimates, FL DOR filings.', lastContact: '2026-04-30' },
  { category: 'Escrow', name: 'Yachtworld Escrow', role: 'Primary maritime escrow', contact: 'closings@yachtworldescrow.com · (954) 524-4250', location: 'Fort Lauderdale, FL', notes: 'Master account active. Milestone-based disbursement workflow established.', lastContact: '2026-05-14' },
  { category: 'Escrow', name: 'All Points Title', role: 'Backup maritime escrow', contact: 'service@allpointstitle.com · (954) 564-1212', location: 'Fort Lauderdale, FL', notes: 'Secondary relationship. Use if Yachtworld unavailable.', lastContact: '2026-04-22' },
  { category: 'Customs', name: 'Bayport Customs Brokers', role: 'US customs broker', contact: 'imports@bayportcustoms.com · (954) 760-4404', location: 'Fort Lauderdale, FL', notes: 'CBP-7501 vessel-class entries. Handles 30+/year. Pre-arrival document review included.', lastContact: '2026-05-11' },
  { category: 'Survey', name: 'Sea-Tech Marine', role: 'BVI marine surveyor', contact: 'survey@seatechmarine.vg · +1 284 494 2120', location: 'Road Town, Tortola, BVI', notes: 'Primary surveyor. 48h report turnaround. Buyer-billed direct.', lastContact: '2026-05-09' },
  { category: 'Delivery', name: 'Captain Eddie Mendez', role: 'Delivery captain (primary)', contact: 'eddiem@bluewatercaptains.com · (305) 555-0144', location: 'Miami, FL', notes: 'USCG Master 100T. 28+ Caribbean → FL deliveries. Crew of 2-3 standard.', lastContact: '2026-05-13' },
  { category: 'Delivery', name: 'Captain Sarah Kettering', role: 'Delivery captain (backup)', contact: 'skettering@oceancrew.com · (954) 555-0188', location: 'Stuart, FL', notes: 'USCG Master 200T. Pacific + Caribbean experience. Available June-September.', lastContact: '2026-04-18' },
  { category: 'Insurance', name: 'Pantaenius USA', role: 'Marine hull + transit insurance', contact: 'quotes@pantaenius.us · (410) 268-1111', location: 'Annapolis, MD', notes: 'Transit binders + permanent hull. 48h binder turnaround.', lastContact: '2026-05-08' },
  { category: 'Insurance', name: 'Markel', role: 'Backup marine insurance', contact: 'marine@markel.com · (804) 285-2700', location: 'Glen Allen, VA', notes: 'Alternative carrier. Used when Pantaenius declines.', lastContact: '2026-04-03' },
  { category: 'Documentation', name: 'Maritime Documentation Center', role: 'USCG documentation service', contact: 'docs@maritimedoc.com · (800) 555-0234', location: 'Bradenton, FL', notes: 'CG-1258 filings, foreign-built vessel documentation. ~$700/deal.', lastContact: '2026-05-06' },
  { category: 'Yard', name: 'Lauderdale Marine Center', role: 'FL arrival yard', contact: 'service@lauderdalemarine.com · (954) 713-0700', location: 'Fort Lauderdale, FL', notes: 'Standing yard agreement. Wash, system check, minor cosmetic. ~$1,500/deal.', lastContact: '2026-05-01' },
  { category: 'Source brokers', name: 'Moorings Brokerage', role: 'Primary BVI source broker', contact: 'rvass@mooringsbrokerage.com · +1 954 925-4150', location: 'Dania Beach, FL · Tortola, BVI', notes: 'Richard Vass (Araume IV), Giles Wood (Kokamo, Game Day, Frost Free). Five active listings in our pipeline.', lastContact: '2026-05-15' },
  { category: 'Source brokers', name: 'BVI Yacht Sales', role: 'BVI aggregator broker', contact: 'ted@bviyachtsales.com · (941) 900-4510 x1070', location: 'Nanny Cay, Tortola, BVI', notes: 'Ted Reshetiloff (Soul Rebel), Elizabeth Day (Miss Summer). Multi-fleet aggregator — pull title search every time.', lastContact: '2026-05-12' },
  { category: 'Source brokers', name: 'The Multihull Company', role: 'US-based aggregator', contact: 'phil@multihullcompany.com · (215) 508-2704', location: 'Philadelphia, PA / multiple', notes: 'Aggregates BVI + Caribbean listings. Used for cross-reference comps.', lastContact: '2026-05-10' },
  { category: 'Source brokers', name: 'Just Catamarans', role: 'Catamaran specialist broker', contact: 'sales@justcatamarans.net · (954) 589-2343', location: 'Dania Beach, FL', notes: 'Source for Four Sevens (Bali 4.5, Grenada). Strong on Lagoon and FP inventory.', lastContact: '2026-05-08' },
];

// ============================== Email templates ==============================

const EMAIL_TEMPLATES = [
  {
    phase: 'Inquiry (Day 0)',
    title: 'First response to inbound inquiry',
    subject: 'About the [BOAT_NAME] — let\'s talk',
    body: `Hi [BUYER_NAME],

Thanks for reaching out about [BOAT_YEAR_MAKE_MODEL] "[BOAT_NAME]." I'd love to walk you through her and answer any questions you have.

She's a [CONDITION_HIGHLIGHT] ex-[ORIGINATING_FLEET] catamaran currently at [LOCATION]. Our delivered price to your marina, duty-paid and USCG documented, is [DELIVERED_PRICE] — about [SAVINGS] below comparable US-listed inventory.

Quick questions to make sure I'm answering the right ones:
1. What's your timeline — when would you want to be on the boat?
2. Cash or financing?
3. Where would you want her delivered?
4. Any specific concerns from the listing you'd want me to address?

Happy to jump on a call this week. My direct line is [PHONE]. Or reply with a window that works.

Best,
[YOUR_NAME]
Trade Wind & Co.`,
  },
  {
    phase: 'Pre-inspection (Day 7-10)',
    title: 'Inspection packet send',
    subject: '[BOAT_NAME] — inspection coordination',
    body: `[BUYER_NAME],

Glad we connected. Attached is everything you need to evaluate [BOAT_NAME]:

· Boat detail page: [BOAT_URL]
· Sample purchase agreement (we sign this only after your inspection clears)
· Surveyor scope sheet — Sea-Tech Marine, Tortola (they bill you direct, around $1,800)
· Three inspection windows: [DATE_OPTIONS]
· Sample escrow disbursement schedule (Yachtworld Escrow)

Two paths from here:
1. In-person sea trial — fly to Tortola, surveyor meets you at the boat, full sea trial day, written report by next morning. About 2-3 days total. We coordinate hotel + slip access.
2. Remote video walkthrough — surveyor walks the boat live with you over Zoom, 90 minutes, recorded for your records, written report next business day.

Most buyers above $400K choose in-person. Either works.

Which window do you want to lock?

[YOUR_NAME]`,
  },
  {
    phase: 'Post-survey (Day 14-17)',
    title: 'Post-inspection walkthrough call',
    subject: 'Survey report on [BOAT_NAME] — next steps',
    body: `[BUYER_NAME],

Survey report attached. A few highlights worth a 20-minute call to walk through:

· [SURVEYOR_FINDING_1]
· [SURVEYOR_FINDING_2]
· Recommended remediation: [REMEDIATION_OR_NONE]

My read: this is a clean survey for a 6-year-old ex-fleet boat. The minor items are normal-aging stuff, none of it material. We're ready to proceed if you are.

Standard next steps: you sign the purchase agreement (subject to satisfactory inspection — already satisfied), wire full delivered price to Yachtworld Escrow, escrow holds and disburses to vendors at each milestone over 8-12 weeks. We never touch your principal.

Let's get a call on the calendar. When works for you this week?

[YOUR_NAME]`,
  },
  {
    phase: 'Contract signing (Day 17-21)',
    title: 'Purchase agreement + escrow wire instructions',
    subject: '[BOAT_NAME] purchase agreement + wire instructions',
    body: `[BUYER_NAME],

DocuSign link attached for the Trade Wind & Co. purchase agreement on [BOAT_NAME] at the delivered price of [DELIVERED_PRICE].

Once you sign, you'll receive wire instructions for Yachtworld Escrow. The wire amount is [DELIVERED_PRICE], routing to the third-party escrow account (Yachtworld Escrow is a YBAA-affiliated marine escrow agent — Trade Wind does not touch the funds).

From there, escrow holds your money and disburses at each milestone:
· BVI seller on title transfer (~Day 21-28)
· Captain on departure (~Day 32-37)
· CBP duty wire on US arrival (~Day 47-52)
· Customs broker on entry filing
· USCG documentation service
· Final delivery captain leg
· Trade Wind margin releases on your handover acknowledgment (~Day 56-60)

Any questions on the disbursement schedule, call me. Otherwise, sign the agreement and we'll send wire instructions within an hour of receipt.

[YOUR_NAME]`,
  },
  {
    phase: 'Mid-deal update (Day 30 / 45)',
    title: 'Weekly buyer update',
    subject: 'Update on [BOAT_NAME] — [DATE]',
    body: `[BUYER_NAME],

Quick update on [BOAT_NAME]:

· BVI close: [STATUS]
· Export clearance: [STATUS]
· Ocean delivery: Captain [CAPTAIN_NAME] reports [POSITION] as of [TIMESTAMP]. Fair winds, on schedule for [ETA].
· Photos attached from [LOCATION].
· US Customs entry: scheduled at Fort Lauderdale around [DATE]. Our broker has the file queued.
· USCG documentation: application filed [DATE]. Permanent docs expected by [DATE].

Anything you want me to confirm or dig into, just call.

[YOUR_NAME]`,
  },
  {
    phase: 'Final delivery (Day 56-60)',
    title: 'Handover scheduling',
    subject: '[BOAT_NAME] arriving — let\'s schedule your handover',
    body: `[BUYER_NAME],

[BOAT_NAME] is ready. She'll arrive at [BUYER_MARINA] on [DATE] under Captain [CAPTAIN_NAME].

I'll meet you at your slip for the walkthrough. We'll hand over:
· Keys (helm + cabins + engine compartments)
· Surveyor report (printed + digital)
· CBP entry packet — proof of duty paid (you'll need this for state registration)
· Temporary USCG documentation
· Transit insurance certificate (expires today; your permanent insurance kicks in)
· All manuals + equipment inventory
· Captain's notes from the passage

You sign a one-page delivery acknowledgment and you're done. Permanent USCG Certificate of Documentation arrives by mail in 60-90 days.

What time works for you on [DATE]?

[YOUR_NAME]`,
  },
  {
    phase: 'Post-close (Day 60+)',
    title: 'Thank-you + referral ask',
    subject: 'Welcome to [BOAT_NAME] — and a small ask',
    body: `[BUYER_NAME],

Hope the first weekend on [BOAT_NAME] was everything you wanted.

Two things:
1. If anything comes up — first hiccup, first question — call me. My cell is [PHONE]. I'm yours for as long as you own the boat.
2. If you know anyone who's been thinking about buying a Caribbean catamaran but hasn't pulled the trigger because of the import hassle — please send them my way. We close every introduction with a referral fee back to you on close.

Permanent USCG documentation should arrive within 60-90 days. I'll follow up when I see NVDC has issued it.

Welcome to ownership.

[YOUR_NAME]
Trade Wind & Co.`,
  },
];

// ============================== Helpers ==============================

function findBoat(id) {
  return BOATS.find((b) => b.id === id);
}

function statusLabel(s) {
  return {
    'available': 'Available',
    'inquiry': 'Inquiry Live',
    'inspection-scheduled': 'Inspection Scheduled',
    'under-deposit': 'Under Deposit',
    'under-delivery': 'Under Delivery',
    'closed': 'Closed',
  }[s] || s;
}

function fmtUSD(n) {
  if (n === null || n === undefined) return '—';
  return '$' + Math.round(n).toLocaleString('en-US');
}
function fmtUSDShort(n) {
  if (n === null || n === undefined) return '—';
  if (Math.abs(n) >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(n) >= 1_000) return '$' + Math.round(n / 1_000) + 'K';
  return '$' + n;
}
function fmtPct(n, digits = 0) {
  if (n === null || n === undefined) return '—';
  return (n * 100).toFixed(digits) + '%';
}
function fmtNum(n) {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('en-US');
}
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// CommonJS export — only fires under Node (watermark.js, scraper.js).
// Browsers ignore this block because `module` is undefined.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SETTINGS, BOATS, HERO_PHOTO };
}
