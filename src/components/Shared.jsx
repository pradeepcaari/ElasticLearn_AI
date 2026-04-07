/**
 * Shared.jsx — Reusable atomic components.
 * Spinner, TypingIndicator, ModeBadge, AgentAvatar, TopNav.
 * Import individually — no barrel export needed.
 */

import { T } from "../styles/tokens";
import ThemeToggle from "./ThemeToggle";

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${T.border}`,
      borderTopColor: T.gold,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
export function TypingIndicator() {
  return (
    <div style={{ display:"flex", gap:4, alignItems:"center", padding:"12px 16px" }}>
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

// ─── Mode Badge ───────────────────────────────────────────────────────────────
export function ModeBadge({ mode }) {
  const isFound = mode === "foundation";
  return (
    <span className={`badge ${isFound ? "badge-foundation" : "badge-acceleration"}`}>
      <span style={{ fontSize: 8 }}>●</span>
      {isFound ? "Foundation Mode" : "Acceleration Mode"}
    </span>
  );
}

// ─── Agent Avatar ─────────────────────────────────────────────────────────────
export function AgentAvatar({ mode }) {
  const isFound = mode === "foundation";
  return (
    <div style={{
      width: 34, height: 34, flexShrink: 0,
      borderRadius: "50%",
      background: isFound ? "rgba(46,204,138,0.15)" : "rgba(201,168,76,0.15)",
      border: `1px solid ${isFound ? "rgba(46,204,138,0.35)" : "rgba(201,168,76,0.35)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      marginTop: 2,
    }}>
      <span style={{ fontSize: 14 }}>{isFound ? "⬡" : "⚡"}</span>
    </div>
  );
}

// ─── Brand Wordmark ───────────────────────────────────────────────────────────
export function BrandMark({ size = "1.35rem" }) {
  return (
    <span style={{ fontFamily:"var(--font-display)", fontSize: size, fontWeight:600, color: T.creamLt }}>
      Elastic<span style={{ color: T.gold, fontStyle:"italic" }}>Learn</span>
      <span style={{ color: T.textDim, fontSize:"0.55em", fontStyle:"normal", marginLeft:4, fontFamily:"var(--font-mono)", letterSpacing:"0.06em" }}>AI</span>
    </span>
  );
}

// ─── Top Navigation Bar ───────────────────────────────────────────────────────
// Used in LearningPage; accepts arbitrary right-side slot content
export function TopNav({ rightSlot, centerSlot }) {
  return (
    <nav style={{
      height: 60,
      borderBottom: `1px solid var(--border)`,
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 16,
      background: "var(--nav-bg)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      flexShrink: 0,
      zIndex: 100,
      position: "sticky",
      top: 0,
    }}>
      <BrandMark />
      {centerSlot && <div style={{ flex:1, display:"flex", justifyContent:"center" }}>{centerSlot}</div>}
      {!centerSlot && <div style={{ flex:1 }} />}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {rightSlot}
        <ThemeToggle />
      </div>
    </nav>
  );
}

// ─── Decorative Gold Divider Line ─────────────────────────────────────────────
export function GoldLine() {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 2,
      background: `linear-gradient(90deg, transparent 0%, ${T.gold} 40%, ${T.goldLt} 60%, transparent 100%)`,
      opacity: 0.55,
    }} />
  );
}

// ─── Section Mono Label ───────────────────────────────────────────────────────
export function MonoLabel({ children, color }) {
  return (
    <span style={{
      fontSize: "0.7rem",
      color: color || T.gold,
      fontFamily: "var(--font-mono)",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    }}>
      {children}
    </span>
  );
}

// ─── Pill Tag ─────────────────────────────────────────────────────────────────
export function Pill({ children }) {
  return (
    <span style={{
      padding: "5px 14px",
      borderRadius: 99,
      fontSize: "0.78rem",
      fontWeight: 400,
      color: T.textMid,
      border: `1px solid ${T.border}`,
      background: "rgba(17,34,64,0.5)",
    }}>
      {children}
    </span>
  );
}

// ─── Icon: Question Mark ──────────────────────────────────────────────────────
export function HelpIcon({ color, size = 16 }) {
  const c = color || T.gold;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke={c} strokeWidth="1.2"/>
      <path d="M6.5 6.5a1.5 1.5 0 112.12 1.37C8.3 8.1 8 8.4 8 9" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r="0.75" fill={c}/>
    </svg>
  );
}

// ─── Icon: Send Arrow ─────────────────────────────────────────────────────────
export function SendIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 8l10-5-3 5 3 5-10-5z" fill={color || T.navy}/>
    </svg>
  );
}
