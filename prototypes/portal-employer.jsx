// Portal 2 — Employer / NGO
// 4 screens: organization profile / post a position (natural language) / talent search / my positions

const EMP_SCREENS = ["org", "post", "search", "positions"];

function PortalEmployer({ onHome }) {
  const [screen, setScreen] = useState("org");
  const [country, setCountry] = useState("GHA");
  const [orgKind, setOrgKind] = useState("employer"); // or "ngo"

  const tabs = [
    { id: "org",       n: "01", l: "Your organization" },
    { id: "post",      n: "02", l: "Post a position" },
    { id: "search",    n: "03", l: "Search talent" },
    { id: "positions", n: "04", l: "My positions" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <TopBar
        portal={orgKind === "ngo" ? "For NGOs" : "For employers"}
        onHome={onHome}
        country={country}
        onCountryChange={setCountry}
        notifications={window.UM_DATA.NOTIFICATIONS.employer}
      />

      <div style={{ background: "var(--paper-2)", borderBottom: "1px solid var(--line-soft)", padding: "14px 28px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tabs.map((t) => {
              const active = screen === t.id;
              return (
                <button key={t.id} onClick={() => setScreen(t.id)} className="tab-btn"
                  style={{
                    background: active ? "var(--ink)" : "transparent",
                    color: active ? "var(--paper)" : "var(--ink-mute)",
                  }}>
                  <span className="mono" style={{ marginRight: 8, opacity: 0.6, fontSize: 11 }}>{t.n}</span>{t.l}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 4, padding: 3, background: "#fff", borderRadius: 999, border: "1px solid var(--line)" }}>
            {[["employer", "Employer"], ["ngo", "NGO"]].map(([k, l]) => (
              <button key={k} onClick={() => setOrgKind(k)} style={{
                padding: "6px 14px", borderRadius: 999, border: "none",
                background: orgKind === k ? "var(--green)" : "transparent",
                color: orgKind === k ? "#fff" : "var(--ink-mute)",
                fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 28px 80px" }} className="fadein" key={screen + orgKind}>
        {screen === "org"       && <EmpOrgProfile orgKind={orgKind} country={country} onNext={() => setScreen("post")} />}
        {screen === "post"      && <EmpPost orgKind={orgKind} country={country} onNext={() => setScreen("search")} />}
        {screen === "search"    && <EmpSearch orgKind={orgKind} country={country} onNext={() => setScreen("positions")} />}
        {screen === "positions" && <EmpPositions orgKind={orgKind} />}
      </div>
    </div>
  );
}

function EmpOrgProfile({ orgKind, country, onNext }) {
  const [name, setName] = useState(orgKind === "ngo" ? "Beacon Africa Foundation" : "Achieve Solar Ghana");
  const [sector, setSector] = useState(orgKind === "ngo" ? "Youth employment" : "Renewable energy");
  const [size, setSize] = useState("11–50");
  const [mission, setMission] = useState(orgKind === "ngo"
    ? "We help young women in West Africa transition from informal trade into renewable-energy livelihoods, through apprenticeships and micro-credit."
    : "We install rooftop solar across Ghana, with a workforce drawn from technical schools and informal repair shops.");

  const inferred = orgKind === "ngo"
    ? ["Youth (18–29)", "Vulnerable women", "Informal sector workers", "Skills: hospitality, garment, repair"]
    : ["Solar installers", "Field technicians", "Customer-facing repair", "Tertiary or TVET grads"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40 }}>
      <div>
        <p className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>step one</p>
        <h1 className="display" style={{ fontSize: 56, marginBottom: 16, fontWeight: 500 }}>
          Tell us about<br /><span className="serif-italic" style={{ color: "var(--green)" }}>your organization.</span>
        </h1>
        <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.55, marginBottom: 30, maxWidth: 540 }}>
          Just enough so we can pre-tune searches for the kind of talent you usually need. You can change this later.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FieldGroup label="Organization name"><input className="field" value={name} onChange={e => setName(e.target.value)} /></FieldGroup>
          <FieldGroup label="Sector"><input className="field" value={sector} onChange={e => setSector(e.target.value)} /></FieldGroup>
          <FieldGroup label="Country">
            <input className="field" value={window.UM_DATA.COUNTRIES.find(c => c.code === country).name} disabled />
          </FieldGroup>
          <FieldGroup label="Size"><select className="field" value={size} onChange={e => setSize(e.target.value)}>
            <option>1–10</option><option>11–50</option><option>51–250</option><option>250+</option>
          </select></FieldGroup>
        </div>
        <FieldGroup label={orgKind === "ngo" ? "Mission" : "What you do, in one paragraph"} style={{ marginTop: 14 }}>
          <textarea className="field" value={mission} onChange={e => setMission(e.target.value)} rows="4" />
        </FieldGroup>

        <div style={{ marginTop: 30, display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={onNext}>Continue →</button>
        </div>
      </div>

      <div className="card" style={{ position: "sticky", top: 90, alignSelf: "start" }}>
        <p className="mono" style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: 1.5, textTransform: "uppercase", margin: 0, marginBottom: 12 }}>What we'll pre-tune</p>
        <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.5, marginBottom: 16 }}>
          Based on your sector and mission, we'll bias talent search toward these profiles. You can override anytime.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {inferred.map((x, i) => (
            <div key={i} style={{ padding: "10px 14px", background: "var(--paper-2)", borderRadius: 10, fontSize: 13, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--green)" }}></span>
              {x}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line-soft)", fontSize: 12, color: "var(--ink-faint)" }}>
          Inference uses <SourceTag sourceId="esco" mini /> + <SourceTag sourceId="onet" mini />
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>{label}</label>
      {children}
    </div>
  );
}

function EmpPost({ orgKind, country, onNext }) {
  const [text, setText] = useState("Necesito a alguien que sepa reparar equipos electrónicos pequeños, que atienda clientes en el mostrador, y que aprenda rápido cuando le enseñemos algo nuevo. Tema o Accra. Salario competitivo.");
  const [confirmed, setConfirmed] = useState(false);

  const mapped = {
    title: "Field Service Technician — Consumer Electronics",
    isco: "7421",
    skills: [
      { l: "Electronics repair (consumer-grade)", code: "ESCO ▸ S6.2.1", required: true },
      { l: "Customer-facing communication",       code: "ESCO ▸ S1.6.1", required: true },
      { l: "Learning agility",                    code: "ESCO ▸ T2.1",  required: false },
      { l: "Spoken English (basic)",              code: "Language",      required: false },
    ],
    locations: ["Tema", "Accra"],
    sector: "Trade & repair (ISIC G47)",
    proximity: "Will reach 28% more candidates if you also accept fully informal repair experience",
  };

  return (
    <div>
      <p className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>step two</p>
      <h1 className="display" style={{ fontSize: 56, marginBottom: 16, fontWeight: 500 }}>
        Just write it like you'd <span className="serif-italic" style={{ color: "var(--green)" }}>tell a colleague.</span>
      </h1>
      <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.55, marginBottom: 30, maxWidth: 700 }}>
        We'll handle ESCO codes, ISCO, ISIC sectors and language metadata for you. You'll review the structured posting before it goes live.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        <div>
          <FieldGroup label="What kind of person do you need?">
            <textarea className="field" value={text} onChange={e => setText(e.target.value)} rows="9" />
          </FieldGroup>
          <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 10 }}>Spanish, English, French, Portuguese — write in any language.</p>
        </div>

        <div className="card" style={{ borderColor: confirmed ? "#c8debc" : "var(--line-soft)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p className="mono" style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Structured posting (auto)</p>
            <span className="pill" style={{ background: confirmed ? "var(--green-pale)" : "var(--paper-2)", color: confirmed ? "var(--green)" : "var(--ink-soft)", borderColor: confirmed ? "#c8debc" : "var(--line)" }}>
              {confirmed ? "✓ confirmed" : "draft"}
            </span>
          </div>

          <h3 style={{ fontSize: 22, fontWeight: 600, margin: 0, marginBottom: 4 }}>{mapped.title}</h3>
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", margin: 0, marginBottom: 14 }}>ISCO-08 ▸ {mapped.isco} · {mapped.sector}</p>

          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 8, letterSpacing: 0.4, textTransform: "uppercase" }}>Required skills</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {mapped.skills.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--paper-2)", borderRadius: 10 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{s.l}</p>
                  <p className="mono" style={{ margin: 0, fontSize: 10, color: "var(--ink-faint)" }}>{s.code}</p>
                </div>
                <span className={"chip " + (s.required ? "green" : "")} style={{ fontSize: 11 }}>
                  {s.required ? "required" : "nice to have"}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {mapped.locations.map(l => <span key={l} className="chip">📍 {l}</span>)}
          </div>

          <div style={{ padding: 12, background: "var(--green-pale)", borderRadius: 12, fontSize: 13, color: "var(--green)", lineHeight: 1.5, marginBottom: 16 }}>
            <strong>Tip:</strong> {mapped.proximity}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-cream" style={{ padding: "10px 16px", fontSize: 13 }}>✎ Edit fields</button>
            {!confirmed
              ? <button className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 13 }} onClick={() => setConfirmed(true)}>Confirm & publish</button>
              : <button className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 13 }} onClick={onNext}>See matches →</button>
            }
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line-soft)", fontSize: 11, color: "var(--ink-faint)", display: "flex", gap: 6, flexWrap: "wrap" }}>
            Mappings: <SourceTag sourceId="esco" mini /> <SourceTag sourceId="onet" mini /> <SourceTag sourceId="isco" mini />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmpSearch({ orgKind, country, onNext }) {
  const [filterEdu, setFilterEdu] = useState("any");
  const [filterAvail, setFilterAvail] = useState("any");
  const [filterCountry, setFilterCountry] = useState(country);
  const [filterVuln, setFilterVuln] = useState(false);
  const [unlocked, setUnlocked] = useState({});
  const TALENT_POOL = window.UM_DATA.TALENT_POOL;
  const COUNTRIES = window.UM_DATA.COUNTRIES;

  const filtered = TALENT_POOL.filter(p => {
    if (filterCountry !== "any" && p.country !== filterCountry) return false;
    if (filterEdu !== "any" && p.edu !== filterEdu) return false;
    if (filterAvail !== "any" && p.availability !== filterAvail) return false;
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>step three</p>
        <h1 className="display" style={{ fontSize: 56, marginBottom: 12, fontWeight: 500 }}>
          {orgKind === "ngo" ? <>Find people who could <span className="serif-italic" style={{ color: "var(--green)" }}>benefit.</span></> : <>Find your <span className="serif-italic" style={{ color: "var(--green)" }}>next hire.</span></>}
        </h1>
        <p style={{ fontSize: 16, color: "var(--ink-soft)", maxWidth: 620 }}>
          {orgKind === "ngo"
            ? "Search by vulnerability, upskilling need, or sector. Profiles are anonymous until you reach out."
            : "Profiles are anonymous until you unlock contact. Skills are verified through evidence in their story, not self-declaration."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>
        {/* Filters */}
        <aside className="card" style={{ position: "sticky", top: 90 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--ink-soft)", margin: 0, marginBottom: 14 }}>Filters</p>
          <FieldGroup label="Country" style={{ marginBottom: 12 }}>
            <select className="field" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
              <option value="any">Any</option>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </select>
          </FieldGroup>
          <FieldGroup label="Education" style={{ marginBottom: 12 }}>
            <select className="field" value={filterEdu} onChange={e => setFilterEdu(e.target.value)}>
              <option value="any">Any</option>
              <option value="lower_secondary">Lower secondary</option>
              <option value="upper_secondary">Upper secondary</option>
              <option value="post_secondary">Post-secondary / TVET</option>
              <option value="tertiary">Tertiary</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Availability" style={{ marginBottom: 12 }}>
            <select className="field" value={filterAvail} onChange={e => setFilterAvail(e.target.value)}>
              <option value="any">Any</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="freelance">Freelance</option>
            </select>
          </FieldGroup>
          {orgKind === "ngo" && (
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: filterVuln ? "var(--green-pale)" : "var(--paper-2)", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "var(--ink-soft)" }}>
              <input type="checkbox" checked={filterVuln} onChange={e => setFilterVuln(e.target.checked)} />
              Needs upskilling priority
            </label>
          )}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line-soft)", fontSize: 12, color: "var(--ink-faint)" }}>
            <p style={{ margin: 0, marginBottom: 4 }}>{filtered.length} profiles match</p>
            <p style={{ margin: 0, color: "var(--ink-faint)" }}>Total in country: {COUNTRIES.find(c=>c.code===filterCountry)?.code === "GHA" ? "1,247" : "varies"}</p>
          </div>
        </aside>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {filtered.map(p => (
            <ProfileCard key={p.id} p={p} unlocked={!!unlocked[p.id]} onUnlock={() => setUnlocked(u => ({ ...u, [p.id]: true }))} orgKind={orgKind} />
          ))}
          {filtered.length === 0 && (
            <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48, color: "var(--ink-mute)" }}>
              No profiles match these filters yet — try widening the criteria.
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 30, display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={onNext}>Go to my positions →</button>
      </div>
    </div>
  );
}

