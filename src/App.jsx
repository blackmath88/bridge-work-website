import { useState, useEffect, useRef, useCallback } from "react";

const P = {
  teal: "#1a7a6d",
  tealDark: "#0f5c52",
  tealDeep: "#0a4a3f",
  rose: "#d4416b",
  purple: "#3d1f47",
  purpleMid: "#5a3068",
  purpleDeep: "#2a1433",
  black: "#050505",
  cream: "#f0ebe3",
  creamDark: "#c8c2b8",
};

/* ═══ SVG CELL ═══ */
function C({ type, color, s }) {
  switch (type) {
    case "sq": return <rect width={s} height={s} rx="2" fill={color} />;
    case "arc-br": return <path d={`M0 ${s} Q0 0 ${s} 0 L${s} ${s} Z`} fill={color} />;
    case "arc-tl": return <path d={`M${s} 0 Q0 0 0 ${s} L${s} ${s} Z`} fill={color} />;
    case "arc-tr": return <path d={`M0 0 Q${s} 0 ${s} ${s} L0 ${s} Z`} fill={color} />;
    case "arc-bl": return <path d={`M${s} ${s} Q0 ${s} 0 0 L${s} 0 Z`} fill={color} />;
    case "leaf": return <path d={`M0 0 Q${s} 0 ${s} ${s} Q0 ${s} 0 0 Z`} fill={color} />;
    case "leaf-inv": return <path d={`M${s} 0 Q0 0 0 ${s} Q${s} ${s} ${s} 0 Z`} fill={color} />;
    case "half-t": return <ellipse cx={s/2} cy={s} rx={s/2} ry={s/2} fill={color} />;
    case "half-b": return <ellipse cx={s/2} cy={0} rx={s/2} ry={s/2} fill={color} />;
    case "half-l": return <ellipse cx={s} cy={s/2} rx={s/2} ry={s/2} fill={color} />;
    case "circle": return <circle cx={s/2} cy={s/2} r={s*0.44} fill={color} />;
    default: return null;
  }
}

/* ═══ TILE DATA ═══ */
const heroTiles = [
  { type: "arc-tl", color: P.tealDeep, speed: 0.3, phase: 0 },
  { type: "sq", color: P.purpleDeep, speed: 0.45, phase: 1.4 },
  { type: "leaf", color: P.teal, speed: 0.5, phase: 3.1 },
  { type: "arc-br", color: P.tealDark, speed: 0.6, phase: 0.8 },
  { type: "half-l", color: P.purpleDeep, speed: 0.35, phase: 2.2 },
  { type: "arc-br", color: P.tealDeep, speed: 0.5, phase: 4.5 },
  { type: "circle", color: P.creamDark, speed: 0.25, phase: 1.0 },
  { type: "arc-tl", color: P.purpleMid, speed: 0.55, phase: 5.2 },
  { type: "sq", color: P.purpleDeep, speed: 0.4, phase: 3.6 },
  { type: "leaf-inv", color: P.tealDeep, speed: 0.35, phase: 0.5 },
  { type: "arc-bl", color: P.teal, speed: 0.55, phase: 2.8 },
  { type: "half-t", color: P.cream, speed: 0.28, phase: 4.0 },
  { type: "arc-tr", color: P.purpleDeep, speed: 0.38, phase: 5.8 },
  { type: "half-b", color: P.tealDeep, speed: 0.42, phase: 1.7 },
  { type: "leaf", color: P.purple, speed: 0.48, phase: 3.3 },
  { type: "arc-tl", color: P.teal, speed: 0.6, phase: 0.3 },
];

const capTiles = [
  [["arc-br", P.teal], ["leaf", P.tealDark], ["arc-tl", P.purple]],
  [["leaf-inv", P.purple], ["circle", P.cream], ["arc-bl", P.teal]],
  [["half-t", P.tealDark], ["arc-tr", P.teal], ["sq", P.purple]],
];

const capValues = {
  en: [
    ["Readiness assessment", "Use case identification", "Governance foundations"],
    ["Risk-aware adoption", "Compliance integration", "Sustainable capability"],
    ["Leadership clarity", "Stakeholder alignment", "Decision architecture"],
  ],
  de: [
    ["Readiness-Analyse", "Use-Case-Identifikation", "Governance-Grundlagen"],
    ["Risikobewusste Adoption", "Compliance-Integration", "Nachhaltige Fähigkeiten"],
    ["Leadership-Klarheit", "Stakeholder-Alignment", "Entscheidungsarchitektur"],
  ],
};

