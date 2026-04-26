// Landing page — single screen, three doors. No dashboard, no jargon.

function Landing({ onPick }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <TopBar onHome={() => {}} />

      {/* Hero */}
      <section style={{ padding: "60px 28px 30px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <span style={{ width: 32, height: 1, background: "var(--ink)" }}></span>
              <span className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-soft)" }}>
                a labour-market intelligence layer for LMICs
              </span>
            </div>
            <h1 className="display" style={{ fontSize: "clamp(48px, 6.4vw, 92px)", fontWeight: 500, lineHeight: 0.96, marginBottom: 28 }}>
              <span>600 million</span><br />
              <span className="serif-italic" style={{ color: "var(--green)" }}>young people.</span><br />
              <span style={{ color: "var(--ink-soft)" }}>Invisible</span><br />
              <span style={{ color: "var(--ink-soft)" }}>to the formal economy.</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--ink-soft)", maxWidth: 540, marginBottom: 12 }}>
              Their skills exist. Their work history exists. They just don't show up in any database
              an employer, an NGO or a ministry can search.
            </p>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--ink-soft)", maxWidth: 540, marginBottom: 36 }}>
              <em className="serif-italic" style={{ color: "var(--green)" }}>Unmapped</em> turns the way a young person tells you about their work
              into something the formal economy can find.
            </p>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => onPick("youth")}>
                I'm looking for opportunities
                <span>→</span>
              </button>
              <span style={{ fontSize: 14, color: "var(--ink-faint)" }}>or scroll</span>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "relative", height: 540 }}>
              <div style={{ position: "absolute", top: 0, right: 30, width: 280, height: 360, borderRadius: 200, transform: "rotate(-3deg)", overflow: "hidden", border: "4px solid #fff", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                <img src="./uploads/phone_repair.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", bottom: 60, left: 0, width: 240, height: 240, borderRadius: 24, transform: "rotate(4deg)", overflow: "hidden", border: "4px solid #fff", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                <img src="./uploads/circuit_board_hands.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{
                position: "absolute", bottom: 0, right: 80, width: 220,
                background: "var(--paper-card)", border: "1px solid var(--line)", borderRadius: 18, padding: 16,
                boxShadow: "0 20px 40px -16px rgba(22,36,28,0.2)", transform: "rotate(2deg)",
              }}>
                <p className="mono" style={{ fontSize: 10, color: "var(--ink-faint)", margin: 0, marginBottom: 6 }}>SKILLS PASSPORT</p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Amara K. — 22, Accra</p>
                <p className="serif-italic" style={{ margin: "8px 0 0", fontSize: 13, color: "var(--green)" }}>"I fix mobile phones at my uncle's stall."</p>
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  <span className="chip green" style={{ fontSize: 10, padding: "3px 8px" }}>electronics repair</span>
                  <span className="chip" style={{ fontSize: 10, padding: "3px 8px" }}>customer service</span>
                  <span className="chip" style={{ fontSize: 10, padding: "3px 8px" }}>+ 3 more</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three doors */}
      <section style={{ padding: "40px 28px 80px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 30 }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-soft)" }}>
            three doors, one platform
          </span>
          <span style={{ flex: 1, height: 1, background: "var(--line)" }}></span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          <DoorCard
            kind="youth"
            label="01"
            title="I'm a young person"
            sub="Looking for work, training, or a clearer path."
            blurb="Tell us what you can do, in your own words. We turn that into a skills passport employers can actually find."
            color="var(--green)"
            photoLabel="youth at work, market scene"
            onPick={onPick}
          />
          <DoorCard
            kind="employer"
            label="02"
            title="I'm an employer or NGO"
            sub="Looking for talent in places nobody else is searching."
            blurb="Write a job in plain language. We map it to ESCO/O*NET behind the scenes and surface candidates who fit, including informal sector profiles."
            color="var(--sky)"
            photoLabel="solar field team, Lagos"
            onPick={onPick}
          />
          <DoorCard
            kind="explorer"
            label="03"
            title="I want to see the data"
            sub="Researcher, ministry, journalist, donor."
            blurb="A world map you can read in five seconds. Click a country, see the sectors, audit the source. No log-in required."
            color="var(--coral)"
            photoLabel="hand on globe, library"
            onPick={onPick}
          />
        </div>

        <div style={{ marginTop: 60, padding: 28, borderRadius: 22, background: "var(--paper-2)", border: "1px solid var(--line-soft)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24 }}>
            <Stat n="600M" l="young people not in the formal economy" />
            <Stat n="89%"  l="of LMIC employment is informal in some countries" />
            <Stat n="16"  l="countries with calibrated country packs" />
            <Stat n="12+" l="open data sources, every number auditable" />
          </div>
        </div>

        <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>
            Built on ILO, World Bank, ESCO, O*NET, ITU, Wittgenstein Centre & ILOSTAT.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>
            Every chart on this site has an <span style={{ color: "var(--green)", fontWeight: 600 }}>ⓘ source</span> button. We mean it.
          </p>
        </div>
      </section>
    </div>
  );
}

function DoorCard({ kind, label, title, sub, blurb, color, photoLabel, onPick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onPick(kind)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: "left", border: "1px solid var(--line)", background: "var(--paper-card)",
        borderRadius: 24, padding: 0, overflow: "hidden", cursor: "pointer",
        fontFamily: "inherit", color: "var(--ink)",
        transition: "transform .25s ease, box-shadow .25s ease",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hover ? "0 24px 50px -16px rgba(22,36,28,0.18)" : "0 0 0 transparent",
        display: "flex", flexDirection: "column",
      }}
    >
      <div style={{ height: 200, overflow: "hidden" }}>
        <img src={
          kind === "youth" ? "./uploads/amara_portrait.png" :
          kind === "employer" ? "./uploads/solar_technician.png" :
          "./uploads/data_explorer_map.png"
        } style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ padding: "26px 26px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: 1.5 }}>{label}</span>
          <span style={{ fontSize: 22, color }}>→</span>
        </div>
        <h3 className="display" style={{ fontSize: 30, marginBottom: 8, fontWeight: 500 }}>{title}</h3>
        <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 14, fontStyle: "italic" }}>{sub}</p>
        <p style={{ color: "var(--ink-mute)", fontSize: 14, lineHeight: 1.55, margin: 0 }}>{blurb}</p>
      </div>
    </button>
  );
}

function Stat({ n, l }) {
  return (
    <div>
      <p className="display" style={{ fontSize: 44, fontWeight: 500, color: "var(--green)", marginBottom: 6 }}>{n}</p>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0, lineHeight: 1.4 }}>{l}</p>
    </div>
  );
}

window.Landing = Landing;