function ProfileCard({ p, unlocked, onUnlock, orgKind }) {
  const COUNTRIES = window.UM_DATA.COUNTRIES;
  const c = COUNTRIES.find(c => c.code === p.country);
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px dashed var(--line)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--green-pale)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
            {p.alias.split(" ").map(s => s[0]).join("")}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{unlocked ? p.alias : "● ● ● ● ●"}</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ink-faint)" }}>{c.flag} {c.name} · age {p.age}</p>
          </div>
        </div>
        <span className="chip green" style={{ fontSize: 11 }}>{Math.round(p.match * 100)}% fit</span>
      </div>

      <div style={{ padding: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 8, letterSpacing: 0.4, textTransform: "uppercase" }}>Verified skills</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {p.skills.slice(0, 4).map((s, i) => (
            <span key={i} className={"chip " + (p.durable.some(d => s.includes(d) || d.includes(s.split(" ")[0])) ? "green" : "")} style={{ fontSize: 11 }}>{s}</span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-mute)", marginBottom: 14 }}>
          <span>Edu: {p.edu.replace("_", " ")}</span>
          <span>{p.availability}</span>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-cream" style={{ padding: "8px 14px", fontSize: 12 }}>Save</button>
          {!unlocked
            ? <button className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 12 }} onClick={onUnlock}>{orgKind === "ngo" ? "Reach out" : "Unlock contact (1 credit)"}</button>
            : <button className="btn btn-coral" style={{ padding: "8px 14px", fontSize: 12 }}>✉ Contacted</button>}
        </div>
      </div>
    </div>
  );
}

