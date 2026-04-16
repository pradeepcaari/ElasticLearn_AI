/**
 * DiagnosticPage.jsx — 3-question MCQ diagnostic quiz.
 * Detects knowledge level → calls onComplete(level, gaps).
 *
 * API: POST /api/diagnostic/submit
 *      Body:     { answers: [{ question_id: int, selected_index: int }] }
 *      Response: { level: "foundation"|"acceleration", gaps: string[], score: int }
 */

import { useState, useCallback } from "react";
import { Spinner, GoldLine, MonoLabel } from "../components/Shared";
import ThemeToggle from "../components/ThemeToggle";

// ─── Question Bank ────────────────────────────────────────────────────────────
// Replace / extend with questions fetched from GET /api/diagnostic/questions
const QUESTIONS = [
  {
    id: 1,
    question: "What is the purpose of a derivative in calculus?",
    options: [
      "It finds the area under a curve",
      "It measures the rate of change of a function",
      "It solves differential equations directly",
      "It computes the integral of a function",
    ],
    correct: 1,
    topic: "Mathematics",
  },
  {
    id: 2,
    question: "In digital circuits, what does a flip-flop primarily store?",
    options: [
      "Analog voltage levels",
      "One bit of state (0 or 1)",
      "Multi-byte data directly",
      "Clock frequency values",
    ],
    correct: 1,
    topic: "Digital Electronics",
  },
  {
    id: 3,
    question: "Which sorting algorithm has an average time complexity of O(n log n)?",
    options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"],
    correct: 2,
    topic: "Data Structures & Algorithms",
  },
];

// ─── Single Option Button ─────────────────────────────────────────────────────
function OptionButton({ label, text, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? "rgba(201,168,76,0.1)" : "var(--surface)",
        border: `1px solid ${selected ? "var(--gold)" : "var(--border)"}`,
        borderRadius: "var(--radius-sm)",
        padding: "14px 18px",
        textAlign: "left",
        color: selected ? "var(--gold-lt)" : "var(--text)",
        fontFamily: "var(--font-body)",
        fontSize: "0.92rem",
        cursor: "pointer",
        transition: "var(--transition)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
      }}
    >
      {/* Letter circle */}
      <span style={{
        width: 24, height: 24, flexShrink: 0,
        border: `1.5px solid ${selected ? "var(--gold)" : "var(--text-dim)"}`,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.68rem",
        color: selected ? "var(--gold)" : "var(--text-dim)",
        fontWeight: 500,
        background: selected ? "rgba(201,168,76,0.12)" : "transparent",
        transition: "var(--transition)",
      }}>
        {selected ? "✓" : label}
      </span>
      {text}
    </button>
  );
}

