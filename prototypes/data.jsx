// Mock data hard-wired to the data shapes from /unmapped/web/src/api/types.ts
// Country list, sectors per country, sample profiles, opportunities, etc.

const COUNTRIES = [
  { code: "GHA", name: "Ghana",        region: "West Africa",      flag: "🇬🇭", lmic: 0.62, hci: 0.45, youthUnemp: 7.9,  informal: 67, internet: 53, automation: 38 },
  { code: "BGD", name: "Bangladesh",   region: "South Asia",       flag: "🇧🇩", lmic: 0.55, hci: 0.46, youthUnemp: 12.1, informal: 89, internet: 41, automation: 51 },
  { code: "NGA", name: "Nigeria",      region: "West Africa",      flag: "🇳🇬", lmic: 0.58, hci: 0.36, youthUnemp: 19.6, informal: 80, internet: 36, automation: 44 },
  { code: "KEN", name: "Kenya",        region: "East Africa",      flag: "🇰🇪", lmic: 0.64, hci: 0.55, youthUnemp: 13.4, informal: 83, internet: 42, automation: 35 },
  { code: "ETH", name: "Ethiopia",     region: "East Africa",      flag: "🇪🇹", lmic: 0.49, hci: 0.38, youthUnemp: 7.0,  informal: 88, internet: 25, automation: 41 },
  { code: "TZA", name: "Tanzania",     region: "East Africa",      flag: "🇹🇿", lmic: 0.56, hci: 0.39, youthUnemp: 4.0,  informal: 82, internet: 32, automation: 36 },
  { code: "IND", name: "India",        region: "South Asia",       flag: "🇮🇳", lmic: 0.66, hci: 0.49, youthUnemp: 23.2, informal: 88, internet: 47, automation: 47 },
  { code: "IDN", name: "Indonesia",    region: "Southeast Asia",   flag: "🇮🇩", lmic: 0.71, hci: 0.54, youthUnemp: 14.9, informal: 60, internet: 66, automation: 53 },
  { code: "PAK", name: "Pakistan",     region: "South Asia",       flag: "🇵🇰", lmic: 0.54, hci: 0.41, youthUnemp: 9.4,  informal: 72, internet: 36, automation: 42 },
  { code: "EGY", name: "Egypt",        region: "North Africa",     flag: "🇪🇬", lmic: 0.69, hci: 0.49, youthUnemp: 17.1, informal: 63, internet: 72, automation: 49 },
  { code: "MAR", name: "Morocco",      region: "North Africa",     flag: "🇲🇦", lmic: 0.74, hci: 0.50, youthUnemp: 21.3, informal: 76, internet: 84, automation: 46 },
  { code: "SEN", name: "Senegal",      region: "West Africa",      flag: "🇸🇳", lmic: 0.60, hci: 0.42, youthUnemp: 4.8,  informal: 78, internet: 58, automation: 34 },
  { code: "VNM", name: "Vietnam",      region: "Southeast Asia",   flag: "🇻🇳", lmic: 0.78, hci: 0.69, youthUnemp: 7.2,  informal: 65, internet: 78, automation: 56 },
  { code: "PHL", name: "Philippines",  region: "Southeast Asia",   flag: "🇵🇭", lmic: 0.72, hci: 0.52, youthUnemp: 6.4,  informal: 47, internet: 58, automation: 51 },
  { code: "UGA", name: "Uganda",       region: "East Africa",      flag: "🇺🇬", lmic: 0.51, hci: 0.38, youthUnemp: 5.0,  informal: 92, internet: 27, automation: 33 },
  { code: "CIV", name: "Côte d'Ivoire",region: "West Africa",      flag: "🇨🇮", lmic: 0.59, hci: 0.38, youthUnemp: 5.5,  informal: 83, internet: 47, automation: 37 },
];

