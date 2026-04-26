// ISO 3166-1 alpha-3 → alpha-2
const ALPHA3_TO_ALPHA2: Record<string, string> = {
  AFG: "AF", AGO: "AO", ALB: "AL", ARE: "AE", ARG: "AR", AUS: "AU",
  AZE: "AZ", BDI: "BI", BEN: "BJ", BGD: "BD", BFA: "BF", BOL: "BO",
  BRA: "BR", BTN: "BT", BWA: "BW", CAF: "CF", CIV: "CI", CMR: "CM",
  COD: "CD", COG: "CG", COL: "CO", CPV: "CV", DJI: "DJ", DOM: "DO",
  DZA: "DZ", ECU: "EC", EGY: "EG", ERI: "ER", ETH: "ET", GAB: "GA",
  GHA: "GH", GIN: "GN", GMB: "GM", GNB: "GW", GTM: "GT", GUY: "GY",
  HND: "HN", HTI: "HT", IDN: "ID", IND: "IN", IRN: "IR", IRQ: "IQ",
  JAM: "JM", JOR: "JO", KEN: "KE", KGZ: "KG", KHM: "KH", LAO: "LA",
  LBR: "LR", LBY: "LY", LKA: "LK", LSO: "LS", MAR: "MA", MDA: "MD",
  MDG: "MG", MEX: "MX", MLI: "ML", MMR: "MM", MOZ: "MZ", MRT: "MR",
  MWI: "MW", MYS: "MY", NAM: "NA", NER: "NE", NGA: "NG", NIC: "NI",
  NPL: "NP", PAK: "PK", PER: "PE", PHL: "PH", PNG: "PG", PRK: "KP",
  PRY: "PY", RWA: "RW", SDN: "SD", SEN: "SN", SLE: "SL", SLV: "SV",
  SOM: "SO", SSD: "SS", STP: "ST", SUR: "SR", SWZ: "SZ", SYR: "SY",
  TCD: "TD", TGO: "TG", THA: "TH", TJK: "TJ", TKM: "TM", TLS: "TL",
  TON: "TO", TUN: "TN", TZA: "TZ", UGA: "UG", UKR: "UA", UZB: "UZ",
  VEN: "VE", VNM: "VN", YEM: "YE", ZAF: "ZA", ZMB: "ZM", ZWE: "ZW",
  // numeric ISO used by TopoJSON world-atlas
  GBR: "GB", USA: "US", CHN: "CN", RUS: "RU",
};

export function alpha3ToAlpha2(code: string): string {
  return ALPHA3_TO_ALPHA2[code.toUpperCase()] ?? "";
}

export function countryFlag(alpha3: string): string {
  const a2 = alpha3ToAlpha2(alpha3);
  if (!a2) return "🌍";
  return a2
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

// Numeric ISO 3166-1 (used by world-atlas TopoJSON) → alpha-3
export const NUMERIC_TO_ALPHA3: Record<string, string> = {
  "004": "AFG", "024": "AGO", "050": "BGD", "076": "BRA", "116": "KHM",
  "120": "CMR", "140": "CAF", "144": "LKA", "170": "COL", "180": "COD",
  "204": "BEN", "214": "DOM", "218": "ECU", "231": "ETH", "288": "GHA",
  "320": "GTM", "324": "GIN", "332": "HTI", "340": "HND", "356": "IND",
  "360": "IDN", "364": "IRN", "368": "IRQ", "384": "CIV", "400": "JOR",
  "404": "KEN", "418": "LAO", "422": "LBN", "430": "LBR", "450": "MDG",
  "454": "MWI", "466": "MLI", "484": "MEX", "504": "MAR", "508": "MOZ",
  "516": "NAM", "524": "NPL", "562": "NER", "566": "NGA", "586": "PAK",
  "604": "PER", "608": "PHL", "626": "TLS", "638": "REU", "646": "RWA",
  "686": "SEN", "694": "SLE", "706": "SOM", "710": "ZAF", "716": "ZWE",
  "724": "ESP", "728": "SSD", "729": "SDN", "736": "SDN", "740": "SUR",
  "752": "SWE", "756": "CHE", "760": "SYR", "762": "TJK", "764": "THA",
  "768": "TGO", "788": "TUN", "792": "TUR", "800": "UGA", "818": "EGY",
  "834": "TZA", "854": "BFA", "858": "URY", "860": "UZB", "862": "VEN",
  "882": "WSM", "887": "YEM", "894": "ZMB",
};
