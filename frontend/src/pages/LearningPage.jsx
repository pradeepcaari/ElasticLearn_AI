/**
 * LearningPage.jsx — Main adaptive learning chat interface.
 * Hosts chat area, mode toggle, suggestions, and sidebars.
 *
 * API: POST /api/learn/query
 *      Body:     { topic: string, mode: string, user_id: string }
 *      Response: { content: string, suggestions: string[] }
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TopNav, ModeBadge, TypingIndicator, AgentAvatar, HelpIcon, SendIcon } from "../components/Shared";
import MessageBubble from "../components/MessageBubble";
import HelpPanel from "../components/HelpPanel";
import ChatHistorySidebar from "../components/ChatHistorySidebar";

// ─── Clear session and redirect to login on auth failure ─────────────────────
function handleAuthError(navigate) {
  localStorage.removeItem("el_token");
  localStorage.removeItem("el_user");
  navigate("/login", { replace: true });
}



// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LearningPage({ mode, gaps, user, onModeChange }) {
  const [messages,         setMessages]         = useState([]);
  const [input,            setInput]            = useState("");
  const [isTyping,         setIsTyping]         = useState(false);
  const [showHelp,         setShowHelp]         = useState(false);
  const [currentTopic,     setCurrentTopic]     = useState("");
  const [sessions,         setSessions]         = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionTitle,     setSessionTitle]     = useState("");
  const [sidebarOpen,      setSidebarOpen]      = useState(true);

  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);
  const isFound    = mode === "foundation";
  const navigate   = useNavigate();

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, isTyping]);

  // Load user's chat sessions
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/learning/sessions", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("el_token")}`,
        },
      });
      if (res.status === 401) {
        handleAuthError(navigate);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  }, [navigate]);

  // Load messages for a specific session
  const loadSessionMessages = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setIsTyping(true);
    try {
      const res = await fetch(`/api/learning/sessions/${sessionId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("el_token")}`,
        },
      });
      if (res.status === 401) {
        handleAuthError(navigate);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
        setCurrentSessionId(sessionId);
        
        // Update local session title state
        const resSessions = await fetch("/api/learning/sessions", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("el_token")}`,
          },
        });
        const sessData = await resSessions.json();
        if (resSessions.ok) {
          setSessions(sessData.sessions || []);
          const sess = sessData.sessions.find(s => s.session_id === sessionId);
          if (sess) {
            setSessionTitle(sess.session_title);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load session messages:", err);
    } finally {
      setIsTyping(false);
    }
  }, [navigate]);

  // Handle starting a new chat
  const handleNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setSessionTitle("");
    const welcome = isFound
      ? `Welcome${user?.name ? `, ${user.name}` : ""}! I've detected gaps in **${gaps.join(", ") || "a few areas"}**. I'm in **Foundation Mode** — every concept will be broken down to first principles with intuitive analogies.\n\nWhat topic would you like to start with?`
      : `Welcome${user?.name ? `, ${user.name}` : ""}! You've scored well across the diagnostic. I'm in **Acceleration Mode** — expect deeper theory, real-world applications, and research-level challenges.\n\nWhat engineering concept shall we tackle today?`;
    setMessages([{ role: "assistant", content: welcome, id: Date.now() }]);
  }, [isFound, user?.name, gaps]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Welcome message on first load / mode change (only if there are no messages yet)
  useEffect(() => {
    if (messages.length === 0) {
      const welcome = isFound
        ? `Welcome${user?.name ? `, ${user.name}` : ""}! I've detected gaps in **${gaps.join(", ") || "a few areas"}**. I'm in **Foundation Mode** — every concept will be broken down to first principles with intuitive analogies.\n\nWhat topic would you like to start with?`
        : `Welcome${user?.name ? `, ${user.name}` : ""}! You've scored well across the diagnostic. I'm in **Acceleration Mode** — expect deeper theory, real-world applications, and research-level challenges.\n\nWhat engineering concept shall we tackle today?`;
      setMessages([{ role:"assistant", content:welcome, id:Date.now() }]);
    }
  }, [mode, gaps, user?.name, isFound, messages.length]);

  // Send a message to the AI
  const sendMessage = useCallback(async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages(m => [...m, { role:"user", content:trimmed, id:Date.now() }]);
    setInput("");
    setCurrentTopic(trimmed);
    setIsTyping(true);
    inputRef.current?.blur();

    // Generate or use current session ID and title
    const isNewSession = !currentSessionId;
    const sId = currentSessionId || crypto.randomUUID();
    const sTitle = isNewSession ? trimmed : sessionTitle;

    if (isNewSession) {
      setCurrentSessionId(sId);
      setSessionTitle(sTitle);
    }

    try {
      // ── Real AI tutor query ──
      const res  = await fetch("/api/learning/query", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("el_token")}`,
        },
        body:    JSON.stringify({ 
          query: trimmed, 
          mode,
          session_id: sId,
          session_title: sTitle
        }),
      });
      const data = await res.json();
      // Redirect to login on token expiry / auth failure
      if (res.status === 401) {
        handleAuthError(navigate);
        return;
      }
      if (!res.ok) throw new Error(data.msg || "Server error");
      setMessages(m => [...m, { role:"assistant", content:data.response, id:Date.now() }]);
      
      // Refresh sessions list if it was a new session
      if (isNewSession) {
        loadSessions();
      }
    } catch (err) {
      setMessages(m => [...m, {
        role:"assistant",
        content: err.message || "Sorry, I couldn't reach the server. Please try again.",
        id:Date.now(),
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, mode, isTyping, navigate, currentSessionId, sessionTitle, loadSessions]);


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
        user={user}
        leftSlot={
          !sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 8,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-mid)",
                transition: "all 0.2s ease",
                marginRight: -4,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-h)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mid)"; }}
            >
              {/* Menu Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )
        }
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
          </>
        }
      />

      {/* ── Body (chat + sidebar) ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", position: "relative" }}>

        {/* ── Chat History Sidebar (left) ── */}
        <div style={{
          width: sidebarOpen ? 280 : 0,
          opacity: sidebarOpen ? 1 : 0,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
          overflow: "hidden",
          height: "100%",
          flexShrink: 0,
        }}>
          <ChatHistorySidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={loadSessionMessages}
            onNewChat={handleNewChat}
            onCloseSidebar={() => setSidebarOpen(false)}
          />
        </div>

        {/* ── Chat column ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, position: "relative" }}>

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



          {/* ── Input bar ── */}
          <div style={{
            borderTop:"1px solid var(--border)",
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
                color:"var(--gold)", fontSize:"0.8rem",
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
      </div>

      {/* ── Help Me Understand drawer ── */}
      {showHelp && (
        <HelpPanel
          topic={currentTopic}
          mode={mode}
          sessionId={currentSessionId}
          sessionTitle={sessionTitle}
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}
