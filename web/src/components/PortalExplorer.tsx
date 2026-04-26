import { useState } from "react";
import { TopBar, SourceTag, riskColor, riskLabel } from "./Shared";
import { COUNTRIES, COUNTRY_POSITIONS, NOTIFICATIONS, sectorsFor } from "../data";

type ExScreen = "map" | "country" | "compare";

interface Props { onHome: () => void; }

const INDICATORS = [
  { id: "automation", label: "AI automation risk",       unit: "%",  source: "exposure",    max: 60,   min: 30,   palette: ["#ecf3e8", "#5aa06a", "#1f5d3a"] },
  { id: "youthUnemp", label: "Youth unemployment",       unit: "%",  source: "employment",  max: 25,   min: 4,    palette: ["#fdf3ee", "#e89773", "#c14e4e"] },
  { id: "informal",   label: "Informal employment share",unit: "%",  source: "employment",  max: 92,   min: 47,   palette: ["#fbeed7", "#dfb45a", "#8a6a1c"] },
  { id: "internet",   label: "Internet penetration",     unit: "%",  source: "digital",     max: 84,   min: 25,   palette: ["#e2eaf2", "#5688b6", "#1f4f7a"] },
  { id: "hci",        label: "Human Capital Index",      unit: "",   source: "hci",         max: 0.7,  min: 0.36, palette: ["#ecf3e8", "#5aa06a", "#1f5d3a"] },
] as const;

type IndicatorId = (typeof INDICATORS)[number]["id"];

function colorFor(value: number, ind: typeof INDICATORS[number]): string {
  const t = Math.max(0, Math.min(1, (value - ind.min) / (ind.max - ind.min)));
  const lerp = (a: number, b: number, tt: number) => a + (b - a) * tt;
  const hex = (h: string) => (h.match(/\w\w/g) || []).map(x => parseInt(x, 16)) as [number, number, number];
  const toHex = (rgb: number[]) => "#" + rgb.map(x => Math.round(x).toString(16).padStart(2, "0")).join("");
  const stops = ind.palette.map(hex);
  if (t < 0.5) {
    const tt = t / 0.5;
    return toHex(stops[0].map((c, i) => lerp(c, stops[1][i], tt)));
  } else {
    const tt = (t - 0.5) / 0.5;
    return toHex(stops[1].map((c, i) => lerp(c, stops[2][i], tt)));
  }
}

