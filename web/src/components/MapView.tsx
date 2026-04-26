import type { CountryConfigSummary, ReadinessResult } from "../api/types";
import { countryFlag } from "../utils/countries";

// Approximate SVG positions for each country (x%, y%) on a Mercator-like world map 900×460
const COUNTRY_POSITIONS: Record<string, { x: number; y: number }> = {
  GHA: { x: 41.8, y: 51.5 },
  BGD: { x: 72.0, y: 46.0 },
  NGA: { x: 44.5, y: 51.0 },
  KEN: { x: 52.5, y: 56.0 },
  ETH: { x: 52.0, y: 51.0 },
  TZA: { x: 52.0, y: 60.0 },
  IND: { x: 69.5, y: 44.5 },
  IDN: { x: 78.5, y: 59.5 },
  PAK: { x: 66.5, y: 42.0 },
  EGY: { x: 50.5, y: 40.5 },
  MAR: { x: 39.5, y: 39.5 },
  SEN: { x: 37.5, y: 48.5 },
  CMR: { x: 45.5, y: 53.5 },
  ZMB: { x: 50.5, y: 63.0 },
  ZWE: { x: 51.5, y: 65.5 },
  MOZ: { x: 52.5, y: 66.0 },
  VNM: { x: 77.5, y: 47.0 },
  PHL: { x: 80.5, y: 49.0 },
  UGA: { x: 51.5, y: 55.0 },
  CIV: { x: 40.5, y: 51.5 },
};

const FEASIBILITY_COLORS = [
  { threshold: 0.6, color: "#10b981", label: "≥ 60%  — Very high" },
  { threshold: 0.4, color: "#f59e0b", label: "40–60% — Moderate" },
  { threshold: 0.2, color: "#f97316", label: "20–40% — Low" },
  { threshold: 0,   color: "#ef4444", label: "< 20%  — Very low" },
];

function feasibilityColor(score: number | null): string {
  if (score === null) return "#6366f1";
  for (const { threshold, color } of FEASIBILITY_COLORS) {
    if (score >= threshold) return color;
  }
  return "#ef4444";
}

function feasibilityLabel(score: number | null): string {
  if (score === null) return "Configured — not yet analysed";
  if (score >= 0.6) return "Very high near-term feasibility";
  if (score >= 0.4) return "Moderate feasibility";
  if (score >= 0.2) return "Low feasibility";
  return "Very low feasibility";
}

interface Props {
  countries: CountryConfigSummary[];
  activeCountryCode?: string;
  readinessResult?: ReadinessResult | null;
}

