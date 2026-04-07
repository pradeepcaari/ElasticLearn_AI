/**
 * ProgressSidebar.jsx — Right-side knowledge map panel inside LearningPage.
 * Shows detected gaps, subject proficiency bars, and session stats.
 *
 * API (future): GET /api/progress/:user_id
 *   Response: { topics: [{name, score}], session: {count, streak, minutes} }
 */

import { T } from "../styles/tokens";
import { ModeBadge } from "../components/Shared";

// ─── Mock proficiency data ────────────────────────────────────────────────────
// Replace with live data fetched from backend
const DEFAULT_TOPICS = [
  { name:"Mathematics",     score:72 },
  { name:"Circuit Theory",  score:48 },
  { name:"Digital Systems", score:85 },
  { name:"Programming",     score:60 },
  { name:"Electromagnetics",score:30 },
];

// ─── Score color helper ───────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 70) return T.green;
  if (s >= 50) return T.gold;
  return T.red;
}
function scoreBar(s) {
  if (s >= 70) return `linear-gradient(90deg, ${T.green}, rgba(46,204,138,0.65))`;
  if (s >= 50) return `linear-gradient(90deg, ${T.gold}, ${T.goldLt})`;
  return `linear-gradient(90deg, ${T.red}, rgba(224,82,82,0.65))`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProgressSidebar({ mode, gaps, topics = DEFAULT_TOPICS }) {
  return (
    <div style={{
      width: 262,
      borderLeft: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: "column",
      background: "rgba(9,18,34,0.72)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      flexShrink: 0,
      animation: "slideInLeft 0.38s ease both",
      overflowY: "auto",
    }}>

      {/* ── Header ── */}
      <div style={{ padding:"18px 18px 14px", borderBottom:`1px solid ${T.border}` }}>
        <div style={{
          fontSize:"0.68rem", color:T.gold, fontFamily:"var(--font-mono)",
          letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:8,
        }}>
          Knowledge Map
        </div>
        <ModeBadge mode={mode} />
      </div>

      {/* ── Detected gaps ── */}
      {gaps && gaps.length > 0 && (
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{
            fontSize:"0.68rem", color:T.red, fontWeight:500,
            marginBottom:10, textTransform:"uppercase", letterSpacing:"0.06em",
            display:"flex", alignItems:"center", gap:6,
          }}>
            <span>⚑</span> Detected Gaps
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {gaps.map(g => (
              <div key={g} style={{
                fontSize:"0.78rem", color:T.textMid,
                padding:"6px 10px",
                background:"rgba(224,82,82,0.07)",
                borderLeft:`2px solid ${T.red}`,
                borderRadius:"0 6px 6px 0",
                lineHeight:1.4,
              }}>
                {g}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Subject proficiency ── */}
      <div style={{ padding:"16px 18px", flex:1 }}>
        <div style={{
          fontSize:"0.68rem", color:T.textDim, fontFamily:"var(--font-mono)",
          textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:16,
        }}>
          Subject Proficiency
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {topics.map(t => (
            <div key={t.name}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, alignItems:"center" }}>
                <span style={{ fontSize:"0.8rem", color:T.text }}>{t.name}</span>
                <span style={{
                  fontSize:"0.72rem",
                  fontFamily:"var(--font-mono)",
                  color:scoreColor(t.score),
                  fontWeight:500,
                }}>
                  {t.score}%
                </span>
              </div>
              {/* Bar track */}
              <div style={{ height:3, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden" }}>
                <div style={{
                  height:"100%",
                  width:`${t.score}%`,
                  background:scoreBar(t.score),
                  borderRadius:99,
                  transition:"width 0.7s ease",
                }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{
        padding:"10px 18px",
        borderTop:`1px solid ${T.border}`,
        display:"flex", gap:14, flexWrap:"wrap",
      }}>
        {[
          { color:T.green, label:"Strong (≥70%)" },
          { color:T.gold,  label:"Fair (≥50%)" },
          { color:T.red,   label:"Gap (<50%)" },
        ].map(l => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:99, background:l.color }} />
            <span style={{ fontSize:"0.68rem", color:T.textDim }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* ── Session stats grid ── */}
      <div style={{
        padding:"14px 18px",
        borderTop:`1px solid ${T.border}`,
        display:"grid", gridTemplateColumns:"1fr 1fr",
        gap:8,
      }}>
        {[
          { label:"Topics Covered", value:"4" },
          { label:"Questions Asked", value:"12" },
          { label:"Learning Streak", value:"3 🔥" },
          { label:"Session Time",    value:"18m" },
        ].map(s => (
          <div key={s.label} style={{
            background:"rgba(17,34,64,0.55)",
            borderRadius:"var(--radius-sm)",
            border:`1px solid ${T.border}`,
            padding:"10px 12px",
          }}>
            <div style={{ fontSize:"0.65rem", color:T.textDim, marginBottom:5, lineHeight:1.3 }}>
              {s.label}
            </div>
            <div style={{
              fontSize:"1rem", fontWeight:500,
              color:T.creamLt, fontFamily:"var(--font-mono)",
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
