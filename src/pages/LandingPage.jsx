/**
 * LandingPage.jsx — Hero screen shown after login.
 * Props: onStart() — navigates to DiagnosticPage
 *        user      — { name, email } from auth
 */

import { GoldLine, MonoLabel, Pill, BrandMark } from "../components/Shared";
import ThemeToggle from "../components/ThemeToggle";

export default function LandingPage({ onStart, user }) {
  return (
    <div className="noise-bg star-bg" style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
      background: `radial-gradient(ellipse 80% 60% at 50% 20%, var(--page-bg-subtle) 0%, transparent 70%), var(--page-bg)`,
    }}>
      <GoldLine />

      {/* Theme Toggle — fixed top-right */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200 }}>
        <ThemeToggle />
      </div>

      {/* Top-right user chip */}
      {user && (
        <div style={{
          position: "absolute", top: 24, right: 28,
          display: "flex", alignItems: "center", gap: 10,
          animation: "fadeDown 0.5s ease both",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `linear-gradient(135deg, var(--navy-lt), rgba(201,168,76,0.13))`,
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.75rem", color: "var(--gold)", fontWeight: 600,
          }}>
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-mid)" }}>
            {user.name}
          </span>
        </div>
      )}

      {/* ── Hero ── */}
      <div style={{ animation: "fadeUp 0.65s ease both", textAlign: "center", maxWidth: 660 }}>
        {/* Event badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "7px 20px",
          border: "1px solid var(--border)",
          borderRadius: 99,
          marginBottom: 32,
          background: "rgba(201,168,76,0.05)",
          animation: "fadeUp 0.5s ease both",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="var(--gold)" strokeWidth="1.1"/>
            <path d="M3.5 6h5M6 3.5v5" stroke="var(--gold)" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <MonoLabel>Agentic AI Platform · Matrix Fusion 4.0</MonoLabel>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3rem, 8vw, 5.8rem)",
          fontWeight: 600,
          lineHeight: 1.03,
          color: "var(--cream-lt)",
          letterSpacing: "-0.02em",
          marginBottom: 20,
        }}>
          Elastic<span style={{ color: "var(--gold)", fontStyle: "italic" }}>Learn</span> AI
        </h1>

        {/* Sub-headline */}
        <p style={{
          fontSize: "clamp(1rem, 2vw, 1.22rem)",
          color: "var(--text-mid)",
          maxWidth: 520,
          lineHeight: 1.7,
          margin: "0 auto 44px",
          fontWeight: 300,
        }}>
          An agentic learning platform that diagnoses your knowledge gaps
          and adapts every explanation to your exact level — in real time.
        </p>

        {/* Feature pills */}
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:48 }}>
          {[
            "Diagnostic Assessment",
            "Foundation Mode",
            "Acceleration Mode",
            "Help Me Understand",
          ].map((f, i) => (
            <div key={f} style={{ animation: `fadeUp 0.6s ease both`, animationDelay: `${i * 0.08}s` }}>
              <Pill>{f}</Pill>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button
            className="btn-primary"
            onClick={onStart}
            style={{ fontSize:"1rem", padding:"15px 44px", animation:"fadeUp 0.7s 0.2s ease both", opacity:0, animationFillMode:"forwards" }}
          >
            Begin Diagnostic Assessment →
          </button>
        </div>

        {/* How it works — quick 3-step */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginTop: 72,
          maxWidth: 580,
          margin: "72px auto 0",
        }}>
          {[
            { step:"01", title:"Diagnose",  desc:"3 quick questions reveal your exact knowledge level" },
            { step:"02", title:"Adapt",     desc:"AI selects Foundation or Acceleration mode for you" },
            { step:"03", title:"Generate",  desc:"Every answer is crafted for your level in real time" },
          ].map((item, i) => (
            <div key={item.step} style={{
              padding: "20px 16px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              textAlign: "left",
              animation: `fadeUp 0.7s ease both`,
              animationDelay: `${0.35 + i * 0.1}s`,
              opacity: 0,
              animationFillMode: "forwards",
            }}>
              <span style={{
                fontFamily:"var(--font-mono)", fontSize:"0.65rem",
                color: "var(--gold)", letterSpacing:"0.1em", opacity:0.7,
              }}>{item.step}</span>
              <div style={{ fontWeight:500, color: "var(--cream-lt)", marginTop:8, marginBottom:5, fontSize:"0.9rem" }}>
                {item.title}
              </div>
              <div style={{ fontSize:"0.77rem", color: "var(--text-mid)", lineHeight:1.55 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack footer */}
      <div style={{
        position: "absolute", bottom: 28,
        display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center",
        animation: "fadeIn 1.4s ease both",
      }}>
        {["React","Flask / FastAPI","MongoDB","RAG + FAISS","CrewAI"].map(t => (
          <span key={t} style={{
            fontSize: "0.68rem",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
          }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
