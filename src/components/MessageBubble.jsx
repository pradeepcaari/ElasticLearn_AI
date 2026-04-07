/**
 * MessageBubble.jsx — Renders a single chat message (user or assistant).
 * Handles simple markdown: **bold**, `code`, indented code blocks, blank lines.
 */

import { T } from "../styles/tokens";
import { AgentAvatar } from "../components/Shared";

// ─── Inline markdown renderer ─────────────────────────────────────────────────
function renderLine(line, i) {
  // Fenced code block delimiter → spacer
  if (line.startsWith("```")) return <div key={i} style={{ height:4 }} />;

  // Indented code block
  if (line.startsWith("  ") || line.startsWith("\t")) {
    return (
      <div key={i} style={{
        fontFamily:"var(--font-mono)",
        fontSize:"0.8rem",
        color:T.gold,
        background:"rgba(201,168,76,0.06)",
        borderLeft:`2px solid ${T.gold}`,
        padding:"3px 10px",
        margin:"4px 0",
        borderRadius:"0 4px 4px 0",
      }}>
        {line.trim()}
      </div>
    );
  }

  // Bold heading line: **text**
  const boldHeading = line.match(/^\*\*(.+)\*\*$/);
  if (boldHeading) {
    return (
      <strong key={i} style={{ color:T.creamLt, fontWeight:500, display:"block", marginTop:12, marginBottom:3 }}>
        {boldHeading[1]}
      </strong>
    );
  }

  // Inline bold/code in mixed line
  const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <div key={i} style={{ marginBottom: line === "" ? 10 : 0 }}>
      {parts.map((p, j) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={j} style={{ color:T.creamLt, fontWeight:500 }}>{p.slice(2,-2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code key={j} style={{
              fontFamily:"var(--font-mono)", fontSize:"0.82em",
              color:T.gold, background:"rgba(201,168,76,0.09)",
              padding:"1px 5px", borderRadius:4,
            }}>
              {p.slice(1,-1)}
            </code>
          );
        return <span key={j}>{p}</span>;
      })}
    </div>
  );
}

// ─── User bubble ──────────────────────────────────────────────────────────────
function UserBubble({ content }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-end", animation:"slideInLeft 0.28s ease both" }}>
      <div style={{
        maxWidth:"70%",
        background:"rgba(201,168,76,0.09)",
        border:`1px solid rgba(201,168,76,0.2)`,
        borderRadius:"14px 14px 4px 14px",
        padding:"12px 18px",
        fontSize:"0.92rem",
        lineHeight:1.65,
        color:T.text,
      }}>
        {content}
      </div>
    </div>
  );
}

// ─── Assistant bubble ─────────────────────────────────────────────────────────
function AssistantBubble({ content, mode }) {
  return (
    <div style={{ display:"flex", gap:12, animation:"slideInRight 0.28s ease both" }}>
      <AgentAvatar mode={mode} />
      <div className="card" style={{
        maxWidth:"78%",
        padding:"16px 20px",
        fontSize:"0.9rem",
        lineHeight:1.78,
        color:T.text,
        borderRadius:"4px 14px 14px 14px",
      }}>
        {content.split("\n").map(renderLine)}
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function MessageBubble({ msg, mode }) {
  if (msg.role === "user") return <UserBubble content={msg.content} />;
  return <AssistantBubble content={msg.content} mode={mode} />;
}
