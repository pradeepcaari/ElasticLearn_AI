/**
 * DiagnosticPage.jsx — Dynamic 4-Phase Agentic Diagnostic Assessment
 *
 * Phase 1 — Interest Selection: user picks 1-3 subjects
 * Phase 2 — AI Fetch:          POST /api/diagnostic/questions (mock active)
 * Phase 3 — Hybrid Quiz:       MCQ chips OR open-ended textarea per question
 * Phase 4 — Polling:           POST /api/diagnostic/submit → poll /api/jobs/<id> (mock active)
 *
 * When backend is ready: uncomment the fetch blocks in fetchQuestions() and submitAnswers().
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, GoldLine, MonoLabel } from "../components/Shared";

// ─── Interest chips available for selection ───────────────────────────────────
const INTEREST_CHIPS = [
  "Calculus", "Linear Algebra", "Digital Systems", "Algorithms & DSA",
  "Machine Learning", "Physics", "Thermodynamics", "Control Systems",
  "Computer Networks", "Signal Processing",
];

// ─── Mock questions returned by the AI (one per interest type) ────────────────
const MOCK_QUESTIONS = [
  {
    id: 1, type: "mcq",
    text: "What does a derivative fundamentally represent?",
    options: ["Area under a curve", "Rate of change of a function", "A polynomial root", "An integral approximation"],
  },
  {
    id: 2, type: "open",
    text: "Describe in your own words what happens to a signal when it passes through a low-pass filter.",
  },
  {
    id: 3, type: "mcq",
    text: "Which data structure uses FIFO (First-In, First-Out) ordering?",
    options: ["Stack", "Queue", "Heap", "Binary Tree"],
  },
  {
    id: 4, type: "open",
    text: "Explain the difference between supervised and unsupervised learning with a brief example.",
  },
  {
    id: 5, type: "mcq",
    text: "In a digital circuit, a flip-flop is primarily used to:",
    options: ["Amplify analog signals", "Store one bit of state", "Perform addition", "Generate clock signals"],
  },
  {
    id: 6, type: "mcq",
    text: "What is the time complexity of binary search on a sorted array of n elements?",
    options: ["O(n)", "O(n²)", "O(log n)", "O(n log n)"],
  },
];

// ─── Polling step labels ──────────────────────────────────────────────────────
const POLL_STEPS = [
  "Receiving your answers…",
  "Evaluating knowledge level…",
  "Designing your learning path…",
];

// ─── Utility — auth headers ───────────────────────────────────────────────────
function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("el_token") || ""}`,
  };
}

// ─── Interest Chip ────────────────────────────────────────────────────────────
function InterestChip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 18px",
        borderRadius: 99,
        border: `1.5px solid ${selected ? "var(--gold)" : "var(--border)"}`,
        background: selected ? "var(--gold-dim)" : "var(--surface)",
        color: selected ? "var(--gold-lt)" : "var(--text-mid)",
        fontSize: "0.85rem",
        fontFamily: "var(--font-body)",
        cursor: "pointer",
        transition: "var(--transition)",
        boxShadow: selected ? "0 0 14px rgba(201,168,76,0.18)" : "none",
        fontWeight: selected ? 500 : 400,
        userSelect: "none",
      }}
    >
      {label}
    </button>
  );
}

// ─── Option Button (MCQ) ──────────────────────────────────────────────────────
function OptionButton({ label, text, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? "var(--gold-dim)" : "var(--surface)",
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
        boxShadow: selected ? "0 0 12px rgba(201,168,76,0.12)" : "none",
      }}
    >
      <span style={{
        width: 26, height: 26, flexShrink: 0,
        border: `1.5px solid ${selected ? "var(--gold)" : "var(--text-dim)"}`,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.7rem",
        color: selected ? "var(--gold)" : "var(--text-dim)",
        fontWeight: 600,
        background: selected ? "rgba(201,168,76,0.12)" : "transparent",
        transition: "var(--transition)",
      }}>
        {selected ? "✓" : label}
      </span>
      {text}
    </button>
  );
}

// ─── Shimmer Loading Card ─────────────────────────────────────────────────────
function ShimmerCard({ width = "100%", height = 20, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: 8,
      background: "linear-gradient(90deg, var(--surface) 25%, rgba(201,168,76,0.06) 50%, var(--surface) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s ease infinite",
      ...style,
    }} />
  );
}

// ─── Phase 1: Interest Selection ──────────────────────────────────────────────
function PhaseInterests({ onNext }) {
  const [selected, setSelected] = useState([]);
  const [custom, setCustom]     = useState("");

  const toggle = (chip) =>
    setSelected(s =>
      s.includes(chip) ? s.filter(c => c !== chip) : s.length < 3 ? [...s, chip] : s
    );

  const handleBegin = () => {
    const interests = [...selected, ...(custom.trim() ? [custom.trim()] : [])];
    if (interests.length === 0) return;
    onNext(interests);
  };

  const ready = selected.length > 0 || custom.trim().length > 0;

  return (
    <div style={{ width: "100%", maxWidth: 640, animation: "fadeUp 0.5s ease both" }}>
      <GoldLine />
      <MonoLabel>Diagnostic Assessment</MonoLabel>
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(1.7rem,4vw,2.2rem)",
        fontWeight: 600,
        color: "var(--cream-lt)",
        margin: "8px 0 8px",
      }}>
        What are you studying?
      </h2>
      <p style={{ color: "var(--text-mid)", fontSize: "0.87rem", lineHeight: 1.6, marginBottom: 32 }}>
        Pick up to 3 subjects · AI will frame 5–10 personalised questions for you
      </p>

      {/* Chip Grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        {INTEREST_CHIPS.map(chip => (
          <InterestChip
            key={chip}
            label={chip}
            selected={selected.includes(chip)}
            onClick={() => toggle(chip)}
          />
        ))}
      </div>

      {/* Custom topic input */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: "0.78rem", color: "var(--text-dim)", display: "block", marginBottom: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
          OR TYPE A CUSTOM TOPIC
        </label>
        <input
          type="text"
          value={custom}
          maxLength={60}
          placeholder="e.g., Electromagnetic Induction…"
          onChange={e => setCustom(e.target.value)}
          style={{
            width: "100%",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 16px",
            color: "var(--text)",
            fontFamily: "var(--font-body)",
            fontSize: "0.92rem",
            outline: "none",
            transition: "var(--transition)",
            boxSizing: "border-box",
          }}
          onFocus={e => { e.target.style.borderColor = "var(--gold)"; e.target.style.boxShadow = "0 0 0 3px var(--gold-dim)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {/* Selection count hint */}
      {selected.length > 0 && (
        <p style={{ fontSize: "0.78rem", color: "var(--gold)", fontFamily: "var(--font-mono)", marginBottom: 16 }}>
          {selected.length}/3 selected: {selected.join(", ")}
        </p>
      )}

      <button
        className="btn-primary"
        onClick={handleBegin}
        disabled={!ready}
        style={{ width: "100%", padding: "14px", fontSize: "0.95rem" }}
      >
        Begin Assessment →
      </button>
    </div>
  );
}

