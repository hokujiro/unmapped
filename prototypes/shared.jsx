// Shared UI primitives: logo, top bar, source modal, photo placeholders, notifications dropdown.

const { useState, useEffect, useRef } = React;

function Logo({ size = 22, color = "currentColor" }) {
  // Simple compass / pin / leaf abstraction — original mark for "Unmapped"
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" stroke={color} strokeWidth="2" />
      <path d="M16 6 L18.5 14 L26 16 L18.5 18 L16 26 L13.5 18 L6 16 L13.5 14 Z" fill={color} />
    </svg>
  );
}

function Wordmark({ small = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Logo size={small ? 22 : 28} color="var(--green)" />
      <span className="display" style={{ fontSize: small ? 18 : 22, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}>
        unmapped
        <span style={{ color: "var(--coral)" }}>.</span>
      </span>
    </div>
  );
}

// Small "ⓘ" button that opens a modal explaining the data source.
function SourceTag({ sourceId, label, mini = false }) {
  const [open, setOpen] = useState(false);
  const SOURCES = window.UM_DATA.SOURCES;
  const src = SOURCES[sourceId];
  return (
    <>
      <button
        className="source-btn"
        onClick={() => setOpen(true)}
        title="Where does this number come from?"
        style={mini ? { fontSize: 10, padding: "3px 8px" } : null}
      >
        <span style={{ fontFamily: "JetBrains Mono", fontSize: mini ? 9 : 10 }}>ⓘ</span>
        {label || (src ? src.id : "source")}
      </button>
      {open && src && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
              <span className="pill" style={{ background: "var(--green-pale)", color: "var(--green)", borderColor: "#c8debc" }}>
                {src.id}
              </span>
              <button onClick={() => setOpen(false)} style={{ border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: "var(--ink-mute)" }}>×</button>
            </div>
            <h3 className="display" style={{ fontSize: 26, marginBottom: 8 }}>{src.title}</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.55, marginBottom: 18 }}>{src.blurb}</p>
            <div style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 16, fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.6 }}>
              <p style={{ margin: 0, marginBottom: 6, fontWeight: 600, color: "var(--ink-soft)" }}>How we use it</p>
              <p style={{ margin: 0 }}>
                Ingested through Unmapped's adapter pipeline (<code className="mono" style={{ fontSize: 12 }}>adapters/{sourceId.toLowerCase().split('-')[0]}.py</code>),
                cached daily, and combined with country-specific LMIC discount factors before display.
                You can audit every step in the adapter source.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Top bar shared between portals
function TopBar({ portal, onHome, country, onCountryChange, notifications }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const COUNTRIES = window.UM_DATA.COUNTRIES;
  const c = COUNTRIES.find(c => c.code === country) || COUNTRIES[0];

  return (
    <header style={{
      background: "var(--paper)",
      borderBottom: "1px solid var(--line-soft)",
      padding: "16px 28px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 40,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <button onClick={onHome} style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer" }}>
          <Wordmark small />
        </button>
        {portal && (
          <>
            <span style={{ color: "var(--line)", fontSize: 18 }}>/</span>
            <span style={{ fontSize: 14, color: "var(--ink-soft)", fontWeight: 600 }}>{portal}</span>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {country && onCountryChange && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setCountryOpen(o => !o)}
              className="pill"
              style={{ background: "#fff", cursor: "pointer", padding: "8px 14px", fontSize: 13 }}
            >
              <span style={{ fontSize: 16 }}>{c.flag}</span>
              {c.name}
              <span style={{ marginLeft: 4, opacity: 0.5 }}>▾</span>
            </button>
            {countryOpen && (
              <div className="fadein" style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "var(--paper-card)", border: "1px solid var(--line)",
                borderRadius: 16, padding: 8, minWidth: 240, maxHeight: 360, overflow: "auto",
                boxShadow: "0 20px 40px -10px rgba(22,36,28,0.2)", zIndex: 50,
              }}>
                {COUNTRIES.map(cc => (
                  <button key={cc.code} onClick={() => { onCountryChange(cc.code); setCountryOpen(false); }}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10,
                      border: "none", background: cc.code === country ? "var(--green-pale)" : "transparent",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                      fontSize: 14, color: "var(--ink)", fontFamily: "inherit",
                    }}
                    onMouseEnter={e => { if (cc.code !== country) e.currentTarget.style.background = "var(--paper-2)"; }}
                    onMouseLeave={e => { if (cc.code !== country) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 18 }}>{cc.flag}</span>
                    <span style={{ flex: 1 }}>{cc.name}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{cc.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {notifications && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              style={{
                width: 38, height: 38, borderRadius: 999,
                border: "1px solid var(--line)", background: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10 21a2 2 0 004 0" />
              </svg>
              {notifications.length > 0 && (
                <span style={{
                  position: "absolute", top: 6, right: 6, width: 8, height: 8,
                  borderRadius: 999, background: "var(--coral)",
                }} />
              )}
            </button>
            {notifOpen && (
              <div className="fadein" style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "var(--paper-card)", border: "1px solid var(--line)",
                borderRadius: 18, padding: 8, width: 320,
                boxShadow: "0 20px 40px -10px rgba(22,36,28,0.2)", zIndex: 50,
              }}>
                <div style={{ padding: "8px 10px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", letterSpacing: 0.4, textTransform: "uppercase" }}>Notifications</span>
                  <button style={{ border: "none", background: "transparent", fontSize: 11, color: "var(--ink-faint)", cursor: "pointer" }}>Mark all read</button>
                </div>
                {notifications.map((n, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 12, display: "flex", gap: 10,
                    background: i === 0 ? "var(--paper-2)" : "transparent",
                  }}>
                    <span style={{
                      width: 30, height: 30, borderRadius: 999,
                      background: n.kind === "match" ? "var(--green-pale)" : n.kind === "alert" ? "#fbe6dd" : "var(--paper-2)",
                      color: n.kind === "match" ? "var(--green)" : n.kind === "alert" ? "var(--coral)" : "var(--ink-soft)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, fontSize: 14, fontWeight: 700,
                    }}>{n.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.4 }}>{n.text}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{n.time} ago</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

// Photo placeholder
function Photo({ label = "photo", h = 200, dark = false, green = false, style }) {
  const cls = "photo-ph" + (dark ? " dark" : "") + (green ? " green" : "");
  return (
    <div className={cls} style={{ height: h, borderRadius: 18, ...style }}>
      <span>[ {label} ]</span>
    </div>
  );
}

// Risk color helper
function riskColor(risk) {
  if (risk >= 0.6) return "var(--rose)";
  if (risk >= 0.4) return "var(--amber)";
  if (risk >= 0.25) return "var(--ocre)";
  return "var(--leaf)";
}
function riskLabel(risk) {
  if (risk >= 0.6) return "high substitution";
  if (risk >= 0.4) return "moderate";
  if (risk >= 0.25) return "low–moderate";
  return "low — durable";
}

Object.assign(window, {
  Logo, Wordmark, SourceTag, TopBar, Photo, riskColor, riskLabel,
});
