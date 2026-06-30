/**
 * MessageBubble.jsx — Renders a single chat message (user or assistant).
 * Full markdown support: headings, bold, italic, code, bullets, blockquotes, dividers.
 * LaTeX math support: inline $...$ and block $$...$$ via KaTeX.
 */

import { AgentAvatar } from "../components/Shared";
import { MathText, BlockMath } from "../components/MathRenderer";

// ─── Check if a line is a block math line (standalone $$..$$) ─────────────────
function isBlockMathLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 4;
}

function extractBlockMath(line) {
  const trimmed = line.trim();
  return trimmed.slice(2, -2).trim();
}

// ─── Full Markdown line renderer with math support ────────────────────────────
function renderInline(text, key) {
  // First check if there's any math in the text
  const hasMath = /\$/.test(text);

  if (!hasMath) {
    // Pure markdown inline parsing: **bold**, *italic*, `code`
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={j} style={{ color: "var(--cream-lt)", fontWeight: 600 }}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*") && p.length > 2)
        return <em key={j} style={{ color: "var(--text-mid)", fontStyle: "italic" }}>{p.slice(1, -1)}</em>;
      if (p.startsWith("`") && p.endsWith("`"))
        return (
          <code key={j} style={{
            fontFamily: "var(--font-mono)", fontSize: "0.82em",
            color: "var(--gold)", background: "rgba(201,168,76,0.10)",
            padding: "1px 6px", borderRadius: 4, letterSpacing: 0,
          }}>{p.slice(1, -1)}</code>
        );
      return <span key={j}>{p}</span>;
    });
  }

  // Text contains math — split into markdown and math segments
  // First handle **bold**, *italic*, `code`, then pass remaining text through MathText
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, j) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={j} style={{ color: "var(--cream-lt)", fontWeight: 600 }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2)
      return <em key={j} style={{ color: "var(--text-mid)", fontStyle: "italic" }}>{p.slice(1, -1)}</em>;
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code key={j} style={{
          fontFamily: "var(--font-mono)", fontSize: "0.82em",
          color: "var(--gold)", background: "rgba(201,168,76,0.10)",
          padding: "1px 6px", borderRadius: 4, letterSpacing: 0,
        }}>{p.slice(1, -1)}</code>
      );
    // This segment may contain inline math $...$
    return <MathText key={j}>{p}</MathText>;
  });
}