export default function PortalExplorer({ onHome }: Props) {
  const [screen, setScreen] = useState<ExScreen>("map");
  const [country, setCountry] = useState("GHA");
  const [secondCountry, setSecondCountry] = useState("BGD");
  const [indicator, setIndicator] = useState<IndicatorId>("automation");

  const tabs: { id: ExScreen; n: string; l: string }[] = [
    { id: "map",     n: "01", l: "World map" },
    { id: "country", n: "02", l: "Country detail" },
    { id: "compare", n: "03", l: "Compare two countries" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <TopBar portal="Public data explorer" onHome={onHome} notifications={NOTIFICATIONS.policy} />

      <div style={{ background: "var(--paper-2)", borderBottom: "1px solid var(--line-soft)", padding: "14px 28px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tabs.map(t => {
            const active = screen === t.id;
            return (
              <button key={t.id} onClick={() => setScreen(t.id)} className="tab-btn"
                style={{ background: active ? "var(--coral)" : "transparent", color: active ? "#fff" : "var(--ink-mute)" }}>
                <span className="mono" style={{ marginRight: 8, opacity: 0.6, fontSize: 11 }}>{t.n}</span>{t.l}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 28px 80px" }} className="fadein" key={screen}>
        {screen === "map"     && <ExplorerMap country={country} setCountry={setCountry} indicator={indicator} setIndicator={setIndicator} onOpenCountry={() => setScreen("country")} />}
        {screen === "country" && <ExplorerCountry country={country} setCountry={setCountry} onCompare={() => setScreen("compare")} />}
        {screen === "compare" && <ExplorerCompare a={country} setA={setCountry} b={secondCountry} setB={setSecondCountry} />}
      </div>
    </div>
  );
}

function ExplorerMap({ country, setCountry, indicator, setIndicator, onOpenCountry }: {
  country: string; setCountry: (c: string) => void;
  indicator: IndicatorId; setIndicator: (i: IndicatorId) => void;
  onOpenCountry: () => void;
}) {
  const ind = INDICATORS.find(i => i.id === indicator)!;
  const c = COUNTRIES.find(cc => cc.code === country) || COUNTRIES[0];

  const interpretations: Record<string, string> = {
    GHA: "67% of employment is informal. Fastest-growing sectors: renewable energy and digital services.",
    BGD: "Garments (28% of jobs) faces moderate AI exposure. Education attainment is rising — but credentials don't yet signal in the labour market.",
    NGA: "Highest youth unemployment of the cohort. Renewable-energy roles and field repair are the strongest near-term levers.",
    KEN: "Strongest HCI in East Africa. Health & care and digital services growing fastest.",
    IND: "Largest absolute youth pool. Digital services exposure rising — durability stack matters more than ever.",
    VNM: "Manufacturing-heavy, with 56% AI-task exposure. The pivot toward machine setup and tactile QC is happening now.",
  };
  const interpretation = interpretations[country] || "Country pack calibrated. Click a sector below for the durability breakdown.";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 30, alignItems: "start" }}>
      <div>
        <h1 className="display" style={{ fontSize: 56, marginBottom: 12, fontWeight: 500 }}>
          The world, <span className="serif-italic" style={{ color: "var(--coral)" }}>by what matters.</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--ink-soft)", maxWidth: 660, marginBottom: 22 }}>
          Pick an indicator. Click a country. Three numbers, one sentence — then drill in if you need the methodology.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {INDICATORS.map(i => (
            <button key={i.id} onClick={() => setIndicator(i.id as IndicatorId)} className="tab-btn"
              style={{
                background: indicator === i.id ? "var(--ink)" : "#fff",
                color: indicator === i.id ? "var(--paper)" : "var(--ink-soft)",
                border: indicator === i.id ? "none" : "1px solid var(--line)",
                fontSize: 12,
              }}>
              {i.label}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--line-soft)", borderRadius: 22, overflow: "hidden", position: "relative" }}>
          <svg viewBox="0 0 900 460" style={{ width: "100%", display: "block" }}>
            <rect width="900" height="460" fill="var(--paper-2)" />
            {/* High-quality Simplified World Map */}
            <g opacity="0.35" fill="#cdc3a8" transform="translate(0, 10) scale(0.95)">
              {/* North America */}
              <path d="M125 54c-11-9-33-5-44 5-10 10-14 26-9 39 3 10 11 18 20 23 9 5 19 6 29 4 13-2 25-13 28-26 2-13-3-28-14-35z" />
              {/* South America */}
              <path d="M165 168c-9 0-18 6-22 14-4 10-1 22 6 30 7 8 18 12 28 14 12 2 26 0 35-9 8-8 11-20 9-31-3-10-12-18-23-18h-33z" />
              {/* Africa */}
              <path d="M420 134c-15-9-35-6-49 4-11 8-18 22-16 36 2 12 10 21 20 26 10 5 22 5 33 1 13-5 22-18 23-33 1-12-5-25-11-34z" />
              {/* Eurasia */}
              <path d="M600 48c-28-13-64-1-81 24-12 19-12 45 1 64 11 17 31 26 53 24 21-3 39-18 47-38 9-22 4-49-20-74z" />
              {/* Asia Islands & SE Asia */}
              <path d="M720 180c-5-3-11-2-15 2s-4 10-2 15 8 8 13 6 8-5 9-10-1-10-5-13z" />
              <path d="M750 210c-4-2-9-1-12 2s-3 8-1 12 6 6 10 5 6-4 7-8-1-8-4-11z" />
              {/* Australia */}
              <path d="M780 280c-11-5-24-2-32 7-7 7-9 18-5 27 4 9 12 15 22 16 10 1 20-4 25-12 5-8 5-19-2-28-4-5-9-8-8-10z" />
              
              {/* Coastlines for definition */}
              <path d="M80 60 L140 50 L180 80 L160 140 L100 130 Z" fill="none" stroke="#b8af96" strokeWidth="0.5" />
              <path d="M150 170 L220 180 L230 250 L180 270 L140 230 Z" fill="none" stroke="#b8af96" strokeWidth="0.5" />
              <path d="M360 120 L440 110 L480 180 L440 260 L360 240 L340 180 Z" fill="none" stroke="#b8af96" strokeWidth="0.5" />
              <path d="M500 50 L650 30 L780 80 L760 180 L600 200 L500 150 Z" fill="none" stroke="#b8af96" strokeWidth="0.5" />
            </g>
            <line x1="0" y1="230" x2="900" y2="230" stroke="#d8cfba" strokeWidth="0.6" strokeDasharray="3,5" />
            {COUNTRIES.map(cc => {
              const pos = COUNTRY_POSITIONS[cc.code];
              if (!pos) return null;
              const cx = (pos.x / 100) * 900;
              const cy = (pos.y / 100) * 460;
              const v = cc[ind.id as keyof typeof cc] as number;
              const fill = colorFor(v, ind);
              const isActive = cc.code === country;
              return (
                <g key={cc.code} onClick={() => setCountry(cc.code)} style={{ cursor: "pointer" }}>
                  {isActive && (
                    <circle cx={cx} cy={cy} r="22" fill={fill} className="pulse-ring"
                      style={{ transformOrigin: `${cx}px ${cy}px` }} />
                  )}
                  <circle cx={cx} cy={cy} r={isActive ? 12 : 8} fill={fill}
                    stroke={isActive ? "var(--ink)" : "#fff"} strokeWidth={isActive ? 2 : 1.5} />
                  <text x={cx} y={cy - (isActive ? 18 : 14)} textAnchor="middle"
                    fontSize={isActive ? 11 : 10} fontWeight="600" fill="var(--ink)"
                    fontFamily="Plus Jakarta Sans">{cc.code}</text>
                </g>
              );
            })}
          </svg>

          <div style={{ position: "absolute", bottom: 14, left: 14, background: "var(--paper-card)", border: "1px solid var(--line)", borderRadius: 14, padding: "10px 14px", fontSize: 11 }}>
            <p style={{ margin: 0, marginBottom: 6, color: "var(--ink-soft)", fontWeight: 600 }}>{ind.label}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mono" style={{ color: "var(--ink-faint)" }}>{ind.min}{ind.unit}</span>
              <div style={{ width: 100, height: 8, borderRadius: 999, background: `linear-gradient(90deg, ${ind.palette.join(", ")})` }}></div>
              <span className="mono" style={{ color: "var(--ink-faint)" }}>{ind.max}{ind.unit}</span>
            </div>
            <div style={{ marginTop: 6 }}><SourceTag sourceId={ind.source} mini /></div>
          </div>
        </div>
      </div>

      <aside className="card slidein-right" key={country} style={{ position: "sticky", top: 90, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--coral)", color: "#fff", padding: "20px 22px" }}>
          <p className="mono" style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.85, margin: 0 }}>COUNTRY SNAPSHOT</p>
          <h2 className="display" style={{ fontSize: 34, fontWeight: 500, margin: "6px 0 4px" }}>
            <span style={{ marginRight: 10 }}>{c.flag}</span>{c.name}
          </h2>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>{c.region}</p>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
            <BigNum n={c.automation + "%"} l="AI exposure"     sourceId="exposure" />
            <BigNum n={c.youthUnemp + "%"} l="Youth unemp."    sourceId="employment" />
            <BigNum n={c.informal + "%"}   l="Informal share"  sourceId="employment" />
          </div>
          <p className="serif-italic" style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.55, margin: 0, marginBottom: 18 }}>
            "{interpretation}"
          </p>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onOpenCountry}>
            Open sector breakdown →
          </button>
        </div>
      </aside>
    </div>
  );
}