// ─── Phase 2: Fetching Questions (Loading) ────────────────────────────────────
function PhaseFetching({ interests, onQuestionsReady }) {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const fetchQuestions = async () => {
      try {
        // ── Fetch AI-generated questions from backend ──
        const res  = await fetch("/api/diagnostic/questions", {
          method:  "POST",
          headers: getAuthHeaders(),
          body:    JSON.stringify({ interests }),
        });
        const data = await res.json();
        // Backend returns the question array (may be a raw JSON string from the LLM)
        let questions;
        try {
          questions = typeof data.questions === "string"
            ? JSON.parse(data.questions)
            : data.questions;
        } catch {
          console.warn("LLM returned non-JSON questions — falling back to mock.");
          questions = MOCK_QUESTIONS;
        }
        onQuestionsReady(questions && questions.length ? questions : MOCK_QUESTIONS);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        onQuestionsReady(MOCK_QUESTIONS);
      }
    };
    fetchQuestions();
  }, [interests, onQuestionsReady]);

  return (
    <div style={{ width: "100%", maxWidth: 540, animation: "fadeUp 0.5s ease both", textAlign: "center" }}>
      <GoldLine />
      <div style={{ marginBottom: 32 }}>
        <Spinner size={40} />
      </div>
      <h3 style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.5rem",
        fontWeight: 500,
        color: "var(--cream-lt)",
        marginBottom: 10,
      }}>
        Framing your questions…
      </h3>
      <p style={{ color: "var(--text-mid)", fontSize: "0.87rem", marginBottom: 32 }}>
        Our AI is crafting personalised questions for <strong style={{ color: "var(--gold-lt)" }}>{interests.join(", ")}</strong>
      </p>
      {/* Shimmer skeleton */}
      <div className="card" style={{ padding: "28px 24px", textAlign: "left" }}>
        <ShimmerCard height={14} width="55%" style={{ marginBottom: 20 }} />
        <ShimmerCard height={11} width="100%" style={{ marginBottom: 10 }} />
        <ShimmerCard height={11} width="90%" style={{ marginBottom: 10 }} />
        <ShimmerCard height={11} width="75%" style={{ marginBottom: 20 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4].map(i => (
            <ShimmerCard key={i} height={44} width="100%" />
          ))}
        </div>
      </div>
      {/* Shimmer animation keyframe injected once */}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