function EmpPositions({ orgKind }) {
  const positions = [
    { title: "Field Service Technician — Consumer Electronics", loc: "Tema · Accra", matches: 12, newToday: 3, status: "active", days: 6 },
    { title: "Solar installer apprentice (intake 4)",            loc: "Greater Accra",  matches: 28, newToday: 5, status: "active", days: 11 },
    { title: "Hospitality lead — boutique hotel",                loc: "Cape Coast",     matches:  4, newToday: 0, status: "expiring", days: 4 },
    { title: orgKind === "ngo" ? "Vulnerable youth cohort 2026" : "Customer care evening shift", loc: "Tema", matches: 9, newToday: 1, status: "draft", days: null },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>step four</p>
          <h1 className="display" style={{ fontSize: 56, fontWeight: 500, marginBottom: 8 }}>
            Your <span className="serif-italic" style={{ color: "var(--green)" }}>positions.</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", maxWidth: 540, margin: 0 }}>One row per opening. We tell you when something changes — we don't ask you to refresh.</p>
        </div>
        <button className="btn btn-primary">+ New position</button>
      </div>

      <div style={{ background: "var(--paper-card)", border: "1px solid var(--line-soft)", borderRadius: 22, overflow: "hidden" }}>
        {positions.map((p, i) => (
          <div key={i} style={{
            padding: "20px 22px", display: "grid",
            gridTemplateColumns: "2.4fr 1fr 1fr 1fr auto",
            gap: 18, alignItems: "center",
            borderTop: i === 0 ? "none" : "1px solid var(--line-soft)",
            background: p.status === "expiring" ? "#faf2eb" : "transparent",
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{p.title}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-faint)" }}>📍 {p.loc}</p>
            </div>
            <div>
              <p className="display" style={{ fontSize: 26, margin: 0, color: "var(--green)" }}>{p.matches}</p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--ink-faint)" }}>matches</p>
            </div>
            <div>
              <p className="display" style={{ fontSize: 26, margin: 0, color: p.newToday > 0 ? "var(--coral)" : "var(--ink-faint)" }}>{p.newToday}</p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--ink-faint)" }}>new today</p>
            </div>
            <div>
              <span className={"chip " + (p.status === "active" ? "green" : p.status === "expiring" ? "coral" : "")} style={{ fontSize: 11 }}>
                {p.status} {p.days !== null && `· ${p.days}d`}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-cream" style={{ padding: "8px 14px", fontSize: 12 }}>View →</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <SmallStat label="Profiles in your country" v="1,247" delta="+38 this week" />
        <SmallStat label="Avg time to first match" v="14 hrs" delta="−2h vs last month" />
        <SmallStat label="Median candidate fit" v="0.74" delta="+0.03" />
      </div>
    </div>
  );
}

function SmallStat({ label, v, delta }) {
  return (
    <div className="card">
      <p style={{ margin: 0, fontSize: 11, color: "var(--ink-faint)", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600 }}>{label}</p>
      <p className="display" style={{ fontSize: 36, margin: "8px 0 4px", color: "var(--ink)" }}>{v}</p>
      <p style={{ margin: 0, fontSize: 12, color: "var(--green)" }}>{delta}</p>
    </div>
  );
}

window.PortalEmployer = PortalEmployer;
