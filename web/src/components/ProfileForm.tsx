import { useState } from "react";
import type { CountryConfigSummary, EducationLevel, SkillsProfile } from "../api/types";
import { countryFlag } from "../utils/countries";

const ISCO_EXAMPLES = [
  { code: "7421", label: "Electronics mechanic / phone repair" },
  { code: "7422", label: "ICT equipment technician" },
  { code: "2512", label: "Software developer" },
  { code: "5211", label: "Market salesperson" },
  { code: "6130", label: "Subsistence / small-scale farmer" },
  { code: "4110", label: "General office clerk" },
  { code: "5321", label: "Health care assistant" },
  { code: "3512", label: "IT support technician" },
];

const EDUCATION_LABELS: Record<EducationLevel, string> = {
  no_formal: "No formal education",
  primary: "Primary school",
  lower_secondary: "Lower secondary (e.g. BECE / JSC)",
  upper_secondary: "Upper secondary (e.g. WASSCE / SSC)",
  post_secondary: "Post-secondary / HND",
  tertiary: "University / tertiary",
};

const SKILL_SUGGESTIONS = [
  "phone_repair", "basic_coding", "multilingual", "customer_service",
  "electronics", "farming", "sewing", "welding", "teaching",
  "bookkeeping", "data_entry", "driving", "management", "social_media",
];

const WORK_HISTORY_EXAMPLES = [
  "Ran a phone-repair stall for 5 years, handled supplier negotiations and repeat customers",
  "Taught myself coding from YouTube videos using a shared mobile connection",
  "Managed household accounts and bookkeeping for a small family business",
];

interface Props {
  countries: CountryConfigSummary[];
  onSubmit: (profile: SkillsProfile) => void;
  loading: boolean;
  onCountryChange?: (code: string) => void;
}

export default function ProfileForm({ countries, onSubmit, loading, onCountryChange }: Props) {
  const [countryCode, setCountryCode] = useState(countries[0]?.country_code ?? "GHA");
  const [isco, setIsco] = useState("7421");
  const [education, setEducation] = useState<EducationLevel>("upper_secondary");
  const [skills, setSkills] = useState<string[]>(["phone_repair", "basic_coding", "multilingual", "customer_service"]);
  const [skillInput, setSkillInput] = useState("");
  const [workHistory, setWorkHistory] = useState<string[]>([
    "Ran a phone-repair stall outside Accra for 5 years, handled supplier negotiations and repeat customers",
    "Taught myself basic coding from YouTube on a shared mobile connection",
  ]);
  const [historyInput, setHistoryInput] = useState("");
  const [languages, setLanguages] = useState("en, tw");
  const [age, setAge] = useState("22");
  const [isUrban, setIsUrban] = useState(true);
  const [access, setAccess] = useState<"none" | "mobile_only" | "broadband">("mobile_only");

  function addSkill(skill: string) {
    const s = skill.trim().toLowerCase().replace(/\s+/g, "_");
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  }

  function addHistory(h: string) {
    if (h.trim() && !workHistory.includes(h.trim())) setWorkHistory([...workHistory, h.trim()]);
    setHistoryInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      country_code: countryCode,
      occupation_isco: isco,
      education_level: education,
      skills,
      work_history: workHistory,
      languages: languages.split(",").map(l => l.trim()).filter(Boolean),
      age: age ? parseInt(age) : undefined,
      is_urban: isUrban,
      digital_access_level: access,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Country */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Country context</label>
        <select
          value={countryCode}
          onChange={e => { setCountryCode(e.target.value); onCountryChange?.(e.target.value); }}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
        >
          {countries.map(c => (
            <option key={c.country_code} value={c.country_code}>
              {countryFlag(c.country_code)} {c.country_name} ({c.region})
            </option>
          ))}
        </select>
      </div>

      {/* Occupation */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Primary occupation (ISCO-08)</label>
        <select value={isco} onChange={e => setIsco(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
          {ISCO_EXAMPLES.map(o => <option key={o.code} value={o.code}>{o.code} — {o.label}</option>)}
        </select>
      </div>

      {/* Education */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Highest education level</label>
        <select value={education} onChange={e => setEducation(e.target.value as EducationLevel)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
          {Object.entries(EDUCATION_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </select>
      </div>

      {/* Work history — provenance engine input */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Work history <span className="text-violet-500 normal-case font-normal">→ provenance cards</span>
        </label>
        <div className="space-y-1.5 mb-2">
          {workHistory.map((h, i) => (
            <div key={i} className="flex items-start gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2">
              <span className="text-violet-500 text-xs mt-0.5 shrink-0">→</span>
              <p className="text-xs text-slate-300 flex-1 leading-relaxed">{h}</p>
              <button type="button" onClick={() => setWorkHistory(workHistory.filter((_, j) => j !== i))}
                className="text-slate-600 hover:text-slate-400 text-xs shrink-0">×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={historyInput} onChange={e => setHistoryInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addHistory(historyInput); }}}
            placeholder="Describe experience in plain language…"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
          <button type="button" onClick={() => addHistory(historyInput)}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">Add</button>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          {WORK_HISTORY_EXAMPLES.filter(e => !workHistory.includes(e)).slice(0, 1).map(ex => (
            <button key={ex} type="button" onClick={() => addHistory(ex)}
              className="text-left text-xs text-slate-600 hover:text-slate-400 border border-slate-700/50 hover:border-slate-600 rounded-lg px-2.5 py-1.5 transition-colors">
              + {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Skills (self-reported)</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {skills.map(s => (
            <span key={s} className="inline-flex items-center gap-1 bg-violet-900/40 text-violet-300 border border-violet-700/50 rounded-full px-2.5 py-0.5 text-xs font-medium">
              {s}<button type="button" onClick={() => setSkills(skills.filter(x => x !== s))} className="hover:text-white ml-0.5">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }}}
            placeholder="Add skill…"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
          <button type="button" onClick={() => addSkill(skillInput)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">Add</button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).map(s => (
            <button key={s} type="button" onClick={() => addSkill(s)}
              className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 rounded-full px-2 py-0.5 transition-colors">
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Languages spoken</label>
        <input value={languages} onChange={e => setLanguages(e.target.value)} placeholder="en, tw, fr"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
      </div>

      {/* Context grid */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Age</label>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} min={14} max={65}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
          <select value={isUrban ? "urban" : "rural"} onChange={e => setIsUrban(e.target.value === "urban")}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
            <option value="urban">Urban</option>
            <option value="rural">Rural</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Internet</label>
          <select value={access} onChange={e => setAccess(e.target.value as typeof access)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
            <option value="none">None</option>
            <option value="mobile_only">Mobile only</option>
            <option value="broadband">Broadband</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={loading || skills.length === 0}
        className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors">
        {loading ? "Analysing…" : "Analyse profile"}
      </button>
    </form>
  );
}