// Country sector wheel — each sector with AI exposure (0..1) and growth signal
const COUNTRY_SECTORS = {
  GHA: [
    { sector: "Agriculture",         risk: 0.18, growth:  3.2, share: 33, durable: ["dexterity", "local knowledge"] },
    { sector: "Renewable energy",    risk: 0.22, growth: 11.4, share:  4, durable: ["installation", "field repair"] },
    { sector: "Trade & retail",      risk: 0.41, growth:  4.1, share: 19, durable: ["customer trust"] },
    { sector: "Manufacturing",       risk: 0.55, growth:  2.0, share:  8, durable: ["machine setup"] },
    { sector: "Digital services",    risk: 0.48, growth:  9.8, share:  3, durable: ["client comms"] },
    { sector: "Health & care",       risk: 0.16, growth:  6.7, share:  6, durable: ["empathy", "physical care"] },
    { sector: "Education",           risk: 0.21, growth:  4.4, share:  5, durable: ["mentoring"] },
    { sector: "Finance & admin",     risk: 0.71, growth:  1.2, share:  4, durable: ["judgment calls"] },
    { sector: "Construction",        risk: 0.27, growth:  5.9, share:  7, durable: ["site coordination"] },
    { sector: "Hospitality",         risk: 0.33, growth:  6.2, share:  5, durable: ["hospitality, taste"] },
  ],
  BGD: [
    { sector: "Garments & textile",  risk: 0.62, growth:  1.4, share: 28, durable: ["finishing detail"] },
    { sector: "Agriculture",         risk: 0.20, growth:  2.7, share: 24, durable: ["seasonal know-how"] },
    { sector: "Construction",        risk: 0.29, growth:  6.1, share: 11, durable: ["coordination"] },
    { sector: "Trade & retail",      risk: 0.43, growth:  3.6, share: 16, durable: ["bargaining"] },
    { sector: "Digital services",    risk: 0.49, growth: 12.2, share:  3, durable: ["client comms"] },
    { sector: "Renewable energy",    risk: 0.24, growth:  9.4, share:  2, durable: ["field repair"] },
    { sector: "Health & care",       risk: 0.17, growth:  7.1, share:  5, durable: ["empathy"] },
    { sector: "Finance & admin",     risk: 0.74, growth:  1.0, share:  4, durable: ["judgment"] },
    { sector: "Education",           risk: 0.22, growth:  4.8, share:  5, durable: ["mentoring"] },
    { sector: "Hospitality",         risk: 0.35, growth:  5.4, share:  3, durable: ["hospitality"] },
  ],
};

// Default for any country not above — slight perturbation
function sectorsFor(code) {
  if (COUNTRY_SECTORS[code]) return COUNTRY_SECTORS[code];
  const base = COUNTRY_SECTORS.GHA;
  // deterministic perturb by char code
  const seed = (code.charCodeAt(0) + code.charCodeAt(1) + code.charCodeAt(2)) / 100;
  return base.map((s, i) => ({
    ...s,
    risk: Math.max(0.08, Math.min(0.92, s.risk + ((seed + i) % 1 - 0.5) * 0.16)),
    growth: Math.max(0.5, s.growth + ((seed * (i + 1)) % 1 - 0.5) * 4),
    share: Math.max(1, Math.round(s.share + ((seed * (i + 2)) % 1 - 0.5) * 6)),
  }));
}

// Sample youth profiles (anonymized)
const TALENT_POOL = [
  { id: "amara",   alias: "Amara K.",      country: "GHA", age: 22, edu: "upper_secondary", availability: "full-time",
    skills: ["mobile electronics repair", "customer service", "Twi", "English", "inventory tracking"],
    durable: ["customer service", "fault diagnosis"], vulnerable: ["data entry"], match: 0.91, sector: "Trade & retail" },
  { id: "ibrahim", alias: "Ibrahim O.",    country: "NGA", age: 24, edu: "post_secondary", availability: "part-time",
    skills: ["solar panel installation", "field maintenance", "Yoruba", "English", "team coordination"],
    durable: ["field repair", "site safety"], vulnerable: [], match: 0.87, sector: "Renewable energy" },
  { id: "rina",    alias: "Rina S.",       country: "BGD", age: 21, edu: "lower_secondary", availability: "full-time",
    skills: ["garment finishing", "quality check", "Bengali", "supervising small teams"],
    durable: ["quality eye", "team lead"], vulnerable: ["pattern cutting"], match: 0.83, sector: "Garments & textile" },
  { id: "aisha",   alias: "Aisha M.",      country: "KEN", age: 23, edu: "tertiary", availability: "full-time",
    skills: ["primary care nursing", "community outreach", "Swahili", "English", "data collection"],
    durable: ["empathy", "physical care", "communication"], vulnerable: ["records data entry"], match: 0.81, sector: "Health & care" },
  { id: "thanh",   alias: "Thanh N.",      country: "VNM", age: 25, edu: "post_secondary", availability: "freelance",
    skills: ["welding", "CNC operation", "shop floor English", "small business basics"],
    durable: ["machine setup", "tactile QC"], vulnerable: ["routine assembly"], match: 0.78, sector: "Manufacturing" },
  { id: "fatou",   alias: "Fatou D.",      country: "SEN", age: 20, edu: "upper_secondary", availability: "part-time",
    skills: ["hospitality service", "French", "Wolof", "social media basics", "cash handling"],
    durable: ["hospitality", "client trust"], vulnerable: ["cash recon"], match: 0.74, sector: "Hospitality" },
];

