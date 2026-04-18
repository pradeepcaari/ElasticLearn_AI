/**
 * ResultPage.jsx — Reveals the detected learning mode after the diagnostic.
 * Props:
 *   level      — "foundation" | "acceleration"
 *   gaps       — string[]  (detected knowledge gaps)
 *   onContinue — () => void  (navigate to LearningPage)
 */

import { GoldLine, MonoLabel } from "../components/Shared";
import ThemeToggle from "../components/ThemeToggle";

// ─── Mode config ──────────────────────────────────────────────────────────────
const MODE_CONFIG = {
  foundation: {
    icon:   "⬡",
    accent: "var(--green)",
    label:  "Foundation Mode",
    tagline: "Build from first principles",
    desc:   (gaps) =>
      `We detected gaps in ${gaps.join(" and ")}. I'll build your understanding step-by-step with intuitive analogies and prerequisite bridges before advancing.`,
    features: [
      "Simple, first-principles explanations",
      "Step-by-step prerequisite bridging",
      "Visual analogies for every concept",
      "Pace adapts as you strengthen weak areas",
    ],
  },
  acceleration: {
    icon:   "⚡",
    accent: "var(--gold)",
    label:  "Acceleration Mode",
    tagline: "Go beyond the curriculum",
    desc:   () =>
      "You've demonstrated strong foundational knowledge. I'll challenge you with advanced theory, real-world engineering scenarios, and research-level problems.",
    features: [
      "Deep theoretical & mathematical treatment",
      "Real-world engineering applications",
      "Research-level problem extensions",
      "Optimisation challenges beyond the syllabus",
    ],
  },
};

export default function ResultPage({ level, gaps, onContinue }) {
  const cfg      = MODE_CONFIG[level] || MODE_CONFIG.foundation;
  const isFound  = level === "foundation";
  const accent   = cfg.accent;

  return (
    <div className="noise-bg" style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      background: `radial-gradient(ellipse 55% 55% at 50% 40%,
                     ${isFound ? "rgba(46,204,138,0.07)" : "rgba(201,168,76,0.07)"} 0%,
                     transparent 65%),
                   radial-gradient(ellipse 70% 40% at 80% 80%, var(--page-bg-subtle) 0%, transparent 60%),
                   var(--page-bg)`,
      position: "relative",
    }}>
      <GoldLine />

      {/* ── Top Navigation/Header ── */}
      <div style={{
        position: "absolute", top: 20, right: 20, zIndex: 200,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <ThemeToggle />
      </div>

      <div style={{
        maxWidth: 560,
        width: "100%",
        textAlign: "center",
        animation: "fadeUp 0.65s ease both",
      }}>

        {/* ── Animated icon badge ── */}
        <div style={{
          width: 80, height: 80,
          borderRadius: "50%",
          background: `color-mix(in srgb, ${accent} 8%, transparent)`,
          border: `2px solid ${accent}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30,
          margin: "0 auto 28px",
          animation: "borderGlow 3s ease infinite",
          boxShadow: `0 0 40px color-mix(in srgb, ${accent} 12%, transparent)`,
        }}>
          {cfg.icon}
        </div>

        {/* ── Label / level ── */}
        <MonoLabel color={accent}>Your Learning Path</MonoLabel>

        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.2rem, 6vw, 3rem)",
          fontWeight: 600,
          color: "var(--cream-lt)",
          margin: "12px 0 6px",
          lineHeight: 1.1,
        }}>
          {cfg.label}
        </h2>

        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          fontStyle: "italic",
          color: accent,
          marginBottom: 20,
          opacity: 0.85,
        }}>
          {cfg.tagline}
        </p>

        <p style={{
          color: "var(--text-mid)",
          lineHeight: 1.75,
          marginBottom: 32,
          fontSize: "0.95rem",
          maxWidth: 440,
          margin: "0 auto 32px",
        }}>
          {cfg.desc(gaps)}
        </p>

        {/* ── Gap tags (foundation only) ── */}
        {gaps.length > 0 && (
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", marginBottom:32 }}>
            {gaps.map(g => (
              <span key={g} style={{
                padding: "5px 14px",
                borderRadius: 99,
                fontSize: "0.78rem",
                background: "rgba(224,82,82,0.08)",
                color: "var(--red)",
                border: "1px solid rgba(224,82,82,0.22)",
              }}>
                ⚑ Gap: {g}
              </span>
            ))}
          </div>
        )}

        {/* ── What to expect ── */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "24px 28px",
          marginBottom: 32,
          textAlign: "left",
        }}>
          <div style={{
            fontSize: "0.7rem",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            What to expect
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {cfg.features.map(f => (
              <div key={f} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ color: accent, fontSize:14, marginTop:1, flexShrink:0 }}>✓</span>
                <span style={{ fontSize:"0.88rem", color: "var(--text)", lineHeight:1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <button
          className="btn-primary"
          onClick={onContinue}
          style={{
            fontSize: "1rem",
            padding: "15px 52px",
          }}
        >
          Start Learning →
        </button>

        <p style={{ fontSize:"0.74rem", color:"var(--text-dim)", marginTop:16 }}>
          You can switch modes at any time from the learning view.
        </p>
      </div>
    </div>
  );
}