// ─── Main Diagnostic Page ─────────────────────────────────────────────────────
export default function DiagnosticPage({ onComplete }) {
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers,  setAnswers]  = useState([]);
  const [loading,  setLoading]  = useState(false);

  const q        = QUESTIONS[current];
  const total    = QUESTIONS.length;
  const progress = ((current) / total) * 100 + (100 / total);

  const handleNext = useCallback(async () => {
    if (selected === null) return;

    const newAnswers = [...answers, { question_id: q.id, selected_index: selected }];
    setAnswers(newAnswers);

    if (current < total - 1) {
      // Move to next question
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      // Last question — submit
      setLoading(true);
      try {
        // ── Uncomment when backend is ready ──
        // const res  = await fetch("/api/diagnostic/submit", {
        //   method:  "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body:    JSON.stringify({ answers: newAnswers }),
        // });
        // const data = await res.json();
        // onComplete(data.level, data.gaps);

        // ── Mock scoring ──
        await new Promise(r => setTimeout(r, 1800));
        const correct = newAnswers.filter(
          (a, i) => a.selected_index === QUESTIONS[i].correct
        ).length;
        const level = correct >= 2 ? "acceleration" : "foundation";
        const gaps  = correct < 2 ? ["Calculus fundamentals", "Circuit analysis basics"] : [];
        onComplete(level, gaps);
      } catch {
        onComplete("foundation", []);
      } finally {
        setLoading(false);
      }
    }
  }, [selected, current, answers, q, total, onComplete]);

  return (
    <div className="noise-bg" style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px 60px",
      background: `radial-gradient(ellipse 60% 50% at 75% 80%, var(--page-bg-subtle) 0%, transparent 60%),
                   radial-gradient(ellipse 40% 40% at 20% 20%, rgba(201,168,76,0.04) 0%, transparent 60%),
                   var(--page-bg)`,
      position: "relative",
    }}>
      <GoldLine />

      {/* Theme Toggle */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200 }}>
        <ThemeToggle />
      </div>

      <div style={{ width:"100%", maxWidth:640, animation:"fadeUp 0.55s ease both" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom:32 }}>
          <MonoLabel>Diagnostic Assessment</MonoLabel>
          <h2 style={{
            fontFamily:"var(--font-display)",
            fontSize:"clamp(1.7rem, 4vw, 2.2rem)",
            fontWeight:600,
            color:"var(--cream-lt)",
            marginTop:8,
            marginBottom:6,
          }}>
            Let's understand where you are.
          </h2>
          <p style={{ color:"var(--text-mid)", fontSize:"0.87rem", lineHeight:1.6 }}>
            {total} quick questions · No wrong answers · Personalises your entire learning path
          </p>
        </div>

        {/* ── Progress ── */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:"0.75rem", color:"var(--text-dim)" }}>
              Question {current + 1} of {total}
            </span>
            <span style={{ fontSize:"0.75rem", color:"var(--gold)", fontFamily:"var(--font-mono)" }}>
              {q.topic}
            </span>
          </div>
          {/* Track */}
          <div style={{ height:3, background:"rgba(128,128,128,0.15)", borderRadius:99, overflow:"hidden" }}>
            <div style={{
              height:"100%",
              width:`${progress}%`,
              background:`linear-gradient(90deg, var(--gold), var(--gold-lt))`,
              borderRadius:99,
              transition:"width 0.4s ease",
              boxShadow:`0 0 10px rgba(201,168,76,0.4)`,
            }}/>
          </div>
          {/* Step dots */}
          <div style={{ display:"flex", gap:6, marginTop:10 }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{
                width: i === current ? 22 : 8,
                height:8,
                borderRadius:99,
                background: i < current ? "var(--green)" :
                            i === current ? "var(--gold)" :
                            "rgba(128,128,128,0.15)",
                transition:"all 0.35s ease",
              }}/>
            ))}
          </div>
        </div>

        {/* ── Question card ── */}
        <div
          className="card"
          key={q.id}
          style={{ padding:"32px 28px", marginBottom:20, animation:"fadeIn 0.35s ease both" }}
        >
          <p style={{
            fontSize:"1.12rem",
            fontWeight:400,
            lineHeight:1.65,
            color:"var(--cream-lt)",
            marginBottom:28,
          }}>
            {q.question}
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
            {q.options.map((opt, i) => (
              <OptionButton
                key={i}
                label={String.fromCharCode(65 + i)}
                text={opt}
                selected={selected === i}
                onClick={() => setSelected(i)}
              />
            ))}
          </div>
        </div>

        {/* ── Next / Submit button ── */}
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={selected === null || loading}
          style={{ width:"100%", padding:"14px", fontSize:"0.95rem" }}
        >
          {loading ? (
            <><Spinner size={18} /> Analysing your responses…</>
          ) : current < total - 1 ? (
            "Next Question →"
          ) : (
            "Get My Learning Path →"
          )}
        </button>

        {/* Skip hint */}
        <p style={{ textAlign:"center", marginTop:14, fontSize:"0.75rem", color:"var(--text-dim)" }}>
          Select an option to continue
        </p>
      </div>
    </div>
  );
}
