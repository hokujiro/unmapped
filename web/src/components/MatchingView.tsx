import { useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { Divergence2035View, EconometricSignals, MatchingResult, Opportunity } from "../api/types";

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  formal_employment: { bg: "bg-blue-900/30",   text: "text-blue-400",   border: "border-blue-700/40"   },
  self_employment:   { bg: "bg-emerald-900/30", text: "text-emerald-400",border: "border-emerald-700/40"},
  gig:               { bg: "bg-yellow-900/30",  text: "text-yellow-400", border: "border-yellow-700/40" },
  training_pathway:  { bg: "bg-violet-900/30",  text: "text-violet-400", border: "border-violet-700/40" },
  tavily_discovery:  { bg: "bg-cyan-900/30",    text: "text-cyan-400",   border: "border-cyan-700/40"   },
};
const TYPE_LABELS: Record<string, string> = {
  formal_employment: "Formal employment", self_employment: "Self-employment",
  gig: "Gig / freelance", training_pathway: "Training pathway", tavily_discovery: "Discovered programme",
};

const SCORE_LABELS: Record<string, string> = {
  skill_fit: "Skill fit", reachability: "Reachability",
  income_signal: "Income signal", sector_signal: "Sector signal",
  resilience_uplift: "Resilience uplift",
};
const SCORE_COLORS: Record<string, string> = {
  skill_fit: "#818cf8", reachability: "#10b981",
  income_signal: "#f59e0b", sector_signal: "#06b6d4",
  resilience_uplift: "#a78bfa",
};

