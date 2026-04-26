interface SkillRow {
  label: string;
  code: string;
  durable: boolean;
  evidence: string;
}

interface PassportData {
  name: string;
  story: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  countryInformal: number;
  edu: string;
  skills: SkillRow[];
}

function eduLabel(edu: string): string {
  const map: Record<string, string> = {
    lower_secondary: "Lower secondary",
    upper_secondary: "Upper secondary — completed",
    post_secondary: "Post-secondary / TVET",
    tertiary: "Tertiary / university",
  };
  return map[edu] || edu.replace("_", " ");
}

function serial(name: string, countryCode: string): string {
  const initials = name.split(/\s+/).map(p => p[0]?.toUpperCase() || "").join("").slice(0, 3);
  const num = String(Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 9000 + 1000);
  return `UMP·${countryCode}·24·${num}·${initials}`;
}

function issuedDate(): string {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function generatePassportHTML(data: PassportData): string {
  const { name, story, countryCode, countryName, countryFlag, countryInformal, edu, skills } = data;
  const ser = serial(name, countryCode);
  const durable = skills.filter(s => s.durable).length;
  const langs = 2;
  const quoteText = story.length > 220 ? story.slice(0, 220).replace(/\s\S*$/, "") + "…" : story;

  const skillRows = skills.map(s => `
    <div style="display:grid;grid-template-columns:2fr 1fr 120px;padding:12px 14px;border-top:1px solid #e6dec8;align-items:center;gap:10px">
      <div>
        <p style="margin:0;font-weight:600;font-size:13px">${s.label}</p>
        <p style="margin:4px 0 0;font-size:11.5px;color:#5b6b62;font-family:'Fraunces',Georgia,serif;font-style:italic;line-height:1.45">${s.evidence}</p>
      </div>
      <p style="margin:0;font-size:9.5px;color:#8a978f;font-family:'JetBrains Mono',monospace">${s.code.replace("▸ ", "")}</p>
      <span style="justify-self:end;padding:4px 10px;border-radius:999px;font-size:10px;font-weight:600;background:${s.durable ? "#ecf3e8" : "#fbe6dd"};color:${s.durable ? "#1f5d3a" : "#b8492a"};border:1px solid ${s.durable ? "#c8debc" : "#f3c8b6"}">
        ${s.durable ? "● durable" : "○ AI-vulnerable"}
      </span>
    </div>
  `).join("");

  const spirograph = (r: number, n: number, stroke: string) =>
    Array.from({ length: n }, (_, i) =>
      `<ellipse cx="100" cy="100" rx="${r}" ry="${Math.round(r * 0.4)}" transform="rotate(${i * (180 / n)} 100 100)"/>`
    ).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Unmapped Skills Passport — ${name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:#1a1a1a;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
  .display{font-family:'Fraunces',Georgia,serif;font-variation-settings:"SOFT" 100;letter-spacing:-0.02em;line-height:1}
  .mono{font-family:'JetBrains Mono',monospace}
  @page{size:A4 portrait;margin:0}
  @media print{
    html,body{background:#f6f1e7}
    .page{box-shadow:none!important;margin:0!important}
  }
</style>
</head>
<body>
<div class="page" style="width:794px;height:1123px;background:#f6f1e7;position:relative;font-family:'Plus Jakarta Sans',sans-serif;color:#16241c;padding:48px 52px;box-sizing:border-box;overflow:hidden;margin:0 auto;box-shadow:0 0 60px rgba(0,0,0,0.3)">

  <!-- Background spirograph ornament -->
  <svg width="600" height="600" viewBox="0 0 200 200" style="position:absolute;right:-180px;top:-120px;opacity:0.06;pointer-events:none">
    <g fill="none" stroke="#1f5d3a" stroke-width="0.5">${spirograph(80, 40, "#1f5d3a")}</g>
  </svg>

  <!-- Header -->
  <header style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #d8cfba;padding-bottom:14px">
    <div style="display:flex;align-items:center;gap:8px">
      <svg width="22" height="22" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" stroke="#1f5d3a" stroke-width="2" fill="none"/><path d="M16 6 L18.5 14 L26 16 L18.5 18 L16 26 L13.5 18 L6 16 L13.5 14 Z" fill="#1f5d3a"/></svg>
      <span class="display" style="font-size:18px;font-weight:600">unmapped<span style="color:#e26a4a">.</span></span>
    </div>
    <div style="text-align:right">
      <p class="mono" style="font-size:9px;letter-spacing:1.5px;color:#8a978f;text-transform:uppercase">Skills Passport · Page 1 of 1</p>
      <p class="mono" style="margin-top:2px;font-size:9px;color:#8a978f">${ser}</p>
    </div>
  </header>

  <!-- Title block: left text + right mini passport card -->
  <section style="display:grid;grid-template-columns:1.4fr 1fr;gap:30px;margin-top:28px;align-items:start">
    <div>
      <p class="mono" style="font-size:10px;letter-spacing:1.5px;color:#8a978f;text-transform:uppercase">Issued · ${issuedDate()}</p>
      <h1 class="display" style="margin:10px 0 4px;font-size:54px;font-weight:500;line-height:0.96">
        ${name.split(/\s+/).slice(0, -1).join(" ")} <span style="color:#e26a4a">${name.split(/\s+/).slice(-1)[0] || ""}</span>
      </h1>
      <p style="margin:8px 0 0;font-size:14px;color:#2d3b32">${countryFlag} ${countryName} · informal-sector verified</p>
      <p class="display" style="margin:18px 0 0;font-size:16px;font-style:italic;font-weight:400;line-height:1.55;color:#2d3b32;max-width:380px;border-left:2px solid #e26a4a;padding-left:14px">
        "${quoteText}"
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:#8a978f">— self-described, in own words</p>
    </div>

    <!-- Mini passport card -->
    <div style="border-radius:20px;background:linear-gradient(165deg,#1f5d3a,#103a23);color:#fff;padding:18px;position:relative;overflow:hidden;box-shadow:0 16px 40px -20px rgba(16,58,35,0.5)">
      <svg width="180" height="180" viewBox="0 0 200 200" style="position:absolute;right:-60px;bottom:-60px;opacity:0.2">
        <g fill="none" stroke="#f3c75a" stroke-width="0.5">${spirograph(70, 24, "#f3c75a")}</g>
      </svg>
      <div style="display:flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1.5px;opacity:0.75">
        <span style="width:8px;height:8px;border-radius:50%;background:#f3c75a"></span>
        UNMAPPED · SKILLS PASSPORT
      </div>
      <div style="display:flex;gap:10px;margin-top:18px;align-items:flex-end">
        <div style="width:54px;height:66px;border-radius:9px;border:1.5px solid rgba(243,199,90,0.6);background:#3f9c69;background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.1) 0,rgba(255,255,255,0.1) 1px,transparent 1px,transparent 6px)"></div>
        <div>
          <p class="display" style="font-size:22px;font-weight:500">${name}</p>
          <p style="margin:2px 0 0;font-size:10px;color:rgba(255,255,255,0.7)">${countryFlag} ${countryName}</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:16px">
        ${[{ n: skills.length, l: "skills" }, { n: durable, l: "durable" }, { n: langs, l: "lang." }].map(s => `
          <div style="border-radius:9px;padding:8px 9px;background:rgba(255,255,255,0.07);border:1px solid rgba(243,199,90,0.2)">
            <p class="display" style="font-size:22px;font-weight:500;color:#f3c75a">${s.n}</p>
            <p style="font-size:8px;letter-spacing:1.2px;color:rgba(255,255,255,0.6);text-transform:uppercase">${s.l}</p>
          </div>`).join("")}
      </div>
    </div>
  </section>

  <!-- Verified skills table -->
  <section style="margin-top:28px">
    <div style="display:flex;align-items:baseline;justify-content:space-between">
      <h2 class="display" style="font-size:22px;font-weight:500">Verified skills</h2>
      <span class="mono" style="font-size:9px;letter-spacing:1.5px;color:#8a978f;text-transform:uppercase">ESCO · O*NET · ISCO-08</span>
    </div>
    <div style="margin-top:12px;border:1px solid #d8cfba;border-radius:14px;overflow:hidden;background:#fdfaf2">
      <div style="display:grid;grid-template-columns:2fr 1fr 120px;padding:10px 14px;align-items:center;gap:10px;background:#f6f1e7">
        <p class="mono" style="font-size:9px;letter-spacing:1px;color:#8a978f;text-transform:uppercase">Skill</p>
        <p class="mono" style="font-size:9px;letter-spacing:1px;color:#8a978f;text-transform:uppercase">Code</p>
        <p class="mono" style="font-size:9px;letter-spacing:1px;color:#8a978f;text-transform:uppercase;justify-self:end">Durability</p>
      </div>
      ${skillRows}
    </div>
  </section>

  <!-- Education + Languages two-up -->
  <section style="margin-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:14px">
    <div style="padding:14px;border-radius:14px;background:#fdfaf2;border:1px solid #e6dec8">
      <p class="mono" style="font-size:9px;letter-spacing:1.5px;color:#8a978f;text-transform:uppercase">Education</p>
      <p style="margin:8px 0 0;font-size:13px;font-weight:600">${eduLabel(edu)}</p>
      <div style="height:1px;background:#e6dec8;margin:10px 0"></div>
      <p class="mono" style="font-size:9px;letter-spacing:1.5px;color:#8a978f;text-transform:uppercase">Availability</p>
      <p style="margin:8px 0 0;font-size:13px;font-weight:600">Full-time · willing to relocate within ${countryName.split(" ")[0]}</p>
    </div>
    <div style="padding:14px;border-radius:14px;background:#fdfaf2;border:1px solid #e6dec8">
      <p class="mono" style="font-size:9px;letter-spacing:1.5px;color:#8a978f;text-transform:uppercase">Languages</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:600;font-size:13px">Twi</span><span style="font-size:11.5px;color:#5b6b62">Native</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:600;font-size:13px">English</span><span style="font-size:11.5px;color:#5b6b62">B1 · conversational</span>
        </div>
      </div>
      <div style="height:1px;background:#e6dec8;margin:10px 0"></div>
      <p class="mono" style="font-size:9px;letter-spacing:1.5px;color:#8a978f;text-transform:uppercase">Country profile</p>
      <p style="margin:8px 0 0;font-size:11.5px;color:#5b6b62;line-height:1.5">${countryName} — informal employment ${countryInformal}%. Sectors aligned to this profile: trade &amp; retail, renewable energy, telco services.</p>
    </div>
  </section>

  <!-- Footer -->
  <footer style="position:absolute;left:52px;right:52px;bottom:36px">
    <div style="height:1px;background:#d8cfba;margin-bottom:14px"></div>
    <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:18px;align-items:flex-end">
      <div>
        <p class="mono" style="font-size:9px;letter-spacing:1.5px;color:#8a978f;text-transform:uppercase">Methodology</p>
        <p style="margin:6px 0 0;font-size:10.5px;color:#5b6b62;line-height:1.55">
          Skills extracted from a self-narrated story by an LLM-assisted classifier and aligned to ESCO v1.2.0 / O*NET 28.0. Durability rating draws on ILO Working Paper 140 (2024) — task-level AI exposure scores. Verified at issuance; revocable.
        </p>
      </div>
      <div style="border:1.5px dashed #d8cfba;border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px">
        <div style="width:54px;height:54px;background:#16241c;border-radius:6px;flex-shrink:0;background-image:repeating-linear-gradient(0deg,#f6f1e7 0 4px,transparent 4px 8px),repeating-linear-gradient(90deg,#f6f1e7 0 4px,transparent 4px 8px)"></div>
        <div>
          <p class="mono" style="font-size:9px;letter-spacing:1.5px;color:#8a978f;text-transform:uppercase">Verify</p>
          <p style="margin:4px 0 0;font-size:11px;font-weight:600">unmapped.org/v/<br/>${ser}</p>
        </div>
      </div>
    </div>
  </footer>
</div>

<script>
  document.fonts.ready.then(function() {
    setTimeout(function(){ window.print(); }, 400);
  });
</script>
</body>
</html>`;
}

export function downloadPassport(data: PassportData): void {
  const html = generatePassportHTML(data);
  const w = window.open("", "_blank", "width=900,height=1200");
  if (!w) { alert("Please allow pop-ups for this site to download the PDF."); return; }
  w.document.write(html);
  w.document.close();
}