export default function MapView({ countries, activeCountryCode, readinessResult }: Props) {
  const scoreMap: Record<string, number | null> = {};
  for (const c of countries) scoreMap[c.country_code] = null;
  if (readinessResult && activeCountryCode) {
    scoreMap[activeCountryCode] = readinessResult.near_term_feasibility;
  }

  const activeCountry = countries.find((c) => c.country_code === activeCountryCode);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-semibold text-sm">Labour mobility map</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Near-term AI feasibility by country context — LMIC-calibrated
        </p>
      </div>

      {/* SVG world dot-map */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden relative">
        <svg viewBox="0 0 900 460" className="w-full" style={{ display: "block" }}>
          {/* Background */}
          <rect width="900" height="460" fill="#0f172a" />

          {/* Simple latitude/longitude grid */}
          {[20, 40, 60, 80].map((y) => (
            <line key={y} x1="0" y1={y * 4.6} x2="900" y2={y * 4.6}
              stroke="#1e293b" strokeWidth="0.5" />
          ))}
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
            <line key={x} x1={x * 10} y1="0" x2={x * 10} y2="460"
              stroke="#1e293b" strokeWidth="0.5" />
          ))}

          {/* Continent outlines as simplified blobs */}
          {/* Africa */}
          <ellipse cx="460" cy="260" rx="85" ry="110" fill="#1e293b" opacity="0.6" />
          {/* Asia */}
          <ellipse cx="680" cy="210" rx="160" ry="90" fill="#1e293b" opacity="0.6" />
          {/* South Asia bump */}
          <ellipse cx="670" cy="270" rx="60" ry="50" fill="#1e293b" opacity="0.5" />
          {/* SE Asia */}
          <ellipse cx="760" cy="290" rx="55" ry="40" fill="#1e293b" opacity="0.5" />
          {/* Europe */}
          <ellipse cx="450" cy="155" rx="70" ry="45" fill="#1e293b" opacity="0.5" />
          {/* Americas */}
          <ellipse cx="185" cy="230" rx="90" ry="130" fill="#1e293b" opacity="0.5" />
          {/* Oceania */}
          <ellipse cx="810" cy="360" rx="60" ry="35" fill="#1e293b" opacity="0.5" />

          {/* Country dots */}
          {countries.map((c) => {
            const pos = COUNTRY_POSITIONS[c.country_code];
            if (!pos) return null;
            const cx = (pos.x / 100) * 900;
            const cy = (pos.y / 100) * 460;
            const isActive = c.country_code === activeCountryCode;
            const score = scoreMap[c.country_code];
            const color = feasibilityColor(score);

            return (
              <g key={c.country_code}>
                {isActive && (
                  <circle cx={cx} cy={cy} r="18" fill={color} opacity="0.15" />
                )}
                <circle
                  cx={cx} cy={cy}
                  r={isActive ? 9 : 6}
                  fill={color}
                  stroke={isActive ? "#fff" : "#0f172a"}
                  strokeWidth={isActive ? 2 : 1}
                  opacity="0.95"
                />
                <text
                  x={cx}
                  y={cy - (isActive ? 15 : 11)}
                  textAnchor="middle"
                  fontSize={isActive ? 11 : 9}
                  fontWeight={isActive ? "700" : "500"}
                  fill={isActive ? "#fff" : "#94a3b8"}
                  fontFamily="system-ui, sans-serif"
                >
                  {c.country_code}
                </text>
                {isActive && score !== null && (
                  <text
                    x={cx}
                    y={cy + 22}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={color}
                    fontFamily="system-ui, sans-serif"
                  >
                    {(score * 100).toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}

          {/* Equator label */}
          <text x="8" y="232" fontSize="8" fill="#334155" fontFamily="system-ui">equator</text>
          <line x1="0" y1="230" x2="900" y2="230" stroke="#334155" strokeWidth="0.8" strokeDasharray="4,4" />
        </svg>

        {/* Active country overlay */}
        {activeCountry && (
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl px-3 py-2.5 text-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{countryFlag(activeCountry.country_code)}</span>
              <div>
                <p className="text-white font-semibold leading-tight">{activeCountry.country_name}</p>
                <p className="text-slate-500">{activeCountry.region}</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs">
              <div>
                <p className="text-slate-500">LMIC factor</p>
                <p className="text-white font-mono">×{activeCountry.lmic_discount_factor.toFixed(2)}</p>
              </div>
              {readinessResult && (
                <div>
                  <p className="text-slate-500">Feasibility</p>
                  <p className="font-bold" style={{ color: feasibilityColor(readinessResult.near_term_feasibility) }}>
                    {(readinessResult.near_term_feasibility * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {FEASIBILITY_COLORS.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="w-3 h-3 rounded-full bg-[#6366f1] inline-block" />
          Configured — not yet analysed
        </div>
      </div>

      {/* Country cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {countries.map((c) => {
          const score = scoreMap[c.country_code];
          const isActive = c.country_code === activeCountryCode;
          const color = feasibilityColor(score);
          return (
            <div
              key={c.country_code}
              className={`rounded-xl border p-4 transition-all ${
                isActive
                  ? "border-violet-500/60 bg-violet-900/10"
                  : "border-slate-700 bg-slate-800/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{countryFlag(c.country_code)}</span>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{c.country_name}</p>
                    <p className="text-slate-500 text-xs">{c.region}</p>
                  </div>
                </div>
                {isActive && (
                  <span className="text-xs bg-violet-600/30 text-violet-300 border border-violet-600/40 rounded-full px-2 py-0.5">
                    active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800 rounded-lg p-2">
                  <p className="text-slate-500 mb-0.5">LMIC discount</p>
                  <p className="text-white font-semibold font-mono">{(c.lmic_discount_factor * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-2">
                  <p className="text-slate-500 mb-0.5">Near-term feasibility</p>
                  {score !== null ? (
                    <p className="font-semibold font-mono" style={{ color }}>{(score * 100).toFixed(0)}%</p>
                  ) : (
                    <p className="text-slate-600">—</p>
                  )}
                </div>
              </div>

              {score !== null && (
                <div className="mt-2.5">
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(score * 100).toFixed(0)}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color }}>{feasibilityLabel(score)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calibration breakdown when analysed */}
      {activeCountry && readinessResult && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {countryFlag(activeCountry.country_code)} {activeCountry.country_name} — calibration chain
          </p>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="bg-slate-800 rounded-lg px-3 py-2 text-center">
              <p className="text-slate-500 mb-0.5">Structural exposure</p>
              <p className="text-white font-bold text-base">{(readinessResult.structural_exposure * 100).toFixed(0)}%</p>
              <p className="text-slate-600 text-[10px]">ILO WP140</p>
            </div>
            <span className="text-slate-600 text-lg">×</span>
            <div className="bg-slate-800 rounded-lg px-3 py-2 text-center">
              <p className="text-slate-500 mb-0.5">LMIC discount</p>
              <p className="text-white font-bold text-base">{activeCountry.lmic_discount_factor.toFixed(2)}</p>
              <p className="text-slate-600 text-[10px]">country pack</p>
            </div>
            <span className="text-slate-600 text-lg">×</span>
            <div className="bg-slate-800 rounded-lg px-3 py-2 text-center">
              <p className="text-slate-500 mb-0.5">Digital bottleneck</p>
              <p className="text-white font-bold text-base">{readinessResult.digital_access.ilo_latam_bottleneck_factor.toFixed(2)}</p>
              <p className="text-slate-600 text-[10px]">ILO-WBG LatAm</p>
            </div>
            <span className="text-slate-600 text-lg">=</span>
            <div className="rounded-lg px-3 py-2 text-center border"
              style={{ borderColor: feasibilityColor(readinessResult.near_term_feasibility) + "60",
                       backgroundColor: feasibilityColor(readinessResult.near_term_feasibility) + "15" }}>
              <p className="text-slate-400 mb-0.5">Near-term feasibility</p>
              <p className="font-bold text-xl" style={{ color: feasibilityColor(readinessResult.near_term_feasibility) }}>
                {(readinessResult.near_term_feasibility * 100).toFixed(0)}%
              </p>
              <p className="text-slate-500 text-[10px]">{feasibilityLabel(readinessResult.near_term_feasibility)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