/* ═══ BREATHING GRID ═══ */
function BreathingGrid({ tiles, cols, tileSize, gap, dimLeft = false }) {
  const [time, setTime] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let start = null;
    const tick = (ts) => { if (!start) start = ts; setTime((ts - start) / 1000); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  const cellSize = tileSize + gap;
  const rows = Math.ceil(tiles.length / cols);
  const w = cols * cellSize - gap;
  const h = rows * cellSize - gap;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }}>
      {tiles.map((tile, i) => {
        const col = i % cols;
        const wave = Math.sin(time * tile.speed + tile.phase);
        const pulse = Math.max(0, wave);
        const p2 = pulse * pulse;
        const isCream = tile.color === P.cream || tile.color === P.creamDark;
        let baseOp = isCream ? 0.04 : 0.08;
        let peakOp = isCream ? 0.2 : 0.45;
        if (dimLeft) {
          const t = col / Math.max(1, cols - 1);
          baseOp *= (0.15 + t * 0.85);
          peakOp *= (0.15 + t * 0.85);
        }
        return (
          <g key={i} transform={`translate(${col * cellSize}, ${Math.floor(i / cols) * cellSize})`} opacity={baseOp + (peakOp - baseOp) * p2}>
            <C type={tile.type} color={tile.color} s={tileSize} />
          </g>
        );
      })}
    </svg>
  );
}

