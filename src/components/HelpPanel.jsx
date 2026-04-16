/**
 * HelpPanel.jsx — Slide-in drawer that re-explains the current topic
 *                 at a simplified level.
 *
 * API: POST /api/learn/help
 *      Body:     { topic: string, mode: string }
 *      Response: { simplified_content: string }
 */

import { useState, useEffect } from "react";
import { Spinner, HelpIcon } from "../components/Shared";

// ─── Mock response used until backend is ready ─────────────────────────────────
const MOCK_HELP = `Let me simplify this for you.

**Core Idea in Plain English:**

Imagine you have a garden hose. The water pressure from your tap is *Voltage*, the water flowing out is *Current*, and a kink in the hose is *Resistance*.

**Visual Flow:**
  [Battery] → voltage pushes → [Resistor] → current flows → [LED lights up]

**Remember it with this:**
- More pressure (Voltage) = more flow (Current)
- More kinks (Resistance) = less flow (Current)

**The one equation:**
  V = I × R

Does this click? Ask me to go even more basic, or try a quick practice problem!`;

// ─── Simple markdown renderer (bold, code, blank lines) ──────────────────────
function SimpleMarkdown({ text }) {
  return (
    <div style={{ fontSize:"0.9rem", lineHeight:1.8, color:"var(--text)" }}>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("```")) return <div key={i} style={{ height:4 }} />;
        if (line.startsWith("  ") || line.startsWith("\t")) {
          return (
            <code key={i} style={{
              display:"block",
              fontFamily:"var(--font-mono)", fontSize:"0.8rem",
              background:"rgba(201,168,76,0.07)", color:"var(--gold)",
              padding:"8px 14px", borderRadius:6, margin:"6px 0",
              borderLeft:"2px solid var(--gold)",
            }}>
              {line.trim()}
            </code>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <strong key={i} style={{ color:"var(--cream-lt)", fontSize:"0.95rem", display:"block", marginTop:14, marginBottom:4 }}>
              {line.slice(2,-2)}
            </strong>
          );
        }
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <div key={i} style={{ marginBottom: line === "" ? 10 : 2 }}>
            {parts.map((p, j) => {
              if (p.startsWith("**") && p.endsWith("**"))
                return <strong key={j} style={{ color:"var(--cream-lt)" }}>{p.slice(2,-2)}</strong>;
              if (p.startsWith("`") && p.endsWith("`"))
                return <code key={j} style={{ fontFamily:"var(--font-mono)", fontSize:"0.82em", color:"var(--gold)", background:"rgba(201,168,76,0.09)", padding:"1px 5px", borderRadius:4 }}>{p.slice(1,-1)}</code>;
              return <span key={j}>{p}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Help Panel ───────────────────────────────────────────────────────────────
export default function HelpPanel({ topic, mode, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // ── Uncomment when backend ready ──
        // const res  = await fetch("/api/learn/help", {
        //   method:  "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body:    JSON.stringify({ topic, mode }),
        // });
        // const data = await res.json();
        // if (!cancelled) setContent(data.simplified_content);
        await new Promise(r => setTimeout(r, 1400));
        if (!cancelled) setContent(MOCK_HELP);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [topic, mode]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position:"fixed", inset:0,
          background:"rgba(0,0,0,0.52)",
          backdropFilter:"blur(5px)",
          WebkitBackdropFilter:"blur(5px)",
          zIndex:200,
          animation:"fadeIn 0.22s ease both",
        }}
      />

      {/* ── Drawer panel ── */}
      <div style={{
        position:"fixed", right:0, top:0, bottom:0,
        width:"min(430px, 93vw)",
        zIndex:201,
        display:"flex", flexDirection:"column",
        animation:"slideInLeft 0.3s cubic-bezier(0.4,0,0.2,1) both",
        background:"var(--surface)",
        backdropFilter:"blur(28px)",
        WebkitBackdropFilter:"blur(28px)",
        borderLeft:"1px solid var(--border)",
        borderRadius:"20px 0 0 20px",
      }}>

        {/* Drawer header */}
        <div style={{
          padding:"20px 24px",
          borderBottom:"1px solid var(--border)",
          display:"flex", alignItems:"center", gap:14,
          background:"rgba(201,168,76,0.02)",
        }}>
          <div style={{
            width:38, height:38,
            borderRadius:"50%",
            background:"rgba(201,168,76,0.1)",
            border:`1px solid rgba(201,168,76,0.28)`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <HelpIcon />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:500, fontSize:"0.95rem", color:"var(--cream-lt)" }}>
              Help Me Understand
            </div>
            {topic && (
              <div style={{
                fontSize:"0.73rem", color:"var(--text-mid)", marginTop:2,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
              }}>
                Re-explaining: "{topic.slice(0,44)}{topic.length > 44 ? "…" : ""}"
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background:"var(--surface-hover)", border:"1px solid var(--border)",
              borderRadius:"50%", width:32, height:32,
              color:"var(--text-dim)", cursor:"pointer",
              fontSize:18, lineHeight:1,
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"var(--transition)",
              flexShrink:0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(224,82,82,0.12)"; e.currentTarget.style.color="var(--red)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="var(--surface-hover)"; e.currentTarget.style.color="var(--text-dim)"; }}
          >
            ×
          </button>
        </div>

        {/* Mode badge strip */}
        <div style={{
          padding:"10px 24px",
          borderBottom:"1px solid var(--border)",
          display:"flex", alignItems:"center", gap:8,
          fontSize:"0.72rem", color:"var(--text-dim)",
        }}>
          <span style={{ color:"var(--text-dim)" }}>Simplifying for</span>
          <span className={`badge badge-${mode}`} style={{ fontSize:"0.65rem" }}>
            <span style={{ fontSize:7 }}>●</span>
            {mode === "foundation" ? "Foundation Mode" : "Acceleration Mode"}
          </span>
        </div>

        {/* Content area */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px" }}>
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:18, paddingTop:48 }}>
              <Spinner size={36} />
              <p style={{ color:"var(--text-mid)", fontSize:"0.85rem" }}>Re-interpreting this for you…</p>
              <div style={{
                width:"100%", height:3, borderRadius:99,
                background:"var(--border)",
                overflow:"hidden",
              }}>
                <div style={{
                  height:"100%",
                  background:`linear-gradient(90deg, transparent, var(--gold), transparent)`,
                  backgroundSize:"200% 100%",
                  animation:"shimmer 1.6s ease infinite",
                  backgroundPosition:"-200px 0",
                }}/>
              </div>
            </div>
          ) : (
            <SimpleMarkdown text={content || ""} />
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          padding:"16px 24px",
          borderTop:"1px solid var(--border)",
          display:"flex", gap:10,
          background:"var(--surface)",
        }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex:1, fontSize:"0.82rem" }}>
            Got it, thanks
          </button>
          <button className="btn-primary" onClick={onClose} style={{ flex:1, fontSize:"0.82rem" }}>
            Continue Learning →
          </button>
        </div>
      </div>
    </>
  );
}