function renderLine(line, i) {
  // Blank line → spacer
  if (line.trim() === "")
    return <div key={i} style={{ height: 8 }} />;

  // Horizontal rule
  if (/^---+$/.test(line.trim()))
    return <hr key={i} style={{ border: "none", borderTop: "1px solid var(--border)", margin: "10px 0" }} />;

  // Fenced code block fence — spacer
  if (line.startsWith("```"))
    return <div key={i} style={{ height: 4 }} />;

  // Block math: standalone $$...$$ on a single line
  if (isBlockMathLine(line))
    return <BlockMath key={i} latex={extractBlockMath(line)} />;

  // ### Heading 3
  if (line.startsWith("### "))
    return (
      <h4 key={i} style={{
        fontFamily: "var(--font-display)", fontWeight: 600,
        color: "var(--cream-lt)", fontSize: "1.0rem",
        margin: "14px 0 6px", letterSpacing: 0.2,
      }}>{renderInline(line.slice(4))}</h4>
    );

  // ## Heading 2
  if (line.startsWith("## "))
    return (
      <h3 key={i} style={{
        fontFamily: "var(--font-display)", fontWeight: 600,
        color: "var(--gold-lt)", fontSize: "1.1rem",
        margin: "16px 0 6px",
      }}>{renderInline(line.slice(3))}</h3>
    );

  // # Heading 1
  if (line.startsWith("# "))
    return (
      <h2 key={i} style={{
        fontFamily: "var(--font-display)", fontWeight: 700,
        color: "var(--gold)", fontSize: "1.2rem",
        margin: "18px 0 8px",
      }}>{renderInline(line.slice(2))}</h2>
    );

  // > Blockquote
  if (line.startsWith("> "))
    return (
      <div key={i} style={{
        borderLeft: "3px solid var(--gold)",
        background: "rgba(201,168,76,0.05)",
        padding: "6px 12px",
        margin: "8px 0",
        borderRadius: "0 6px 6px 0",
        color: "var(--text-mid)",
        fontSize: "0.87rem",
        fontStyle: "italic",
      }}>
        {renderInline(line.slice(2))}
      </div>
    );

  // - Bullet or * bullet
  if (/^[-*] /.test(line))
    return (
      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "3px 0", paddingLeft: 4 }}>
        <span style={{ color: "var(--gold)", fontWeight: 700, marginTop: 1, flexShrink: 0 }}>•</span>
        <span style={{ lineHeight: 1.65 }}>{renderInline(line.slice(2))}</span>
      </div>
    );

  // Numbered list: 1. 2. 3.
  const numMatch = line.match(/^(\d+)\. (.+)/);
  if (numMatch)
    return (
      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "3px 0", paddingLeft: 4 }}>
        <span style={{ color: "var(--gold)", fontWeight: 600, minWidth: 18, flexShrink: 0 }}>{numMatch[1]}.</span>
        <span style={{ lineHeight: 1.65 }}>{renderInline(numMatch[2])}</span>
      </div>
    );

  // Indented code block (4 spaces or tab)
  if (line.startsWith("    ") || line.startsWith("\t"))
    return (
      <div key={i} style={{
        fontFamily: "var(--font-mono)", fontSize: "0.8rem",
        color: "var(--gold)", background: "rgba(201,168,76,0.07)",
        borderLeft: "2px solid var(--gold)",
        padding: "3px 10px", margin: "2px 0",
        borderRadius: "0 4px 4px 0",
      }}>{line.trim()}</div>
    );

  // Normal paragraph line
  return (
    <div key={i} style={{ marginBottom: 2, lineHeight: 1.75 }}>
      {renderInline(line)}
    </div>
  );
}

// ─── Preprocess content to handle multi-line block math ───────────────────────
function preprocessContent(content) {
  // Handle multi-line $$ blocks: merge lines between $$ markers into single lines
  const lines = content.split("\n");
  const processed = [];
  let mathBlock = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (mathBlock === null) {
      // Not inside a math block
      if (trimmed === "$$") {
        // Opening $$ on its own line
        mathBlock = [];
      } else {
        processed.push(line);
      }
    } else {
      // Inside a math block
      if (trimmed === "$$") {
        // Closing $$
        processed.push(`$$${mathBlock.join(" ")}$$`);
        mathBlock = null;
      } else {
        mathBlock.push(trimmed);
      }
    }
  }

  // If we never closed the math block, just dump it as-is
  if (mathBlock !== null) {
    processed.push("$$" + mathBlock.join(" ") + "$$");
  }

  return processed;
}

// ─── User bubble ──────────────────────────────────────────────────────────────
function UserBubble({ content }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", animation: "slideInRight 0.28s ease both" }}>
      <div style={{
        maxWidth: "70%",
        background: "rgba(201,168,76,0.09)",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: "14px 14px 4px 14px",
        padding: "12px 18px",
        fontSize: "0.92rem",
        lineHeight: 1.65,
        color: "var(--text)",
      }}>
        {content}
      </div>
    </div>
  );
}

// ─── Assistant bubble ─────────────────────────────────────────────────────────
function AssistantBubble({ content, mode }) {
  const lines = preprocessContent(content);

  return (
    <div style={{ display: "flex", gap: 12, animation: "slideInLeft 0.28s ease both" }}>
      <AgentAvatar mode={mode} />
      <div className="card" style={{
        maxWidth: "78%",
        padding: "16px 20px",
        fontSize: "0.9rem",
        lineHeight: 1.78,
        color: "var(--text)",
        borderRadius: "4px 14px 14px 14px",
      }}>
        {lines.map(renderLine)}
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function MessageBubble({ msg, mode }) {
  if (msg.role === "user") return <UserBubble content={msg.content} />;
  return <AssistantBubble content={msg.content} mode={mode} />;
}
