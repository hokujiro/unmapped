// Portal 1 — The young person (Amara)
// 4 screens: profile / passport / opportunities / training

const YOUTH_SCREENS = ["profile", "passport", "opportunities", "training"];

function PortalYouth({ onHome }) {
  const [screen, setScreen] = useState("profile");
  const [country, setCountry] = useState("GHA");
  const [story, setStory] = useState("I help my uncle at his electronics stall. I fix mobile phones — screens, batteries, sometimes the small board work. I deal with customers when they come in angry, calm them down, explain what's broken. I keep a notebook of which parts we have. Sometimes I post our shop on WhatsApp.");
  const [name, setName] = useState("Amara K.");
  const [age, setAge] = useState(22);
  const [edu, setEdu] = useState("upper_secondary");

  const tabs = [
    { id: "profile",       n: "01", l: "Tell us about you" },
    { id: "passport",      n: "02", l: "Your skills passport" },
    { id: "opportunities", n: "03", l: "Your opportunities" },
    { id: "training",      n: "04", l: "Your training paths" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <TopBar
        portal="For young people"
        onHome={onHome}
        country={country}
        onCountryChange={setCountry}
        notifications={window.UM_DATA.NOTIFICATIONS.youth}
      />

      {/* Stepper */}
      <div style={{ background: "var(--paper-2)", borderBottom: "1px solid var(--line-soft)", padding: "14px 28px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tabs.map((t, i) => {
            const active = screen === t.id;
            const passed = YOUTH_SCREENS.indexOf(t.id) < YOUTH_SCREENS.indexOf(screen);
            return (
              <button key={t.id} onClick={() => setScreen(t.id)} className="tab-btn"
                style={{
                  background: active ? "var(--green)" : passed ? "#fff" : "transparent",
                  color: active ? "#fff" : passed ? "var(--ink)" : "var(--ink-mute)",
                  border: passed && !active ? "1px solid var(--line)" : "none",
                }}>
                <span className="mono" style={{ marginRight: 8, opacity: 0.6, fontSize: 11 }}>{t.n}</span>{t.l}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 28px 80px" }} className="fadein" key={screen}>
        {screen === "profile"       && <YouthProfile story={story} setStory={setStory} name={name} setName={setName} age={age} setAge={setAge} edu={edu} setEdu={setEdu} country={country} onNext={() => setScreen("passport")} />}
        {screen === "passport"      && <YouthPassport name={name} story={story} country={country} onNext={() => setScreen("opportunities")} />}
        {screen === "opportunities" && <YouthOpportunities country={country} onNext={() => setScreen("training")} />}
        {screen === "training"      && <YouthTraining country={country} onHome={onHome} />}
      </div>
    </div>
  );
}

function YouthProfile({ story, setStory, name, setName, age, setAge, edu, setEdu, country, onNext }) {
  const COUNTRIES = window.UM_DATA.COUNTRIES;
  const c = COUNTRIES.find(c => c.code === country);
  // Detect skills inline as user types
  const detected = inferSkills(story);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "start" }}>
      <div>
        <p className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>step one</p>
        <h1 className="display" style={{ fontSize: 56, marginBottom: 16, fontWeight: 500 }}>
          Tell us who you are.<br />
          <span className="serif-italic" style={{ color: "var(--green)" }}>In your own words.</span>
        </h1>
        <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.55, marginBottom: 30, maxWidth: 560 }}>
          Don't worry about job titles or formal language. Tell us what you actually do, the way you'd tell a friend.
          We'll figure out the labels.
        </p>

        <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>What do you do? What can you do?</label>
        <textarea className="field" value={story} onChange={e => setStory(e.target.value)} rows="7" placeholder="I help my uncle at the market…" />

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 12, marginTop: 18 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>Your name</label>
            <input className="field" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>Age</label>
            <input className="field" type="number" value={age} onChange={e => setAge(+e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>Education</label>
            <select className="field" value={edu} onChange={e => setEdu(e.target.value)}>
              <option value="no_formal">No formal</option>
              <option value="primary">Primary</option>
              <option value="lower_secondary">Lower secondary</option>
              <option value="upper_secondary">Upper secondary</option>
              <option value="post_secondary">Post-secondary / TVET</option>
              <option value="tertiary">Tertiary</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>
            We never share your story without permission. <SourceTag sourceId="esco" label="ESCO mapping" /> happens privately.
          </p>
          <button className="btn btn-primary" onClick={onNext}>See my passport →</button>
        </div>
      </div>

      <div className="card" style={{ background: "var(--paper-card)", borderRadius: 22, position: "sticky", top: 90 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p className="mono" style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>What we hear, live</p>
          <span className="pill" style={{ background: "var(--green-pale)", color: "var(--green)", borderColor: "#c8debc" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--green)" }}></span> listening
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.5, marginBottom: 18 }}>
          As you write, we map your words to the formal skill vocabulary used by employers and ministries.
          <span style={{ color: "var(--ink-faint)" }}> You'll never see those codes — but they'll see you.</span>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {detected.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--ink-faint)", fontStyle: "italic" }}>Start writing on the left…</p>
          ) : detected.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--paper-2)", borderRadius: 12 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--ink-faint)" }} className="mono">{s.code}</p>
              </div>
              <span style={{ fontSize: 11, color: s.kind === "durable" ? "var(--green)" : "var(--coral)" }}>
                {s.kind === "durable" ? "● durable" : "○ AI-vulnerable"}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line-soft)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--ink-mute)" }}>
            Country context: <span style={{ fontWeight: 600, color: "var(--ink)" }}>{c.flag} {c.name}</span>
          </p>
          <SourceTag sourceId="isco" label="ISCO-08" mini />
        </div>
      </div>
    </div>
  );
}

