/**
 * MathRenderer.jsx — Renders LaTeX math using KaTeX within markdown text.
 *
 * Handles:
 *   - Block math:  $$ ... $$  (centered, display-style)
 *   - Inline math: $ ... $    (within text flow)
 *   - Falls back gracefully if KaTeX fails to parse
 */

import { useMemo } from "react";
import katex from "katex";

// ─── Render a single LaTeX string to HTML ─────────────────────────────────────
function renderLatex(latex, displayMode = false) {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
      macros: {
        "\\R": "\\mathbb{R}",
        "\\N": "\\mathbb{N}",
        "\\Z": "\\mathbb{Z}",
      },
    });
  } catch {
    // If KaTeX can't parse it, return the raw text styled as code
    return `<code style="color:var(--gold);font-family:var(--font-mono);font-size:0.85em">${latex}</code>`;
  }
}

// ─── Split text into segments: plain text, block math, inline math ────────────
function splitMathSegments(text) {
  const segments = [];
  // Match block math ($$...$$) first, then inline math ($...$)
  // Block math: $$ followed by content (possibly multiline) followed by $$
  // Inline math: $ followed by non-whitespace content followed by $
  const regex = /(\$\$[\s\S]*?\$\$|\$(?!\$)(?:[^$\\]|\\.)+\$)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    if (raw.startsWith("$$") && raw.endsWith("$$")) {
      segments.push({ type: "block-math", content: raw.slice(2, -2).trim() });
    } else if (raw.startsWith("$") && raw.endsWith("$")) {
      segments.push({ type: "inline-math", content: raw.slice(1, -1).trim() });
    }

    lastIndex = match.index + raw.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments;
}

// ─── Inline Math Component — renders a single inline $ ... $ ──────────────────
export function InlineMath({ latex }) {
  const html = useMemo(() => renderLatex(latex, false), [latex]);
  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ verticalAlign: "baseline" }}
    />
  );
}

// ─── Block Math Component — renders a single $$ ... $$ ────────────────────────
export function BlockMath({ latex }) {
  const html = useMemo(() => renderLatex(latex, true), [latex]);
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        margin: "14px 0",
        padding: "12px 16px",
        background: "rgba(201,168,76,0.04)",
        borderRadius: 8,
        borderLeft: "3px solid rgba(201,168,76,0.3)",
        overflowX: "auto",
        textAlign: "center",
      }}
    />
  );
}

// ─── Render a line of text that may contain mixed math and plain text ──────────
export function MathText({ children }) {
  if (typeof children !== "string") return <>{children}</>;

  const segments = useMemo(() => splitMathSegments(children), [children]);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "block-math") return <BlockMath key={i} latex={seg.content} />;
        if (seg.type === "inline-math") return <InlineMath key={i} latex={seg.content} />;
        return <span key={i}>{seg.content}</span>;
      })}
    </>
  );
}

export default MathText;