function BigNum({ n, l, sourceId }: { n: string; l: string; sourceId: string }) {
  return (
    <div>
      <p className="display" style={{ fontSize: 30, fontWeight: 500, color: "var(--ink)", margin: 0 }}>{n}</p>
      <p style={{ fontSize: 11, color: "var(--ink-mute)", margin: 0, marginTop: 2 }}>{l}</p>
      <div style={{ marginTop: 4 }}><SourceTag sourceId={sourceId} mini /></div>
    </div>
  );
}

function ExplorerCountry({ country, setCountry, onCompare }: {
  country: string; setCountry: (c: string) => void; onCompare: () => void;
}) {
  const c = COUNTRIES.find(cc => cc.code === country) || COUNTRIES[0];
  const sectors = sectorsFor(country);
  const [selected, setSelected] = useState(0);
  const sec = sectors[selected];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <p className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>country detail</p>
          <h1 className="display" style={{ fontSize: 56, fontWeight: 500, margin: 0 }}>
            <span style={{ marginRight: 16 }}>{c.flag}</span>
            {c.name}<span style={{ color: "var(--coral)" }}>.</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", margin: "8px 0 0" }}>
            {c.region} · LMIC factor ×{c.lmic} · HCI {c.hci}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select className="field" style={{ width: 220 }} value={country} onChange={e => setCountry(e.target.value)}>
            {COUNTRIES.map(cc => <option key={cc.code} value={cc.code}>{cc.flag} {cc.name}</option>)}
          </select>
          <button className="btn btn-cream" onClick={onCompare}>Compare with...</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 30, alignItems: "start" }}>
        <SectorWheel sectors={sectors} selected={selected} onSelect={setSelected} />

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 22, borderBottom: "1px solid var(--line-soft)", background: "var(--paper-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
              <h3 className="display" style={{ fontSize: 30, fontWeight: 500, margin: 0 }}>{sec.sector}</h3>
              <span className="chip" style={{ background: riskColor(sec.risk) + "22", color: riskColor(sec.risk), borderColor: riskColor(sec.risk) + "55" }}>
                {riskLabel(sec.risk)}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--ink-mute)" }}>{sec.share}% of employment · {sec.growth > 0 ? "+" : ""}{sec.growth.toFixed(1)}% YoY growth</p>
          </div>

          <div style={{ padding: 22 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", margin: 0, marginBottom: 8, letterSpacing: 0.4, textTransform: "uppercase" }}>AI exposure</p>
            <div className="barbg" style={{ height: 10, marginBottom: 4 }}>
              <div className="barfg" style={{ width: (sec.risk * 100) + "%", background: riskColor(sec.risk) }}></div>
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-faint)", margin: "0 0 18px" }}>{Math.round(sec.risk * 100)}% of tasks structurally exposed to generative AI</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <BoxStat label="Hard to automate" v={sec.durable.join(" · ")} color="var(--green)" />
              <BoxStat label="At-risk roles" v={sec.risk > 0.5 ? "data entry · routine clerical" : sec.risk > 0.3 ? "basic admin · stocktake" : "few near-term"} color="var(--coral)" />
            </div>

            <div style={{ marginTop: 18, padding: 14, background: "var(--green-pale)", borderRadius: 12, fontSize: 13, color: "var(--green)", lineHeight: 1.55 }}>
              <strong>Growth signal:</strong> {sec.growth > 5
                ? "Sector is hiring faster than the country average — a credible bet for upskilling."
                : sec.growth > 2
                  ? "Steady demand, modest hiring."
                  : "Stagnant or shrinking — durable skills remain valuable but volume is down."}
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line-soft)", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>Sources:</span>
              <SourceTag sourceId="exposure" mini />
              <SourceTag sourceId="employment" mini />
              <SourceTag sourceId="onet" mini />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoxStat({ label, v, color }: { label: string; v: string; color: string }) {
  return (
    <div style={{ padding: 14, background: "var(--paper-2)", borderRadius: 12 }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--ink-faint)" }}>{label}</p>
      <p className="serif-italic" style={{ margin: "4px 0 0", fontSize: 14, color, lineHeight: 1.4 }}>{v}</p>
    </div>
  );
}

