import { useEffect, useState } from "react";
import Landing from "./components/Landing";
import PortalYouth from "./components/PortalYouth";
import PortalEmployer from "./components/PortalEmployer";
import PortalExplorer from "./components/PortalExplorer";
import { TweaksPanel, TweakSection, TweakRadio, TweakSlider, TweakToggle, useTweaks } from "./components/TweaksPanel";

type Route = "landing" | "youth" | "employer" | "explorer";

const VALID_ROUTES: Route[] = ["landing", "youth", "employer", "explorer"];

export default function App() {
  const [route, setRoute] = useState<Route>("landing");

  useEffect(() => {
    const h = window.location.hash.replace("#", "") as Route;
    if (VALID_ROUTES.includes(h)) setRoute(h);
    const onHash = () => {
      const hh = window.location.hash.replace("#", "") as Route;
      if (VALID_ROUTES.includes(hh)) setRoute(hh);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function go(r: Route) {
    setRoute(r);
    window.location.hash = r;
    window.scrollTo(0, 0);
  }

  return (
    <div>
      {route === "landing"  && <Landing onPick={go} />}
      {route === "youth"    && <PortalYouth onHome={() => go("landing")} />}
      {route === "employer" && <PortalEmployer onHome={() => go("landing")} />}
      {route === "explorer" && <PortalExplorer onHome={() => go("landing")} />}

      {route !== "landing" && (
        <div style={{
          position: "fixed", bottom: 16, left: 16, zIndex: 30,
          background: "var(--paper-card)", border: "1px solid var(--line)",
          borderRadius: 999, padding: 4, display: "flex", gap: 2,
          boxShadow: "0 16px 30px -10px rgba(22,36,28,0.18)",
        }}>
          {([["landing", "⌂"], ["youth", "Young people"], ["employer", "Employer/NGO"], ["explorer", "Data"]] as const).map(([r, l]) => (
            <button key={r} onClick={() => go(r as Route)} style={{
              padding: "8px 14px", borderRadius: 999, border: "none",
              background: route === r ? "var(--ink)" : "transparent",
              color: route === r ? "var(--paper)" : "var(--ink-soft)",
              fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>
      )}

      <Tweaks />
    </div>
  );
}

function Tweaks() {
  const [tweaks, setTweak] = useTweaks({
    accent: "green",
    playfulness: 1,
    showSources: true,
    denseMode: false,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (tweaks.accent === "green") { root.style.setProperty("--green", "#1f5d3a"); root.style.setProperty("--green-pale", "#ecf3e8"); }
    if (tweaks.accent === "ocean") { root.style.setProperty("--green", "#1f4f7a"); root.style.setProperty("--green-pale", "#e2eaf2"); }
    if (tweaks.accent === "earth") { root.style.setProperty("--green", "#8a4a1a"); root.style.setProperty("--green-pale", "#f3e3d2"); }

    const soft = 60 + tweaks.playfulness * 30;
    document.querySelectorAll<HTMLElement>(".display").forEach(el => {
      el.style.fontVariationSettings = `"SOFT" ${soft}, "WONK" 0`;
    });

    document.body.style.fontSize = tweaks.denseMode ? "14px" : "16px";

    document.querySelectorAll<HTMLElement>(".source-btn").forEach(el => {
      el.style.display = tweaks.showSources ? "" : "none";
    });
  }, [tweaks]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Accent palette">
        <TweakRadio
          value={tweaks.accent}
          onChange={v => setTweak("accent", v)}
          options={[
            { value: "green", label: "Forest" },
            { value: "ocean", label: "Ocean" },
            { value: "earth", label: "Earth" },
          ]}
        />
      </TweakSection>
      <TweakSection title="Display font softness">
        <TweakSlider value={tweaks.playfulness} onChange={v => setTweak("playfulness", v)} min={0} max={1} step={0.05} />
        <p style={{ fontSize: 11, color: "var(--ink-faint)", margin: "6px 0 0" }}>0 = formal, 1 = playful & rounded</p>
      </TweakSection>
      <TweakSection title="Show data sources">
        <TweakToggle value={tweaks.showSources} onChange={v => setTweak("showSources", v)} />
        <p style={{ fontSize: 11, color: "var(--ink-faint)", margin: "6px 0 0" }}>The little ⓘ buttons next to every number</p>
      </TweakSection>
      <TweakSection title="Dense mode">
        <TweakToggle value={tweaks.denseMode} onChange={v => setTweak("denseMode", v)} />
        <p style={{ fontSize: 11, color: "var(--ink-faint)", margin: "6px 0 0" }}>Smaller base size for power users</p>
      </TweakSection>
    </TweaksPanel>
  );
}