function inferSkills(text) {
  const t = text.toLowerCase();
  const r = [];
  const rules = [
    { key: ["fix", "repair", "mobile", "phone", "circuit", "board", "screen", "battery"],
      label: "Mobile electronics repair", code: "ESCO ▸ S6.2.1 / O*NET 49-2094", kind: "durable" },
    { key: ["customer", "client", "explain", "calm"],
      label: "Customer service & complaint handling", code: "ESCO ▸ S1.6.1", kind: "durable" },
    { key: ["notebook", "inventory", "track", "parts", "stock"],
      label: "Inventory & stock tracking", code: "ESCO ▸ S5.6.2", kind: "vulnerable" },
    { key: ["whatsapp", "post", "social", "share"],
      label: "Social media micro-marketing", code: "ESCO ▸ S5.5.4", kind: "vulnerable" },
    { key: ["uncle", "stall", "shop", "market"],
      label: "Small-business / shop floor operations", code: "O*NET 41-1011 (related)", kind: "durable" },
    { key: ["solar", "panel", "install"],
      label: "Solar panel installation", code: "O*NET 47-2231", kind: "durable" },
    { key: ["nurse", "care", "patient"],
      label: "Primary care / community health", code: "ISCO 3221", kind: "durable" },
    { key: ["weld", "cnc", "machine"],
      label: "Manufacturing — machine setup", code: "O*NET 51-4011", kind: "durable" },
  ];
  rules.forEach(rule => {
    if (rule.key.some(k => t.includes(k))) r.push(rule);
  });
  return r.slice(0, 6);
}