function ScoreBar({ label, value, color, weight }: { label: string; value: number; color: string; weight: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs text-slate-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">{Math.round(weight * 100)}%w</span>
          <span className="text-xs font-semibold font-mono" style={{ color }}>{Math.round(value * 100)}%</span>
        </div>
      </div>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round(value * 100)}%`, background: color }} />
      </div>
    </div>
  );
}

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const [open, setOpen] = useState(false);
  const colors = TYPE_COLORS[opp.source_type === "tavily_discovery" ? "tavily_discovery" : opp.opportunity_type]
    ?? TYPE_COLORS.formal_employment;

  return (
    <div className={`rounded-xl border p-4 cursor-pointer ${colors.bg} ${colors.border}`} onClick={() => setOpen(!open)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
              {TYPE_LABELS[opp.source_type === "tavily_discovery" ? "tavily_discovery" : opp.opportunity_type]}
            </span>
            <span className="text-xs text-slate-600">· {opp.sector_label}</span>
            {opp.source_type === "tavily_discovery" && (
              <span className="text-xs bg-cyan-900/30 border border-cyan-700/30 text-cyan-500 rounded-full px-1.5 py-0.5">Tavily</span>
            )}
          </div>
          <p className="text-sm font-semibold text-white mt-1 leading-tight">{opp.title}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-bold text-white">{Math.round(opp.score_breakdown.composite * 100)}</span>
          <span className="text-xs text-slate-500">/100</span>
          <span className="text-slate-600">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Composite bar */}
      <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500 bg-white/20"
          style={{ width: `${Math.round(opp.score_breakdown.composite * 100)}%` }} />
      </div>

      {open && (
        <div className="mt-4 pt-3 border-t border-slate-700/40 space-y-4">
          {/* 5-component scores */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score breakdown</p>
            {Object.entries(SCORE_LABELS).map(([key, label]) => (
              <ScoreBar key={key} label={label}
                value={(opp.score_breakdown as unknown as Record<string, number>)[key]}
                color={SCORE_COLORS[key]}
                weight={opp.score_breakdown.weights[key]} />
            ))}
          </div>

          {/* Signals */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-slate-500">Wage floor / month</p>
              <p className="text-sm font-semibold text-white">{opp.wage_floor_usd ? `~$${opp.wage_floor_usd} USD` : "No data"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Sector growth</p>
              <p className="text-sm font-semibold text-white">
                {opp.sector_employment_growth_pct != null ? `${opp.sector_employment_growth_pct}% / yr` : "No data"}
              </p>
            </div>
          </div>

          {opp.skill_gap.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Skill gaps to close</p>
              <div className="flex flex-wrap gap-1">
                {opp.skill_gap.map(g => (
                  <span key={g} className="text-xs bg-slate-700/50 text-slate-400 border border-slate-600/50 rounded-full px-2 py-0.5">{g}</span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 italic">{opp.realism_note}</p>

          {opp.wbl_note && (
            <p className="text-xs text-yellow-500 bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-3 py-2">⚠ {opp.wbl_note}</p>
          )}

          {opp.source_url && (
            <a href={opp.source_url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline block">
              View source →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function EconPanel({ signals }: { signals: EconometricSignals }) {
  const sectorData = signals.sector_employment_growth
    ? Object.entries(signals.sector_employment_growth).map(([k, v]) => ({
        name: k.charAt(0).toUpperCase() + k.slice(1), value: Math.round(v * 10) / 10,
      }))
    : [];

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Econometric signals · <span className="normal-case font-normal text-slate-600">{signals.data_year ?? "latest available"}</span>
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Human Capital Index", value: signals.human_capital_index?.toFixed(2) ?? "—", sub: "0–1 scale (WB HCI)" },
          { label: "Youth unemployment", value: signals.youth_unemployment_rate != null ? `${signals.youth_unemployment_rate.toFixed(1)}%` : "—", sub: "15–24 age group" },
          { label: "Self-employed share", value: signals.self_employed_share != null ? `${signals.self_employed_share.toFixed(1)}%` : "—", sub: "% of total employment" },
          { label: "Digital access", value: signals.digital_access_composite != null ? signals.digital_access_composite.toFixed(2) : "—", sub: "ITU composite 0–1" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
            <p className="text-xs text-slate-500 leading-tight">{kpi.label}</p>
            <p className="text-xl font-bold text-white mt-1">{kpi.value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>
      {signals.wbl_score != null && (
        <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/10 px-3 py-2 flex items-center gap-3">
          <span className="text-xs text-slate-400">Women, Business & Law score:</span>
          <span className="text-sm font-bold text-yellow-400">{signals.wbl_score}/100</span>
          <span className="text-xs text-slate-500">{signals.wbl_score < 65 ? "Legal constraints may affect women's opportunities" : "Relatively open legal environment"}</span>
        </div>
      )}
      {sectorData.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
          <p className="text-xs text-slate-400 mb-3">Employment share by broad sector (%)</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={sectorData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={v => `${v}%`} domain={[0, 80]} />
              <Tooltip formatter={v => [`${v}%`, "Employment share"]}
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {sectorData.map((_, i) => <Cell key={i} fill={["#10b981", "#f59e0b", "#818cf8"][i % 3]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {signals.sources.map(s => <span key={s} className="text-xs text-slate-600 bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5">{s}</span>)}
      </div>
    </div>
  );
}

function Divergence2035Panel({ div }: { div: Divergence2035View }) {
  const gapColor = div.divergence_gap === "widening" ? "text-red-400 bg-red-900/20 border-red-700/40"
    : div.divergence_gap === "stable" ? "text-yellow-400 bg-yellow-900/20 border-yellow-700/40"
    : "text-emerald-400 bg-emerald-900/20 border-emerald-700/40";

  const eduData = Object.entries(div.education_trajectory)
    .sort(([a], [b]) => +a - +b)
    .map(([year, pct]) => ({ year, pct }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${gapColor}`}>
          {div.divergence_gap} gap
        </span>
        <span className="text-xs text-slate-500">{div.wcde_scenario} scenario</span>
      </div>

      {eduData.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Credential supply trajectory (upper secondary+ completion)</p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={eduData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="divGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="pct" stroke="#818cf8" fill="url(#divGrad)"
                strokeWidth={2} dot={{ r: 3, fill: "#818cf8" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-slate-500 mb-1">Labour demand trajectory</p>
        {Object.entries(div.labour_demand_trajectory).map(([year, desc]) => (
          <div key={year} className="flex items-start gap-2.5">
            <span className="text-xs font-mono text-slate-500 w-8 shrink-0 mt-0.5">{year}</span>
            <span className="text-xs text-slate-300">{desc}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
        <p className="text-xs font-semibold text-slate-400 mb-1">Policy implication</p>
        <p className="text-xs text-slate-300 leading-relaxed">{div.interpretation}</p>
      </div>

      <p className="text-xs text-slate-500 italic">{div.projected_credential_surplus}</p>
    </div>
  );
}

function PolicymakerPanel({ policy }: { policy: NonNullable<MatchingResult["policymaker_view"]> }) {
  const [activeView, setActiveView] = useState<"supply" | "demand" | "divergence">("divergence");
  const views = [
    { key: "supply" as const, label: "Skills supply" },
    { key: "demand" as const, label: "Opportunity demand" },
    { key: "divergence" as const, label: "2035 divergence" },
  ];

  return (
    <div className="rounded-xl border border-slate-600 bg-slate-800/60 p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Policymaker dashboard</p>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5">
          {views.map(v => (
            <button key={v.key} onClick={() => setActiveView(v.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeView === v.key ? "bg-slate-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {activeView === "supply" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Occupation cluster</p>
              <p className="text-sm font-semibold text-white">{policy.skills_supply.dominant_isco_cluster}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Languages</p>
              <p className="text-sm text-white">{policy.skills_supply.languages.join(", ")}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Top skills in cohort</p>
            <div className="flex flex-wrap gap-1.5">
              {policy.skills_supply.top_skills.map(s => (
                <span key={s} className="text-xs bg-slate-700 border border-slate-600 text-slate-300 rounded-full px-2.5 py-0.5">{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === "demand" && (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-2">Highest growth sectors</p>
            {policy.opportunity_demand.highest_growth_sectors.map(s => (
              <div key={s.sector} className="flex items-center justify-between py-1 border-b border-slate-700/50 last:border-0">
                <span className="text-xs text-slate-300 capitalize">{s.sector}</span>
                <span className="text-xs font-semibold text-white">{s.employment_share_pct}% employment</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Critical skill gaps across cohort</p>
            <div className="flex flex-wrap gap-1">
              {policy.opportunity_demand.critical_skill_gaps.length > 0
                ? policy.opportunity_demand.critical_skill_gaps.map(g => (
                    <span key={g} className="text-xs bg-red-900/20 border border-red-700/30 text-red-400 rounded-full px-2 py-0.5">{g}</span>
                  ))
                : <span className="text-xs text-slate-600">No critical gaps identified</span>}
            </div>
          </div>
          {policy.opportunity_demand.formality_share != null && (
            <div>
              <p className="text-xs text-slate-500">Formal employment share (proxy)</p>
              <p className="text-sm font-bold text-white">{policy.opportunity_demand.formality_share.toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}

      {activeView === "divergence" && <Divergence2035Panel div={policy.divergence_2035} />}

      {/* Interventions */}
      <div className="pt-3 border-t border-slate-700">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommended interventions</p>
        <ul className="space-y-1">
          {policy.recommended_interventions.map(i => (
            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
              <span className="text-violet-500 shrink-0 mt-0.5">→</span> {i}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function MatchingView({ result }: { result: MatchingResult }) {
  const [showPolicy, setShowPolicy] = useState(false);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <EconPanel signals={result.econometric_signals} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Matched opportunities ({result.opportunities.length})
          </p>
          {result.tavily_enabled && (
            <span className="text-xs text-cyan-500 bg-cyan-900/20 border border-cyan-700/30 rounded-full px-2 py-0.5">Tavily discovery active</span>
          )}
        </div>
        <p className="text-xs text-slate-600 mb-3">
          Ranked by composite score: skill fit (30%) + reachability (20%) + income signal (20%) + sector signal (20%) + resilience uplift (10%). Click to expand.
        </p>
        <div className="space-y-2">
          {result.opportunities.map(opp => <OpportunityCard key={opp.title} opp={opp} />)}
        </div>
      </div>

      {result.policymaker_view && (
        <div>
          <button onClick={() => setShowPolicy(!showPolicy)}
            className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-1.5 transition-colors mb-3">
            {showPolicy ? "▲ Hide" : "▼ Show"} policymaker dashboard (3-view)
          </button>
          {showPolicy && <PolicymakerPanel policy={result.policymaker_view} />}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {result.data_sources.map(s => <span key={s} className="text-xs text-slate-600 bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5">{s}</span>)}
        {result.fallback_used && <span className="text-xs text-yellow-600 bg-yellow-900/20 border border-yellow-700/30 rounded-full px-2 py-0.5">⚠ Some data from fallback</span>}
      </div>
    </div>
  );
}
