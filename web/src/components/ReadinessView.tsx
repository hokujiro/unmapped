import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { ReadinessResult, SkillProvenance } from "../api/types";

const RISK_COLORS = {
  low:       { ring: "#10b981", text: "text-emerald-400", badge: "bg-emerald-900/40 border-emerald-600/50 text-emerald-400" },
  moderate:  { ring: "#f59e0b", text: "text-yellow-400",  badge: "bg-yellow-900/40 border-yellow-600/50 text-yellow-400"  },
  high:      { ring: "#f97316", text: "text-orange-400",  badge: "bg-orange-900/40 border-orange-600/50 text-orange-400"  },
  very_high: { ring: "#ef4444", text: "text-red-400",     badge: "bg-red-900/40 border-red-600/50 text-red-400"           },
};

const GENAI_COLORS = {
  high:         { ring: "#ef4444", text: "text-red-400",    badge: "bg-red-900/30 border-red-700/40 text-red-400"          },
  complemented: { ring: "#10b981", text: "text-emerald-400",badge: "bg-emerald-900/30 border-emerald-700/40 text-emerald-400"},
  moderate:     { ring: "#f59e0b", text: "text-yellow-400", badge: "bg-yellow-900/30 border-yellow-700/40 text-yellow-400" },
  low:          { ring: "#6366f1", text: "text-indigo-400", badge: "bg-indigo-900/30 border-indigo-700/40 text-indigo-400" },
};

const HORIZON_LABELS: Record<string, string> = {
  immediate: "Immediate risk", "5_years": "Within 5 years",
  "10_years": "Within 10 years", long_term: "Long-term horizon",
};

const CONFIDENCE_STYLE = {
  high:   "border-violet-600/60 bg-violet-900/20",
  medium: "border-slate-600 bg-slate-800/40",
  low:    "border-slate-700/50 bg-slate-800/20",
};
const SOURCE_ICONS = {
  work_history:        "📋",
  self_reported:       "✋",
  occupation_inference:"🔍",
};

function ScoreGauge({ score, color, label, size = "md" }: { score: number; color: string; label: string; size?: "sm" | "md" }) {
  const pct = Math.round(score * 100);
  const r = size === "sm" ? 28 : 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const dim = size === "sm" ? "w-20 h-20" : "w-28 h-28";
  const textSize = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`relative ${dim}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color}
            strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${textSize} font-bold`} style={{ color }}>{pct}%</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 text-center leading-tight">{label}</span>
    </div>
  );
}