// ─── Phase 3: Hybrid Quiz ─────────────────────────────────────────────────────
function PhaseQuiz({ questions, onSubmit }) {
  const [current,  setCurrent]  = useState(0);
  const [answers,  setAnswers]  = useState({});    // { [id]: { type, value } }
  const [textVal,  setTextVal]  = useState("");
  const textRef = useRef(null);

  const q       = questions[current];
  const total   = questions.length;
  const isMCQ   = q.type === "mcq" && Array.isArray(q.options) && q.options.length > 0;
  const answer  = answers[q.id];
  const hasAns  = isMCQ ? answer !== undefined : (textVal.trim().length > 2);
  const isLast  = current === total - 1;

  // Auto-resize textarea
  useEffect(() => {
    if (!isMCQ && textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height = textRef.current.scrollHeight + "px";
    }
  }, [textVal, isMCQ]);

  // Restore textarea value when navigating back (stored answer)
  useEffect(() => {
    if (!isMCQ) {
      setTextVal(answers[q.id]?.value ?? "");
    }
  }, [q.id, isMCQ]);

  const handleNext = () => {
    // Save current answer
    const saved = isMCQ
      ? { type: "mcq", question_id: q.id, selected_index: answer }
      : { type: "open", question_id: q.id, text_answer: textVal.trim() };

    const newAnswers = { ...answers, [q.id]: saved };
    setAnswers(newAnswers);
    setTextVal("");

    if (!isLast) {
      setCurrent(c => c + 1);
    } else {
      onSubmit(Object.values(newAnswers));
    }
  };

  const progress = ((current + 1) / total) * 100;

  return (
    <div style={{ width: "100%", maxWidth: 640, animation: "fadeUp 0.4s ease both" }}>
      <GoldLine />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <MonoLabel>Diagnostic Assessment</MonoLabel>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem,4vw,2rem)",
          fontWeight: 600,
          color: "var(--cream-lt)",
          margin: "8px 0 6px",
        }}>
          Let's understand where you are.
        </h2>
        <p style={{ color: "var(--text-mid)", fontSize: "0.85rem" }}>
          No wrong answers · Your responses personalise your entire learning path
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Question {current + 1} of {total}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--gold)", fontFamily: "var(--font-mono)" }}>
            {isMCQ ? "MCQ" : "Open-ended"}
          </span>
        </div>
        <div style={{ height: 3, background: "rgba(128,128,128,0.15)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: "linear-gradient(90deg, var(--gold), var(--gold-lt))",
            borderRadius: 99, transition: "width 0.4s ease",
            boxShadow: "0 0 10px rgba(201,168,76,0.4)",
          }} />
        </div>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              width: i === current ? 22 : 8, height: 8, borderRadius: 99,
              background: i < current ? "var(--green)"
                        : i === current ? "var(--gold)"
                        : "rgba(128,128,128,0.15)",
              transition: "all 0.35s ease",
            }} />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="card" key={q.id} style={{ padding: "32px 28px", marginBottom: 20, animation: "fadeIn 0.3s ease both" }}>
        <p style={{ fontSize: "1.1rem", fontWeight: 400, lineHeight: 1.65, color: "var(--cream-lt)", marginBottom: 28 }}>
          {q.text}
        </p>

        {isMCQ ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => (
              <OptionButton
                key={i}
                label={String.fromCharCode(65 + i)}
                text={opt}
                selected={answer === i}
                onClick={() => setAnswers(a => ({ ...a, [q.id]: i }))}
              />
            ))}
          </div>
        ) : (
          <div>
            <textarea
              ref={textRef}
              value={textVal}
              onChange={e => setTextVal(e.target.value)}
              placeholder="Type your answer here… (min. 3 characters)"
              rows={4}
              style={{
                width: "100%",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "14px 16px",
                color: "var(--text)",
                fontFamily: "var(--font-body)",
                fontSize: "0.92rem",
                lineHeight: 1.6,
                outline: "none",
                resize: "none",
                overflow: "hidden",
                transition: "var(--transition)",
                boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--gold)"; e.target.style.boxShadow = "0 0 0 3px var(--gold-dim)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
            />
            <p style={{ textAlign: "right", fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
              {textVal.length} chars
            </p>
          </div>
        )}
      </div>

      <button
        className="btn-primary"
        onClick={handleNext}
        disabled={!hasAns}
        style={{ width: "100%", padding: "14px", fontSize: "0.95rem" }}
      >
        {isLast ? "Submit Answers →" : "Next Question →"}
      </button>

      <p style={{ textAlign: "center", marginTop: 12, fontSize: "0.74rem", color: "var(--text-dim)" }}>
        {isMCQ ? "Select an option to continue" : "Write your response to continue"}
      </p>
    </div>
  );
}