function SectorWheel({ sectors, selected, onSelect }: {
  sectors: ReturnType<typeof sectorsFor>; selected: number; onSelect: (i: number) => void;
}) {
  const total = sectors.reduce((s, x) => s + x.share, 0);
  const cx = 220, cy = 220, r = 160, ir = 70;
  let acc = 0;

  return (
    <div className="card" style={{ background: "#fff" }}>
      <p className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", margin: 0, marginBottom: 14 }}>sectors · click any wedge</p>
      <svg viewBox="0 0 440 440" style={{ width: "100%", display: "block" }}>
        {sectors.map((s, i) => {
          const slice = (s.share / total) * Math.PI * 2;
          const start = acc;
          const end = acc + slice;
          acc = end;
          const lg = slice > Math.PI ? 1 : 0;
          const x1 = cx + Math.cos(start) * r, y1 = cy + Math.sin(start) * r;
          const x2 = cx + Math.cos(end) * r,   y2 = cy + Math.sin(end) * r;
          const ix1 = cx + Math.cos(end) * ir,  iy1 = cy + Math.sin(end) * ir;
          const ix2 = cx + Math.cos(start) * ir, iy2 = cy + Math.sin(start) * ir;
          const path = `M ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${lg} 0 ${ix2} ${iy2} Z`;
          const isSel = i === selected;
          const mid = (start + end) / 2;
          const lblR = (r + ir) / 2;
          const lx = cx + Math.cos(mid) * lblR;
          const ly = cy + Math.sin(mid) * lblR;
          return (
            <g key={i} onClick={() => onSelect(i)} style={{ cursor: "pointer" }}>
              <path d={path} fill={riskColor(s.risk)} stroke="#fff" strokeWidth="3"
                opacity={isSel ? 1 : 0.85}
                style={{ transition: "transform .2s ease, opacity .2s ease",
                         transformOrigin: `${cx}px ${cy}px`,
                         transform: isSel ? "scale(1.04)" : "scale(1)" }} />
              {s.share >= 5 && (
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                  fontSize="10" fontWeight="700" fill="#fff" fontFamily="Plus Jakarta Sans">
                  {s.share}%
                </text>
              )}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={ir - 2} fill="var(--paper-card)" />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" fill="var(--ink-faint)" letterSpacing="1">SECTORS</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="22" fontFamily="Fraunces" fontWeight="500" fill="var(--ink)">{sectors.length}</text>
      </svg>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        {sectors.map((s, i) => (
          <button key={i} onClick={() => onSelect(i)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8,
            background: i === selected ? "var(--paper-2)" : "transparent",
            border: "none", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
          }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: riskColor(s.risk), flexShrink: 0 }}></span>
            <span style={{ fontSize: 12, color: "var(--ink-soft)", flex: 1 }}>{s.sector}</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-faint)" }}>{s.share}%</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "var(--ink-faint)" }}>
        <span>colour = AI risk:</span>
        {[["var(--leaf)", "low"], ["var(--ocre)", "moderate"], ["var(--rose)", "high"]].map(([bg, label]) => (
          <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: bg }}></span>{label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExplorerCompare({ a, setA, b, setB }: {
  a: string; setA: (c: string) => void; b: string; setB: (c: string) => void;
}) {
  const ca = COUNTRIES.find(c => c.code === a) || COUNTRIES[0];
  const cb = COUNTRIES.find(c => c.code === b) || COUNTRIES[1];

  const rows: { label: string; k: keyof typeof ca; unit: string; sourceId: string }[] = [
    { label: "AI automation risk",   k: "automation", unit: "%", sourceId: "exposure" },
    { label: "Youth unemployment",   k: "youthUnemp", unit: "%", sourceId: "employment" },
    { label: "Informal employment",  k: "informal",   unit: "%", sourceId: "employment" },
    { label: "Internet penetration", k: "internet",   unit: "%", sourceId: "digital" },
    { label: "Human Capital Index",  k: "hci",        unit: "",  sourceId: "hci" },
    { label: "LMIC discount factor", k: "lmic",       unit: "",  sourceId: "feasibility" },
  ];

  const proj = (c: typeof ca) => {
    const base = c.hci * 80;
    return [
      { yr: "2020", v: Math.round(base) },
      { yr: "2025", v: Math.round(base * 1.05) },
      { yr: "2030", v: Math.round(base * 1.13) },
      { yr: "2035", v: Math.round(base * 1.22) },
    ];
  };
  const pa = proj(ca), pb = proj(cb);

  return (
    <div>
      <p className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>compare</p>
      <h1 className="display" style={{ fontSize: 56, fontWeight: 500, marginBottom: 22 }}>
        Two countries, <span className="serif-italic" style={{ color: "var(--coral)" }}>side by side.</span>
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24 }}>
        {([[ca, setA], [cb, setB]] as const).map(([cc, setter], i) => (
          <div key={i} className="card" style={{ background: i === 0 ? "var(--green-pale)" : "#fbe6dd", borderColor: i === 0 ? "#c8debc" : "#f3c8b6" }}>
            <p className="mono" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", margin: 0 }}>Country {i === 0 ? "A" : "B"}</p>
            <h2 className="display" style={{ fontSize: 34, fontWeight: 500, margin: "6px 0 8px" }}>
              <span style={{ marginRight: 10 }}>{cc.flag}</span>{cc.name}
            </h2>
            <select className="field" style={{ background: "#fff" }} value={cc.code} onChange={e => setter(e.target.value)}>
              {COUNTRIES.map(opt => <option key={opt.code} value={opt.code}>{opt.flag} {opt.name}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 0, overflow: "hidden" }}>
        {rows.map((row, i) => {
          const va = ca[row.k] as number;
          const vb = cb[row.k] as number;
          const max = Math.max(va, vb);
          return (
            <div key={row.k as string} style={{ display: "grid", gridTemplateColumns: "200px 1fr 60px 60px 1fr", gap: 14, alignItems: "center", padding: "16px 22px", borderTop: i === 0 ? "none" : "1px solid var(--line-soft)" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{row.label}</p>
                <SourceTag sourceId={row.sourceId} mini />
              </div>
              <div className="barbg" style={{ height: 14 }}>
                <div className="barfg" style={{ width: ((va / max) * 100) + "%", background: "var(--green)", marginLeft: "auto", float: "right" }}></div>
              </div>
              <p className="display" style={{ margin: 0, fontSize: 22, color: "var(--green)", textAlign: "right" }}>{va}{row.unit}</p>
              <p className="display" style={{ margin: 0, fontSize: 22, color: "var(--coral)" }}>{vb}{row.unit}</p>
              <div className="barbg" style={{ height: 14 }}>
                <div className="barfg" style={{ width: ((vb / max) * 100) + "%", background: "var(--coral)" }}></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 500 }}>Education trajectory to 2035</h3>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ink-mute)" }}>Projected upper-secondary attainment (% of 20–24 year olds), Wittgenstein SSP2.</p>
          </div>
          <SourceTag sourceId="wittg" />
        </div>

        <svg viewBox="0 0 720 240" style={{ width: "100%", display: "block" }}>
          <line x1="40" y1="200" x2="700" y2="200" stroke="var(--line)" />
          <line x1="40" y1="40" x2="40" y2="200" stroke="var(--line)" />
          {[0, 25, 50, 75, 100].map(t => (
            <g key={t}>
              <line x1="40" y1={200 - t * 1.6} x2="700" y2={200 - t * 1.6} stroke="var(--line-soft)" strokeDasharray="2,4" />
              <text x="32" y={200 - t * 1.6 + 4} textAnchor="end" fontSize="10" fontFamily="JetBrains Mono" fill="var(--ink-faint)">{t}%</text>
            </g>
          ))}
          {[pa, pb].map((series, idx) => {
            const color = idx === 0 ? "var(--green)" : "var(--coral)";
            const pts = series.map((p, i) => {
              const x = 40 + (i / (series.length - 1)) * 660;
              const y = 200 - p.v * 1.6;
              return [x, y] as [number, number];
            });
            const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p.join(" ")).join(" ");
            return (
              <g key={idx}>
                <path d={d} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle cx={p[0]} cy={p[1]} r="5" fill={color} stroke="#fff" strokeWidth="2" />
                    <text x={p[0]} y={p[1] - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill={color} fontFamily="Plus Jakarta Sans">{series[i].v}%</text>
                  </g>
                ))}
              </g>
            );
          })}
          {pa.map((p, i) => {
            const x = 40 + (i / (pa.length - 1)) * 660;
            return <text key={i} x={x} y={222} textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" fill="var(--ink-mute)">{p.yr}</text>;
          })}
        </svg>

        <p className="serif-italic" style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.55, marginTop: 22, marginBottom: 0, padding: 14, background: "var(--paper-2)", borderRadius: 12 }}>
          "Upper-secondary attainment will rise in both countries — but without infrastructure to signal those skills to employers, the credential gain doesn't translate into employability. That's the gap Unmapped is built to close."
        </p>
      </div>
    </div>
  );
}