function ProvenanceCard({ p }: { p: SkillProvenance }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${CONFIDENCE_STYLE[p.confidence]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs">{SOURCE_ICONS[p.source]}</span>
        <span className="text-xs font-semibold text-violet-300">{p.skill}</span>
        <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full border ${
          p.confidence === "high" ? "border-violet-600/40 text-violet-400 bg-violet-900/20" :
          p.confidence === "medium" ? "border-slate-600 text-slate-400" : "border-slate-700 text-slate-600"
        }`}>{p.confidence}</span>
      </div>
      <p className="text-xs text-slate-400 italic leading-relaxed">{p.evidence}</p>
    </div>
  );
}

function TaskBreakdownChart({ tasks }: { tasks: ReadinessResult["task_breakdown"] }) {
  const data = tasks.map(t => ({
    name: t.label.replace("Non-routine ", "").replace(" tasks", ""),
    score: Math.round(t.score * 100),
    fill: t.task_type.includes("routine") && !t.task_type.includes("non_") ? "#f97316" : "#818cf8",
  }));
  return (
    <ResponsiveContainer width="100%" height={175}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#1e293b" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={v => `${v}%`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={130} />
        <Tooltip formatter={v => [`${v}%`, "Exposure"]}
          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {data.map((e, i) => <Cell key={i} fill={e.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EducationChart({ projection }: { projection: ReadinessResult["education_projection"] }) {
  if (!projection.available) return <p className="text-sm text-slate-500 italic">Data unavailable.</p>;
  const data = Object.entries(projection.upper_secondary_plus_pct)
    .sort(([a], [b]) => +a - +b)
    .map(([year, pct]) => ({ year, pct: Math.round(pct * 10) / 10 }));
  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="eduGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e293b" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={v => `${v}%`} />
          <Tooltip formatter={v => [`${v}%`, "Upper secondary+ completion"]}
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey="pct" stroke="#818cf8" fill="url(#eduGrad)"
            strokeWidth={2} dot={{ r: 4, fill: "#818cf8" }} />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 italic">{projection.interpretation}</p>
    </div>
  );
}

export default function ReadinessView({ result }: { result: ReadinessResult }) {
  const genai = GENAI_COLORS[result.genai_category] ?? GENAI_COLORS.moderate;
  const feas = RISK_COLORS[result.feasibility_category] ?? RISK_COLORS.moderate;

  return (
    <div className="space-y-5">

      {/* ── Dual-score header ── */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex items-start gap-2 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-0.5">Occupation</p>
            <h2 className="text-base font-semibold text-white leading-tight">{result.occupation_label}</h2>
            <p className="text-xs text-slate-500 mt-0.5">ISCO {result.occupation_isco}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          {/* ILO GenAI primary */}
          <div className="flex flex-col items-center">
            <ScoreGauge score={result.structural_exposure} color={genai.ring} label="Structural exposure" />
            <span className={`mt-1 text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${genai.badge}`}>
              {result.genai_category.replace("_", " ")}
            </span>
            <span className="text-xs text-slate-600 mt-1">ILO WP140 · 2024</span>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-slate-600 text-2xl">→</div>
            <p className="text-xs text-slate-500 text-center leading-tight">LMIC<br/>calibration</p>
            <div className="text-xs text-slate-600 mt-1 text-center space-y-0.5">
              <div>×{result.calibration_breakdown.lmic_discount_factor as number}</div>
              <div>×{result.digital_access.ilo_latam_bottleneck_factor}</div>
            </div>
          </div>

          {/* Near-term feasibility */}
          <div className="flex flex-col items-center">
            <ScoreGauge score={result.near_term_feasibility} color={feas.ring} label="Near-term feasibility" />
            <span className={`mt-1 text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${feas.badge}`}>
              {result.feasibility_category.replace("_", " ")}
            </span>
            <span className="text-xs text-slate-600 mt-1">{HORIZON_LABELS[result.feasibility_horizon]}</span>
          </div>
        </div>

        {/* Complementarity bar */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">GenAI complementarity (worker amplification)</span>
            <span className="text-xs font-semibold text-emerald-400">{Math.round(result.genai_complementarity * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${Math.round(result.genai_complementarity * 100)}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-1 italic">{result.genai_category_description}</p>
        </div>

        {/* Legacy F-O comparator */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-600">
            Legacy Frey-Osborne (2013): <span className="text-slate-400 font-mono">{Math.round(result.legacy_fo_score * 100)}%</span>
            <span className="text-slate-700 ml-1">— secondary comparator, US task composition</span>
          </span>
        </div>
      </div>

      {/* ── Digital access calibration ── */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Digital access calibration</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <p className="text-xs text-slate-500">Internet users</p>
            <p className="text-base font-bold text-white">{result.digital_access.internet_pct != null ? `${result.digital_access.internet_pct}%` : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Digital composite</p>
            <p className="text-base font-bold text-white">{result.digital_access.composite_score.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">ILO LatAm factor</p>
            <p className="text-base font-bold text-white">×{result.digital_access.ilo_latam_bottleneck_factor}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 italic">
          ILO-WBG LatAm (2024): up to 50% of exposed jobs bottlenecked by connectivity gaps.
          Formula: 0.5 + 0.5 × digital_composite = {result.digital_access.ilo_latam_bottleneck_factor}
        </p>
        <p className="text-xs text-slate-700 mt-1">Source: {result.digital_access.source}</p>
      </div>

      {/* ── Provenance cards ── */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Skills passport — evidence provenance
        </p>
        <p className="text-xs text-slate-600 mb-3">Each skill backed by evidence. This is what Amara can own and share.</p>
        <div className="space-y-2">
          {result.skills_with_provenance.map(p => <ProvenanceCard key={p.skill} p={p} />)}
        </div>
      </div>

      {/* ── Durable / Vulnerable ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-red-800/40 bg-red-900/10 p-3">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Vulnerable</p>
          <ul className="space-y-1">
            {result.vulnerable_skills.map(s => (
              <li key={s} className="text-xs text-slate-400 flex items-start gap-1.5">
                <span className="text-red-500 mt-0.5">↓</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-900/10 p-3">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Durable</p>
          <ul className="space-y-1">
            {result.durable_skills.map(s => (
              <li key={s} className="text-xs text-slate-400 flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Task breakdown ── */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Task composition (Frey-Osborne enrichment)</p>
        <div className="flex gap-3 text-xs mb-2">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" /> Routine</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block" /> Non-routine</span>
        </div>
        <TaskBreakdownChart tasks={result.task_breakdown} />
      </div>

      {/* ── Adjacent skills ── */}
      {result.adjacent_skills.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommended upskilling paths</p>
          <div className="space-y-2">
            {result.adjacent_skills.map(adj => (
              <div key={adj.skill} className="rounded-xl border border-violet-700/30 bg-violet-900/10 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-violet-300">{adj.skill}</p>
                  {adj.estimated_wage_premium_pct && (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-900/30 border border-emerald-700/30 rounded-full px-2 py-0.5 shrink-0">
                      +{adj.estimated_wage_premium_pct}% wage
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{adj.rationale}</p>
                {adj.training_pathway && (
                  <p className="text-xs text-slate-500 mt-1">→ {adj.training_pathway}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Education projection ── */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Education landscape 2020–2035</p>
          <span className="text-xs text-slate-600">Wittgenstein Centre · {result.education_projection.scenario}</span>
        </div>
        <EducationChart projection={result.education_projection} />
      </div>

      {/* Sources */}
      <div className="flex flex-wrap gap-1.5">
        {result.data_sources.map(s => (
          <span key={s} className="text-xs text-slate-600 bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5">{s}</span>
        ))}
        {result.fallback_used && (
          <span className="text-xs text-yellow-600 bg-yellow-900/20 border border-yellow-700/30 rounded-full px-2 py-0.5">⚠ Some data from embedded fallback</span>
        )}
      </div>
    </div>
  );
}