// ─── Phase 4: Polling / Processing ───────────────────────────────────────────
function PhasePolling({ interests, questions, answers, onComplete }) {
  const [pollStep, setPollStep] = useState(0);   // 0 = submitted, 1 = evaluating, 2 = designing
  const [error,    setError]    = useState(null);
  const navigate  = useNavigate();
  const called    = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const run = async () => {
      try {
        // ── Submit answers and poll for result ──
        const submitRes = await fetch("/api/diagnostic/submit", {
          method:  "POST",
          headers: getAuthHeaders(),
          body:    JSON.stringify({ interests, questions, answers }),
        });
        const submitData = await submitRes.json();
        if (!submitRes.ok) throw new Error(submitData.msg || "Submission failed");
        const jobId = submitData.job_id;

        // Poll every 2s until COMPLETED or FAILED
        let result = null;
        while (!result) {
          await new Promise(r => setTimeout(r, 2000));
          setPollStep(prev => Math.min(prev + 1, 2));
          const pollRes  = await fetch(`/api/jobs/${jobId}`, { headers: getAuthHeaders() });
          const pollData = await pollRes.json();
          if (pollData.status === "COMPLETED") result = pollData.result;
          else if (pollData.status === "FAILED") throw new Error("Job failed on server");
        }
        const parsed = typeof result === "string" ? JSON.parse(result) : result;
        onComplete(parsed.level, parsed.gaps ?? []);
        navigate("/result");
      } catch (err) {
        setError(err.message || "Something went wrong. Please try again.");
      }
    };
    run();
  }, [interests, questions, answers, onComplete, navigate]);

  if (error) {
    const isAuthError = error.toLowerCase().includes("token") || error.toLowerCase().includes("auth") || error.toLowerCase().includes("unauthorized");

    return (
      <div style={{ width: "100%", maxWidth: 480, textAlign: "center", animation: "fadeUp 0.4s ease both" }}>
        <GoldLine />
        <div style={{
          background: "rgba(220,53,69,0.06)",
          border: "1px solid rgba(220,53,69,0.25)",
          borderRadius: "var(--radius)",
          padding: "32px 28px",
          marginTop: 40,
        }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ color: "var(--cream-lt)", fontFamily: "var(--font-display)", marginBottom: 8 }}>
            Something went wrong
          </h3>
          <p style={{ color: "var(--text-mid)", fontSize: "0.87rem", marginBottom: 24 }}>
            {error}
          </p>
          {isAuthError ? (
            <button className="btn-primary" onClick={() => { localStorage.removeItem("el_token"); navigate("/login"); }}>
              Log In
            </button>
          ) : (
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 480, animation: "fadeUp 0.5s ease both" }}>
      <GoldLine />
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <Spinner size={44} />
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem",
          fontWeight: 500,
          color: "var(--cream-lt)",
          marginTop: 20,
          marginBottom: 8,
        }}>
          Processing your results…
        </h3>
        <p style={{ color: "var(--text-mid)", fontSize: "0.85rem" }}>
          Our AI agents are evaluating your responses and designing your curriculum.
        </p>
      </div>

      {/* Step-by-step progress */}
      <div className="card" style={{ padding: "28px 24px" }}>
        {POLL_STEPS.map((label, i) => {
          const done    = i < pollStep;
          const active  = i === pollStep;
          const pending = i > pollStep;
          return (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 0",
              borderBottom: i < POLL_STEPS.length - 1 ? "1px solid var(--border)" : "none",
              opacity: pending ? 0.4 : 1,
              transition: "opacity 0.4s ease",
            }}>
              {/* Icon */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                border: `1.5px solid ${done ? "var(--green)" : active ? "var(--gold)" : "var(--border)"}`,
                background: done ? "rgba(72,199,116,0.08)" : active ? "var(--gold-dim)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem",
                transition: "all 0.4s ease",
              }}>
                {done ? "✓" : active ? <Spinner size={14} /> : "○"}
              </div>
              {/* Label */}
              <span style={{
                fontSize: "0.9rem",
                color: done ? "var(--green)" : active ? "var(--gold-lt)" : "var(--text-dim)",
                fontFamily: done || active ? "var(--font-body)" : "var(--font-body)",
                fontWeight: active ? 500 : 400,
                transition: "color 0.4s ease",
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main DiagnosticPage ──────────────────────────────────────────────────────
export default function DiagnosticPage({ onComplete }) {
  // phase: "interests" | "fetching" | "quiz" | "polling"
  const [phase,     setPhase]     = useState("interests");
  const [interests, setInterests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState([]);

  const handleInterestsDone = useCallback((selected) => {
    setInterests(selected);
    setPhase("fetching");
  }, []);

  const handleQuestionsReady = useCallback((qs) => {
    setQuestions(qs);
    setPhase("quiz");
  }, []);

  const handleQuizSubmit = useCallback((finalAnswers) => {
    setAnswers(finalAnswers);
    setPhase("polling");
  }, []);

  return (
    <div
      className="noise-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px 60px",
        background: `radial-gradient(ellipse 60% 50% at 75% 80%, var(--page-bg-subtle) 0%, transparent 60%),
                     radial-gradient(ellipse 40% 40% at 20% 20%, rgba(201,168,76,0.04) 0%, transparent 60%),
                     var(--page-bg)`,
        position: "relative",
      }}
    >
      {phase === "interests" && (
        <PhaseInterests onNext={handleInterestsDone} />
      )}
      {phase === "fetching" && (
        <PhaseFetching interests={interests} onQuestionsReady={handleQuestionsReady} />
      )}
      {phase === "quiz" && (
        <PhaseQuiz questions={questions} onSubmit={handleQuizSubmit} />
      )}
      {phase === "polling" && (
        <PhasePolling
          interests={interests}
          questions={questions}
          answers={answers}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}
