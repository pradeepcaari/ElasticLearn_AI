/**
 * LearningPage.jsx — Main adaptive learning chat interface.
 * Hosts chat area, mode toggle, suggestions, and sidebars.
 *
 * API: POST /api/learn/query
 *      Body:     { topic: string, mode: string, user_id: string }
 *      Response: { content: string, suggestions: string[] }
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { T } from "../styles/tokens";
import { TopNav, ModeBadge, TypingIndicator, AgentAvatar, HelpIcon, SendIcon } from "../components/Shared";
import MessageBubble from "../components/MessageBubble";
import HelpPanel from "../components/HelpPanel";
import ProgressSidebar from "../components/ProgressSidebar";

// ─── Mock AI responses ────────────────────────────────────────────────────────
const MOCK = {
  foundation: `Great question! Let me break this down step by step.

**What is Ohm's Law?**

Ohm's Law describes the relationship between three fundamental electrical quantities: Voltage (V), Current (I), and Resistance (R).

**The formula:**
V = I × R

Think of it like water flowing through a pipe:
- **Voltage (V)** → Water pressure pushing the flow
- **Current (I)** → The actual flow rate of water
- **Resistance (R)** → How narrow the pipe is

**A simple example:**
If a battery provides 9V and your resistor is 3Ω:
I = V/R = 9/3 = **3 Amperes**

**Why it matters:**
Every circuit you'll ever design uses this principle to calculate how much current flows through each component.`,

  acceleration: `Excellent — let's go deep on this.

**Kirchhoff's Laws: A Systematic Analysis Framework**

Going beyond Ohm's Law, Kirchhoff's Laws (KVL & KCL) enable analysis of complex multi-loop networks:

**KCL (Current Law):** ΣI_in = ΣI_out at any node (conservation of charge)
**KVL (Voltage Law):** ΣV = 0 around any closed loop (conservation of energy)

**Practical application — Node Voltage Method:**
1. Assign a reference node (ground)
2. Write KCL equations for each non-reference node
3. Solve the resulting system of linear equations

**Advanced consideration:**
In AC circuits, Ohm's Law generalizes to impedance: **V = IZ**, where Z is complex (Z = R + jX). This is where phasor analysis becomes essential for reactive components.

**Research extension:** Look into Modified Nodal Analysis (MNA) — the backbone of SPICE simulation engines.`,
};

// Suggestions per mode
const SUGGESTIONS = {
  foundation:    ["Explain Ohm's Law", "What is Newton's 2nd Law?", "How does a transistor work?"],
  acceleration:  ["Derive Kirchhoff's Laws", "Analyse a BJT amplifier circuit", "Explain Fourier Transform applications"],
};

// ─── Suggestion Chip ──────────────────────────────────────────────────────────
function SuggestionChip({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:"rgba(17,34,64,0.7)",
        border:`1px solid ${hov ? T.gold : T.border}`,
        borderRadius:99,
        padding:"7px 16px",
        color: hov ? T.gold : T.textMid,
        fontSize:"0.8rem",
        cursor:"pointer",
        fontFamily:"var(--font-body)",
        transition:"var(--transition)",
      }}
    >
      {label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LearningPage({ mode, gaps, user, onModeChange }) {
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [isTyping,     setIsTyping]     = useState(false);
  const [showHelp,     setShowHelp]     = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const [currentTopic, setCurrentTopic] = useState("");

  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);
  const isFound    = mode === "foundation";

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, isTyping]);

  // Welcome message on first load / mode change
  useEffect(() => {
    const welcome = isFound
      ? `Welcome${user?.name ? `, ${user.name}` : ""}! I've detected gaps in **${gaps.join(", ") || "a few areas"}**. I'm in **Foundation Mode** — every concept will be broken down to first principles with intuitive analogies.\n\nWhat topic would you like to start with?`
      : `Welcome${user?.name ? `, ${user.name}` : ""}! You've scored well across the diagnostic. I'm in **Acceleration Mode** — expect deeper theory, real-world applications, and research-level challenges.\n\nWhat engineering concept shall we tackle today?`;
    setMessages([{ role:"assistant", content:welcome, id:Date.now() }]);
  }, [mode, gaps, user?.name, isFound]);

  // Send a message to the AI
  const sendMessage = useCallback(async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages(m => [...m, { role:"user", content:trimmed, id:Date.now() }]);
    setInput("");
    setCurrentTopic(trimmed);
    setIsTyping(true);
    inputRef.current?.blur();

    try {
      // ── Uncomment when backend ready ──
      // const res  = await fetch("/api/learn/query", {
      //   method:  "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body:    JSON.stringify({ topic: trimmed, mode, user_id: user?.id || "demo" }),
      // });
      // const data = await res.json();
      // setMessages(m => [...m, { role:"assistant", content:data.content, id:Date.now() }]);

      await new Promise(r => setTimeout(r, 1600));
      setMessages(m => [...m, { role:"assistant", content:MOCK[mode], id:Date.now() }]);
    } catch {
      setMessages(m => [...m, {
        role:"assistant",
        content:"Sorry, I couldn't reach the server. Please try again.",
        id:Date.now(),
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, mode, isTyping]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: `radial-gradient(ellipse 55% 50% at 20% 10%, var(--page-bg-subtle) 0%, transparent 55%), var(--page-bg)`,
    }}>

      {/* ── Navigation ── */}
      <TopNav
        rightSlot={
          <>
            <ModeBadge mode={mode} />
            <button
              className="btn-ghost"
              onClick={() => onModeChange(isFound ? "acceleration" : "foundation")}
              style={{ fontSize:"0.78rem", padding:"7px 14px" }}
            >
              Switch to {isFound ? "Acceleration" : "Foundation"}
            </button>
            <button
              className="btn-ghost"
              onClick={() => setShowProgress(s => !s)}
              style={{ fontSize:"0.78rem", padding:"7px 12px", display:"flex", alignItems:"center", gap:5 }}
            >
              {/* Bar chart icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="9" width="3" height="4" rx="1" fill={T.textMid}/>
                <rect x="5.5" y="5" width="3" height="8" rx="1" fill={T.textMid}/>
                <rect x="10" y="1" width="3" height="12" rx="1" fill={T.textMid}/>
              </svg>
              Progress
            </button>
          </>
        }
      />

      {/* ── Body (chat + sidebar) ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ── Chat column ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

          {/* Message list */}
          <div style={{
            flex:1,
            overflowY:"auto",
            padding:"28px 24px",
            display:"flex",
            flexDirection:"column",
            gap:20,
          }}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} mode={mode} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display:"flex", gap:12, animation:"fadeIn 0.2s ease both" }}>
                <AgentAvatar mode={mode} />
                <div className="card" style={{ padding:"6px 14px", display:"inline-flex", alignItems:"center" }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions (only shown early in conversation) */}
          {messages.length <= 2 && !isTyping && (
            <div style={{ padding:"0 24px 16px", display:"flex", gap:10, flexWrap:"wrap" }}>
              {SUGGESTIONS[mode].map(s => (
                <SuggestionChip key={s} label={s} onClick={() => sendMessage(s)} />
              ))}
            </div>
          )}

          {/* ── Input bar ── */}
          <div style={{
            borderTop:`1px solid ${T.border}`,
            padding:"14px 20px",
            display:"flex", gap:12, alignItems:"flex-end",
            background:"var(--input-bar-bg)",
            backdropFilter:"blur(10px)",
            WebkitBackdropFilter:"blur(10px)",
          }}>
            {/* Help Me Understand trigger */}
            <button
              className="btn-ghost"
              onClick={() => setShowHelp(true)}
              style={{
                padding:"11px 14px", flexShrink:0,
                borderColor:"rgba(201,168,76,0.38)",
                color:T.gold, fontSize:"0.8rem",
                display:"flex", alignItems:"center", gap:6,
              }}
            >
              <HelpIcon size={14} />
              <span style={{ whiteSpace:"nowrap" }}>Help Me</span>
            </button>

            {/* Text area */}
            <textarea
              ref={inputRef}
              className="input-field"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isFound ? "Ask me anything — I'll explain it simply…" : "Pose a concept, problem, or derivation…"}
              style={{ resize:"none", lineHeight:1.5, minHeight:46, maxHeight:120 }}
            />

            {/* Send button */}
            <button
              className="btn-primary"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              style={{ padding:"12px 18px", flexShrink:0 }}
            >
              <SendIcon />
            </button>
          </div>
        </div>

        {/* ── Progress sidebar ── */}
        {showProgress && (
          <ProgressSidebar mode={mode} gaps={gaps} />
        )}
      </div>

      {/* ── Help Me Understand drawer ── */}
      {showHelp && (
        <HelpPanel
          topic={currentTopic}
          mode={mode}
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}