// Available training programs (real-feeling but mock)
const TRAINING_PROGRAMS = {
  "field repair": [
    { name: "Solar Field Technician — TVET Ghana", duration: "6 months", cost: "Free (NGO-funded)", provider: "GIZ + ENI" },
    { name: "ECOWAS Renewables Apprenticeship",     duration: "9 months", cost: "USD 80",          provider: "ECOWAS Centre" },
  ],
  "customer service": [
    { name: "Digital customer care fundamentals", duration: "8 weeks", cost: "Free", provider: "ALX Africa" },
    { name: "Retail floor leadership",            duration: "4 weeks", cost: "USD 25", provider: "Local Chamber" },
  ],
  "empathy": [
    { name: "Community Health Worker certification", duration: "12 weeks", cost: "USD 40", provider: "Amref" },
  ],
};

// World Bank / ILO source registry — used by the info button
const SOURCES = {
  exposure:   { id: "ILO-WP140", title: "ILO Working Paper 140 (2024)",     blurb: "Global occupational exposure to generative AI, ISCO-08 task-level decomposition." },
  feasibility:{ id: "ILO-WBG-LATAM-2024", title: "ILO–WBG LatAm bottleneck study (2024)", blurb: "Near-term feasibility discount factor based on digital infrastructure & sectoral readiness." },
  wages:      { id: "ILOSTAT-2024", title: "ILOSTAT mean monthly earnings", blurb: "ILO harmonized wage series, ISIC Rev.4. Local currency, latest available year." },
  employment: { id: "WB-WDI-2024",  title: "World Bank WDI sector employment", blurb: "Employment by sector (% of total). World Development Indicators, 2024." },
  hci:        { id: "WB-HCI-2020",  title: "World Bank Human Capital Index",   blurb: "HCI 2020. Productivity of next-generation worker compared to full health & education benchmark." },
  wittg:      { id: "WCDE-2024",    title: "Wittgenstein Centre WCDE 2024",    blurb: "SSP2 medium scenario, projected attainment of upper secondary education by 2035." },
  esco:       { id: "ESCO-v1.1",    title: "ESCO Skills Taxonomy (EU)",        blurb: "European Skills, Competences, Qualifications and Occupations classification." },
  onet:       { id: "ONET-29.0",    title: "O*NET 29.0 (US DOL)",              blurb: "Occupational Information Network. Tasks, abilities, work activities." },
  isco:       { id: "ISCO-08",      title: "ISCO-08",                          blurb: "International Standard Classification of Occupations." },
  digital:    { id: "ITU-2024",     title: "ITU digital connectivity 2024",    blurb: "Internet penetration & broadband access; ITU country indicators." },
  wbl:        { id: "WB-WBL-2024",  title: "World Bank Women, Business & Law 2024", blurb: "Legal barriers index for women's economic participation." },
};

const NOTIFICATIONS = {
  youth: [
    { kind: "match",   icon: "✦", text: "Solar Power Naija matched your skills profile.", time: "2h" },
    { kind: "training",icon: "○", text: "New TVET cohort opens in Accra — March 18.",      time: "1d" },
    { kind: "msg",     icon: "✉", text: "Achieve Solar replied to your application.",     time: "3d" },
  ],
  employer: [
    { kind: "match",   icon: "✦", text: "3 new profiles matched 'Field Solar Tech (Lagos)'.", time: "1h" },
    { kind: "match",   icon: "✦", text: "Amara K. saved a profile for review.",               time: "5h" },
    { kind: "alert",   icon: "!", text: "Your post 'Hospitality lead' expires in 4 days.",    time: "2d" },
  ],
  policy: [
    { kind: "alert",   icon: "!", text: "Ghana youth unemployment indicator updated (ILOSTAT).", time: "6h" },
    { kind: "alert",   icon: "!", text: "Bangladesh: garments sector exposure revised +4 pts.",   time: "1d" },
    { kind: "report",  icon: "▽", text: "Q1 Wittgenstein 2035 projection report ready.",         time: "3d" },
  ],
};

// Approximate world map dot positions (re-used from current code)
const COUNTRY_POSITIONS = {
  GHA: { x: 41.8, y: 51.5 }, BGD: { x: 72.0, y: 46.0 }, NGA: { x: 44.5, y: 51.0 },
  KEN: { x: 52.5, y: 56.0 }, ETH: { x: 52.0, y: 51.0 }, TZA: { x: 52.0, y: 60.0 },
  IND: { x: 69.5, y: 44.5 }, IDN: { x: 78.5, y: 59.5 }, PAK: { x: 66.5, y: 42.0 },
  EGY: { x: 50.5, y: 40.5 }, MAR: { x: 39.5, y: 39.5 }, SEN: { x: 37.5, y: 48.5 },
  VNM: { x: 77.5, y: 47.0 }, PHL: { x: 80.5, y: 49.0 }, UGA: { x: 51.5, y: 55.0 },
  CIV: { x: 40.5, y: 51.5 },
};

window.UM_DATA = {
  COUNTRIES, COUNTRY_SECTORS, sectorsFor, TALENT_POOL, TRAINING_PROGRAMS,
  SOURCES, NOTIFICATIONS, COUNTRY_POSITIONS,
};