function YouthPassport({ name, story, country, onNext }) {
  const skills = inferSkills(story);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <p className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>step two</p>
          <h1 className="display" style={{ fontSize: 56, fontWeight: 500, marginBottom: 8 }}>
            Your <span className="serif-italic" style={{ color: "var(--green)" }}>skills passport.</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-soft)", maxWidth: 560 }}>One card per skill. Each shows what we heard, why we believe it, and whether the skill is durable or at risk from AI.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-cream">↓ Download as PDF</button>
          <button className="btn btn-cream">↗ Share link</button>
        </div>
      </div>

      {/* Passport hero */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 18, marginBottom: 18 }}>
        <div className="card" style={{ background: "var(--green)", color: "#fff", borderRadius: 22, padding: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 28, right: 28, width: 80, height: 100, borderRadius: 12, overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)" }}>
            <img src="./uploads/amara_portrait.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <p className="mono" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.8, margin: 0 }}>SKILLS PASSPORT · 2026</p>
          <h2 className="display" style={{ fontSize: 36, fontWeight: 500, marginTop: 14, marginBottom: 4 }}>{name}</h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>{window.UM_DATA.COUNTRIES.find(c => c.code === country).name} · informal sector verified</p>
          <div style={{ marginTop: 30, display: "flex", gap: 18 }}>
            <div><p style={{ fontSize: 10, opacity: 0.7, margin: 0 }}>SKILLS</p><p className="display" style={{ fontSize: 28, margin: 0 }}>{skills.length}</p></div>
            <div><p style={{ fontSize: 10, opacity: 0.7, margin: 0 }}>DURABLE</p><p className="display" style={{ fontSize: 28, margin: 0 }}>{skills.filter(s => s.kind === "durable").length}</p></div>
            <div><p style={{ fontSize: 10, opacity: 0.7, margin: 0 }}>LANGUAGES</p><p className="display" style={{ fontSize: 28, margin: 0 }}>2</p></div>
          </div>
          <div style={{ position: "absolute", left: -40, bottom: -40, width: 160, height: 160, borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)" }}></div>
          <div style={{ position: "absolute", left: 10, top: 14, fontFamily: "JetBrains Mono", fontSize: 10, opacity: 0.5 }}>UM-{country}-0142</div>
        </div>
        <div className="card" style={{ background: "var(--paper-card)" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 10 }}>The story you told</p>
          <p className="serif-italic" style={{ fontSize: 19, color: "var(--ink)", lineHeight: 1.5, margin: 0 }}>"{story}"</p>
        </div>
      </div>

      {/* Skill cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 30 }}>
        {skills.map((s, i) => <SkillCard key={i} s={s} />)}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>
          Want to know how durability is calculated? <SourceTag sourceId="exposure" label="how it's calculated" />
        </p>
        <button className="btn btn-primary" onClick={onNext}>See opportunities for me →</button>
      </div>
    </div>
  );
}

function SkillCard({ s }) {
  const isDurable = s.kind === "durable";
  return (
    <div className="card" style={{ borderColor: isDurable ? "#c8debc" : "#f3c8b6", padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 0, height: "100%" }}>
        <div style={{ width: 100, height: "auto", minHeight: 120, background: "var(--paper-2)", borderRight: "1px solid var(--line-soft)", overflow: "hidden" }}>
          <img src="./uploads/skills_grid.png" style={{ 
            width: "200%", height: "200%", objectFit: "cover",
            objectPosition: s.label.includes("repair") ? "0% 0%" : s.label.includes("service") ? "100% 0%" : s.label.includes("Inventory") ? "0% 100%" : "100% 100%"
          }} />
        </div>
        <div style={{ padding: 18, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 4 }}>{s.label}</h3>
              <p className="mono" style={{ fontSize: 10, color: "var(--ink-faint)", margin: 0 }}>{s.code}</p>
            </div>
            <span className={"chip " + (isDurable ? "green" : "coral")} style={{ fontSize: 11 }}>
              {isDurable ? "● durable" : "○ AI-vulnerable"}
            </span>
          </div>
          <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--paper-2)", borderRadius: 12 }}>
            <p style={{ margin: 0, fontSize: 11, color: "var(--ink-faint)", marginBottom: 4, fontWeight: 600, letterSpacing: 0.4 }}>WHY WE BELIEVE THIS</p>
            <p className="serif-italic" style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.45 }}>
              {isDurable
                ? "Mentioned hands-on, with context (people, place, tools)."
                : "Mentioned, but task is highly automatable — keep it, but stack a durable skill alongside."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Opportunities ----------

function YouthOpportunities({ country, onNext }) {
  const ops = [
    { role: "Field Solar Technician",     org: "Achieve Solar Ghana", wage: "GHS 1,800–2,400 / mo", honest: "Encaja bien con lo que sabes. Requiere 6 meses de formación TVET en instalación fotovoltaica.", fit: 0.91, gap: ["wiring & inverter setup"], sector: "Renewable energy", training: "6 mo TVET" },
    { role: "Phone repair shop — supervisor", org: "Tech Park Plaza, Accra", wage: "GHS 1,400–1,900 / mo", honest: "Tu oficio actual encaja directamente. El reto: liderar a 2–3 personas y manejar la caja.", fit: 0.84, gap: ["small team supervision"], sector: "Trade & retail", training: "4 wk evening" },
    { role: "After-sales support — telco", org: "MTN Ghana (entry track)", wage: "GHS 2,000–2,600 / mo", honest: "Camino más formal pero estable. Pide upper secondary completado y nivel B1 de inglés.", fit: 0.74, gap: ["English B1", "CRM tools"], sector: "Digital services", training: "8 wk online" },
    { role: "Community health assistant", org: "Ghana Health Service",  wage: "GHS 1,200–1,700 / mo", honest: "Para gente con paciencia y trato; tus skills se transfieren. Requiere 12 semanas de certificación.", fit: 0.62, gap: ["clinical procedures"], sector: "Health & care", training: "12 wk" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>step three</p>
        <h1 className="display" style={{ fontSize: 56, fontWeight: 500, marginBottom: 12 }}>
          Four roles that <span className="serif-italic" style={{ color: "var(--green)" }}>fit you.</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--ink-soft)", maxWidth: 620 }}>
          We didn't show you a list of 47 jobs scored 88/100. We picked four. Real wages, real distance, real honesty about what you'd need to learn.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18, marginBottom: 30 }}>
        {ops.map((o, i) => <OpCard key={i} o={o} />)}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>
          Wages: <SourceTag sourceId="wages" label="ILOSTAT" mini /> &nbsp; Sector growth: <SourceTag sourceId="employment" label="WB WDI" mini />
        </p>
        <button className="btn btn-primary" onClick={onNext}>Show me how to get there →</button>
      </div>
    </div>
  );
}

function OpCard({ o }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ height: 160, overflow: "hidden" }}>
        <img src={
          o.role.includes("Solar") ? "./uploads/solar_technician.png" :
          o.role.includes("repair") ? "./uploads/phone_repair.png" :
          o.role.includes("support") ? "./uploads/telco_support.png" :
          "./uploads/community_health.png"
        } style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 600, margin: 0, marginBottom: 4 }}>{o.role}</h3>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: 0 }}>{o.org}</p>
          </div>
          <span className="chip green" style={{ fontSize: 12 }}>{Math.round(o.fit * 100)}% fit</span>
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--green)", margin: "12px 0 8px" }}>{o.wage}</p>
        <p className="serif-italic" style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.5, margin: 0 }}>"{o.honest}"</p>

        <button onClick={() => setOpen(o => !o)} style={{
          marginTop: 14, border: "none", background: "transparent", padding: 0,
          color: "var(--ink-mute)", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
        }}>
          {open ? "↑ Hide the technical bit" : "↓ Show the technical bit"}
        </button>
        {open && (
          <div className="fadein" style={{ marginTop: 14, padding: "14px", background: "var(--paper-2)", borderRadius: 14, fontSize: 13, lineHeight: 1.6, color: "var(--ink-soft)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Skill gap</span>
              <span style={{ color: "var(--coral)" }}>{o.gap.join(", ")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Training to close it</span>
              <span>{o.training}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Sector signal (WB WDI)</span>
              <span>+{(Math.random() * 10 + 4).toFixed(1)}% emp. growth</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600 }}>Composite score</span>
              <span className="mono">{(o.fit).toFixed(2)} (skill_fit 0.42 · reach 0.18 · income 0.16 · sector 0.15 · resilience 0.09)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Training ----------

function YouthTraining({ country, onHome }) {
  const paths = [
    { name: "Solar Field Technician — TVET Ghana", duration: "6 months · Mon–Fri", cost: "Free (NGO-funded)", provider: "GIZ + ENI", loc: "Tema · in-person", waitlist: false, leads: ["Field Solar Technician — Achieve Solar"] },
    { name: "Digital customer care fundamentals",   duration: "8 weeks · evenings", cost: "Free",            provider: "ALX Africa", loc: "Online", waitlist: false, leads: ["After-sales support — MTN", "Phone repair shop supervisor"] },
    { name: "ECOWAS Renewables Apprenticeship",     duration: "9 months · paid stipend", cost: "USD 80 fee", provider: "ECOWAS Centre", loc: "Accra · in-person", waitlist: true, leads: ["Field Solar Technician"] },
  ];
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>step four</p>
        <h1 className="display" style={{ fontSize: 56, fontWeight: 500, marginBottom: 12 }}>
          Three paths to <span className="serif-italic" style={{ color: "var(--green)" }}>get there.</span>
        </h1>
        <p style={{ fontSize: 16, color: "var(--ink-soft)", maxWidth: 620 }}>Real programs, in your country, with real start dates. We linked the providers.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 30 }}>
        {paths.map((p, i) => (
          <div key={i} className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <span className="chip green">{p.cost}</span>
                <span className="chip">{p.duration}</span>
                <span className="chip">{p.loc}</span>
                {p.waitlist && <span className="chip coral">waitlist · 4 wk</span>}
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 600, margin: 0, marginBottom: 6 }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: 0, marginBottom: 8 }}>Run by {p.provider}</p>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>↳</span> Unlocks: {p.leads.join(" · ")}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn btn-primary" style={{ padding: "10px 18px", fontSize: 14 }}>Apply →</button>
              <button className="btn btn-cream" style={{ padding: "8px 14px", fontSize: 12 }}>Save for later</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 28, borderRadius: 22, background: "var(--green)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h3 className="display" style={{ fontSize: 26, fontWeight: 500, margin: 0, marginBottom: 4 }}>You'll hear from us.</h3>
          <p style={{ fontSize: 15, margin: 0, opacity: 0.85, maxWidth: 480 }}>When an employer matches your passport, when a new cohort opens — we'll send a single message. No spam.</p>
        </div>
        <button className="btn" style={{ background: "#fff", color: "var(--green)" }} onClick={onHome}>Back home</button>
      </div>
    </div>
  );
}

window.PortalYouth = PortalYouth;