/* ═══ BREATHING STRIP (for capability bands) ═══ */
function BreathingStrip({ tiles, tileSize, gap, activeColor }) {
  const [time, setTime] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let start = null;
    const tick = (ts) => { if (!start) start = ts; setTime((ts - start) / 1000); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  const cellSize = tileSize + gap;
  const w = tiles.length * cellSize - gap;
  return (
    <svg viewBox={`0 0 ${w} ${tileSize}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }}>
      {tiles.map((tile, i) => {
        const wave = Math.sin(time * tile.speed + tile.phase);
        const pulse = Math.max(0, wave);
        const isAccent = activeColor && i === 1;
        const color = isAccent ? activeColor : tile.color;
        const isCream = tile.color === P.cream || tile.color === P.creamDark;
        const baseOp = isAccent ? 0.4 : isCream ? 0.1 : 0.25;
        const peakOp = isAccent ? 0.8 : isCream ? 0.4 : 0.7;
        return (
          <g key={i} transform={`translate(${i * cellSize}, 0)`} opacity={baseOp + (peakOp - baseOp) * pulse * pulse}>
            <C type={tile.type} color={color} s={tileSize} />
          </g>
        );
      })}
    </svg>
  );
}

/* ═══ SIGNAL MARK ═══ */
function Mark({ size = 28 }) {
  const pad = 5, gap = 3, u = (100 - pad*2 - gap) / 2;
  const x1 = pad, x2 = pad + u + gap, y1 = pad, y2 = pad + u + gap;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <rect x={x1} y={y1} width={u} height={u} rx="1.5" fill={P.teal} />
      <rect x={x2} y={y1} width={u} height={u} rx="1.5" fill={P.purple} />
      <rect x={x1} y={y2} width={u} height={u} rx="1.5" fill={P.purple} />
      <path d={`M${x2} ${y2+u} Q${x2} ${y2} ${x2+u} ${y2} L${x2+u} ${y2+u} Z`} fill={P.rose} />
    </svg>
  );
}

/* ═══ REVEAL ═══ */
function Rv({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 1.15) { setV(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(14px)", transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

/* ═══ STRIP DIVIDER ═══ */
function Strip({ op = 0.18 }) {
  const c = [P.teal, P.purple, P.tealDark, P.purple, P.teal, P.purpleMid, P.tealDark, P.purple, P.rose, P.purple, P.teal, P.tealDark, P.purple, P.tealDark];
  return (
    <div style={{ display: "flex", gap: 2, padding: "0 clamp(24px,6vw,72px)", position: "relative", zIndex: 2 }}>
      {c.map((cl, i) => <div key={i} style={{ height: 1, flex: 1, background: cl, borderRadius: 0.5, opacity: cl === P.rose ? op * 2.5 : op }} />)}
    </div>
  );
}

/* ═══ CAPABILITY BAND ═══ */
function CapabilityBand({ num, title, tiles, values, delay, open, onToggle }) {
  const [h, setH] = useState(false);
  const stripTiles = tiles.map((t, i) => ({ type: t[0], color: t[1], speed: 0.15 + i * 0.08, phase: i * 1.7 + delay * 3 }));
  const contentRef = useRef(null);
  const [contentH, setContentH] = useState(0);
  useEffect(() => { if (contentRef.current) setContentH(contentRef.current.scrollHeight); }, [values]);

  return (
    <Rv delay={delay}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", transition: "border-color 0.5s", borderColor: open ? "rgba(212,65,107,0.15)" : (h ? "rgba(26,122,109,0.12)" : "rgba(255,255,255,0.02)") }}>
        <div onClick={onToggle} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
          style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", cursor: "pointer", padding: "28px 0", userSelect: "none" }}>
          <div style={{ width: 180, height: 48, opacity: open ? 0.7 : (h ? 0.45 : 0.2), transition: "opacity 0.5s", flexShrink: 0 }}>
            <BreathingStrip tiles={stripTiles} tileSize={40} gap={10} activeColor={open ? P.rose : null} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, paddingLeft: 28 }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 300, color: open ? P.rose : (h ? P.teal : "rgba(255,255,255,0.04)"), transition: "color 0.5s", letterSpacing: "-0.04em" }}>{num}</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 400, color: open ? P.cream : (h ? P.cream : "rgba(255,255,255,0.5)"), transition: "color 0.4s, transform 0.4s cubic-bezier(0.22,1,0.36,1)", transform: (h || open) ? "translateX(3px)" : "none", letterSpacing: "0.01em" }}>{title}</span>
          </div>
          <span style={{ fontSize: 16, color: open ? P.rose : P.teal, opacity: (h || open) ? 0.5 : 0, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)", marginRight: 4 }}>→</span>
        </div>
        <div style={{ overflow: "hidden", maxHeight: open ? contentH + 40 : 0, opacity: open ? 1 : 0, transition: "max-height 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease" }}>
          <div ref={contentRef} style={{ padding: "0 0 28px 208px", display: "flex", gap: 32, flexWrap: "wrap" }}>
            {values.map((val, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 4, height: 4, borderRadius: 1, background: i === 0 ? P.rose : P.teal, opacity: 0.5, flexShrink: 0 }} />
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.04em", color: "rgba(255,255,255,0.3)" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Rv>
  );
}

/* ═══ SCROLL INDICATOR ═══ */
function ScrollDown() {
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const h = () => setVis(window.scrollY < 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: vis ? 0.15 : 0, transition: "opacity 0.6s", pointerEvents: vis ? "auto" : "none", cursor: "pointer", zIndex: 2 }}
      onClick={() => document.getElementById("below")?.scrollIntoView({ behavior: "smooth" })}>
      <svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1">
        <path d="M7 1 L7 17 M2 13 L7 18 L12 13" />
      </svg>
    </div>
  );
}

/* ═══ APP ═══ */
export default function App() {
  const [lang, setLang] = useState("en");
  const t = useCallback((en, de) => lang === "de" ? de : en, [lang]);
  const [sc, setSc] = useState(false);
  const [openCap, setOpenCap] = useState(null);

  useEffect(() => {
    const h = () => setSc(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);

  const px = "clamp(24px,6vw,72px)";
  const vals = lang === "de" ? capValues.de : capValues.en;

  return (
    <>
      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${px}`, background: sc ? "rgba(5,5,5,0.94)" : "transparent", backdropFilter: sc ? "blur(32px)" : "none", WebkitBackdropFilter: sc ? "blur(32px)" : "none", transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: P.cream }}>
          <Mark size={17} />
          <span style={{ fontSize: 12.5, fontWeight: 500, letterSpacing: "-0.01em", fontFamily: "'Space Grotesk',sans-serif" }}>
            bridge-work<span style={{ color: P.rose, fontWeight: 300 }}>.ai</span>
          </span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["en","de"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ background: "none", border: "none", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.06em", cursor: "pointer", color: lang === l ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)", padding: "4px 5px", transition: "color 0.3s" }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ height: "100vh", display: "flex", alignItems: "center", padding: `0 ${px}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", zIndex: 0 }}>
          <BreathingGrid tiles={heroTiles} cols={4} tileSize={80} gap={28} dimLeft />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600 }}>
          <Rv delay={0.2}>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 400, fontSize: "clamp(1rem,1.6vw,1.15rem)", letterSpacing: "0.02em", color: "rgba(255,255,255,0.3)", marginBottom: 32 }}>
              {t("Buying AI is easy.", "KI kaufen ist einfach.")}
            </p>
          </Rv>
          <Rv delay={0.4}>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 300, fontSize: "clamp(2.4rem,6vw,5rem)", lineHeight: 0.96, letterSpacing: "-0.045em", margin: 0 }}>
              {lang === "de" ? (
                <><span style={{ color: "rgba(255,255,255,0.14)" }}>Aber</span> Wirkung entsteht,<br/><span style={{ color: "rgba(255,255,255,0.14)" }}>wenn Arbeit<br/>neu gedacht wird.</span></>
              ) : (
                <><span style={{ color: "rgba(255,255,255,0.14)" }}>But</span> impact begins<br/><span style={{ color: "rgba(255,255,255,0.14)" }}>when work<br/>is rethought.</span></>
              )}
            </h1>
          </Rv>
          <Rv delay={0.65}>
            <div style={{ display: "flex", gap: 2, margin: "44px 0", maxWidth: 56 }}>
              <div style={{ height: 1, flex: 2, background: P.teal, opacity: 0.4 }} />
              <div style={{ height: 1, flex: 1, background: P.purple, opacity: 0.25 }} />
              <div style={{ height: 1, flex: 0.4, background: P.rose, opacity: 0.4 }} />
            </div>
          </Rv>
          <Rv delay={0.75}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)" }}>
              Basel · {t("Switzerland","Schweiz")} · {t("Platform-agnostic","Plattformunabhängig")}
            </div>
          </Rv>
        </div>
        <ScrollDown />
      </section>

      {/* BELOW THE FOLD */}
      <div id="below">
        <Strip />

        {/* CAPABILITIES */}
        <section style={{ padding: `80px ${px} 60px`, position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Rv>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.08)", marginBottom: 40 }}>
                {t("Capabilities","Fähigkeiten")}
              </div>
            </Rv>
            {["Adoption Architecture", "Responsible Enablement", "Strategic Translation"].map((title, i) => (
              <CapabilityBand
                key={i}
                num={`0${i+1}`}
                title={title}
                tiles={capTiles[i]}
                values={vals[i]}
                delay={0.05 + i * 0.07}
                open={openCap === i}
                onToggle={() => setOpenCap(openCap === i ? null : i)}
              />
            ))}
          </div>
        </section>

        <Strip op={0.1} />

        {/* CONTACT */}
        <section id="contact" style={{ padding: `80px ${px} 72px`, position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Rv>
              <Mark size={20} />
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 300, fontSize: "clamp(1.8rem,4vw,3.2rem)", lineHeight: 0.95, letterSpacing: "-0.04em", margin: "24px 0" }}>
                {t("Ready?","Bereit?")}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["mailto:achim.imboden@bridge-work.ai","achim.imboden@bridge-work.ai"],
                  ["https://www.linkedin.com/in/achimimboden/","LinkedIn"],
                ].map(([href,label]) => (
                  <a key={href} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener" : undefined}
                    style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: "0.02em", color: "rgba(255,255,255,0.14)", textDecoration: "none", transition: "color 0.3s" }}
                    onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.14)"}
                  >{label}</a>
                ))}
              </div>
            </Rv>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "18px clamp(24px,6vw,72px)", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.01)", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Mark size={8} />
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.04)" }}>© 2026 bridge-work.ai</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[t("Imprint","Impressum"), t("Privacy","Datenschutz")].map(l => (
              <a key={l} href="#" style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.04)", textDecoration: "none", transition: "color 0.3s" }}
                onMouseEnter={e => e.target.style.color="rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.target.style.color="rgba(255,255,255,0.04)"}
              >{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
