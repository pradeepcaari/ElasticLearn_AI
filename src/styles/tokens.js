/**
 * tokens.js — Single source of truth for all design values.
 * Supports light + dark themes via [data-theme] on <html>.
 * Import T (colors) and injectGlobalStyles() into any component that needs them.
 * GlobalStyles component auto-injects once when mounted in App.jsx.
 */

import { useEffect } from "react";

// ─── Color Palette (Dark — default) ──────────────────────────────────────────
export const T = {
  navy:        "#0B1628",
  navyMid:     "#112240",
  navyLt:      "#1A3A6B",
  gold:        "#C9A84C",
  goldLt:      "#E8C96A",
  goldDim:     "rgba(201,168,76,0.18)",
  goldDimHov:  "rgba(201,168,76,0.45)",
  cream:       "#F0EAD6",
  creamLt:     "#FAF7F0",
  text:        "#E8E2D4",
  textMid:     "#A89F8C",
  textDim:     "#5C6478",
  green:       "#2ECC8A",
  greenDk:     "#1A7A52",
  red:         "#E05252",
  cardBg:      "rgba(17, 34, 64, 0.85)",
  border:      "rgba(201, 168, 76, 0.18)",
  borderHov:   "rgba(201, 168, 76, 0.45)",
  overlay:     "rgba(0,0,0,0.55)",
};

// ─── Global CSS String ────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ═══ DARK THEME (default) ═══ */
  :root,
  [data-theme="dark"] {
    --navy:        ${T.navy};
    --navy-mid:    ${T.navyMid};
    --navy-lt:     ${T.navyLt};
    --gold:        ${T.gold};
    --gold-lt:     ${T.goldLt};
    --cream:       ${T.cream};
    --cream-lt:    ${T.creamLt};
    --text:        ${T.text};
    --text-mid:    ${T.textMid};
    --text-dim:    ${T.textDim};
    --green:       ${T.green};
    --red:         ${T.red};
    --border:      ${T.border};
    --card-bg:     ${T.cardBg};

    /* ─ theme-aware semantic tokens ─ */
    --page-bg:        ${T.navy};
    --page-bg-subtle: rgba(26,58,107,0.55);
    --surface:        rgba(17,34,64,0.85);
    --surface-hover:  rgba(17,34,64,0.95);
    --input-bg:       rgba(17,34,64,0.7);
    --nav-bg:         rgba(11,22,40,0.88);
    --input-bar-bg:   rgba(9,18,34,0.75);
    --scrollbar-thumb: var(--navy-lt);
    --shadow-color:   rgba(0,0,0,0.4);

    --radius:      12px;
    --radius-sm:   8px;
    --radius-lg:   20px;
    --font-display: 'Cormorant Garamond', Georgia, serif;
    --font-body:    'DM Sans', system-ui, sans-serif;
    --font-mono:    'DM Mono', monospace;
    --ease:         cubic-bezier(0.4, 0, 0.2, 1);
    --transition:   0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ═══ LIGHT THEME ═══ */
  [data-theme="light"] {
    --navy:        #F5F0E8;
    --navy-mid:    #EDE7DA;
    --navy-lt:     #D4CFC5;
    --gold:        #9E7C2B;
    --gold-lt:     #B8912F;
    --cream:       #2C2416;
    --cream-lt:    #1A1208;
    --text:        #4A4235;
    --text-mid:    #6B6256;
    --text-dim:    #9A9285;
    --green:       #1E9960;
    --red:         #C93535;
    --border:      rgba(158,124,43,0.2);
    --card-bg:     rgba(255,255,255,0.85);

    --page-bg:        #F5F0E8;
    --page-bg-subtle: rgba(212,207,197,0.45);
    --surface:        rgba(255,255,255,0.85);
    --surface-hover:  rgba(255,255,255,0.95);
    --input-bg:       rgba(255,255,255,0.75);
    --nav-bg:         rgba(245,240,232,0.92);
    --input-bar-bg:   rgba(245,240,232,0.85);
    --scrollbar-thumb: #D4CFC5;
    --shadow-color:   rgba(0,0,0,0.08);
  }

  html, body { min-height: 100%; height: auto; }
  #root { min-height: 100vh; height: auto; display: flex; flex-direction: column; }

  body {
    font-family: var(--font-body);
    background: var(--page-bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    transition: background 0.4s var(--ease), color 0.4s var(--ease);
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 99px; }

  /* ── Keyframes ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(36px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-36px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes borderGlow {
    0%, 100% { box-shadow: 0 0 0   0 rgba(201,168,76,0); }
    50%       { box-shadow: 0 0 20px 3px rgba(201,168,76,0.2); }
  }
  @keyframes goldPulse {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
  @keyframes scanline {
    from { background-position: 0 0; }
    to   { background-position: 0 100%; }
  }
  @keyframes dot1 { 0%,80%,100%{opacity:0} 40%{opacity:1} }
  @keyframes dot2 { 0%,100%{opacity:0} 40%,80%{opacity:1} }
  @keyframes dot3 { 0%,20%,100%{opacity:0} 60%,80%{opacity:1} }

  /* ── Reusable Utility Classes ── */

  /* Noise overlay on parent element */
  .noise-bg::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.032'/%3E%3C/svg%3E");
  }

  /* Star dots background */
  .star-bg {
    background-image:
      radial-gradient(1px 1px at 15% 25%, rgba(201,168,76,0.35) 0%, transparent 100%),
      radial-gradient(1px 1px at 80% 10%, rgba(201,168,76,0.25) 0%, transparent 100%),
      radial-gradient(1px 1px at 55% 60%, rgba(255,255,255,0.14) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.11) 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 70%, rgba(201,168,76,0.2)  0%, transparent 100%),
      radial-gradient(2px 2px at 65% 35%, rgba(201,168,76,0.28) 0%, transparent 100%),
      radial-gradient(1px 1px at 40% 15%, rgba(255,255,255,0.18) 0%, transparent 100%);
  }

  /* Light mode: tone down star-bg */
  [data-theme="light"] .star-bg {
    background-image:
      radial-gradient(1px 1px at 15% 25%, rgba(158,124,43,0.15) 0%, transparent 100%),
      radial-gradient(1px 1px at 80% 10%, rgba(158,124,43,0.12) 0%, transparent 100%),
      radial-gradient(1px 1px at 55% 60%, rgba(0,0,0,0.04) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 80%, rgba(0,0,0,0.03) 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 70%, rgba(158,124,43,0.1)  0%, transparent 100%),
      radial-gradient(2px 2px at 65% 35%, rgba(158,124,43,0.12) 0%, transparent 100%),
      radial-gradient(1px 1px at 40% 15%, rgba(0,0,0,0.05) 0%, transparent 100%);
  }

  /* Grid texture */
  .grid-bg {
    background-image:
      linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* Buttons */
  .btn-primary {
    background: linear-gradient(135deg, var(--gold) 0%, var(--gold-lt) 100%);
    color: var(--page-bg);
    border: none;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 0.9rem;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: var(--transition);
    padding: 12px 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-primary:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(201,168,76,0.32);
  }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.42; cursor: not-allowed; }

  .btn-ghost {
    background: transparent;
    color: var(--text-mid);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 0.875rem;
    cursor: pointer;
    transition: var(--transition);
    padding: 10px 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-ghost:hover {
    border-color: var(--gold);
    color: var(--gold);
    background: rgba(201,168,76,0.06);
  }

  /* Card */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: background 0.3s var(--ease), border-color 0.3s var(--ease);
  }

  /* Badges */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px;
    border-radius: 99px;
    font-size: 0.72rem; font-weight: 500;
    letter-spacing: 0.05em; text-transform: uppercase;
  }
  .badge-foundation {
    background: rgba(46,204,138,0.12);
    color: var(--green);
    border: 1px solid rgba(46,204,138,0.28);
  }
  .badge-acceleration {
    background: rgba(201,168,76,0.12);
    color: var(--gold);
    border: 1px solid rgba(201,168,76,0.28);
  }

  /* Input */
  .input-field {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.92rem;
    padding: 12px 16px;
    outline: none;
    transition: var(--transition);
    width: 100%;
  }
  .input-field::placeholder { color: var(--text-dim); }
  .input-field:focus {
    border-color: rgba(201,168,76,0.5);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
  }

  /* Typing dots */
  .typing-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--gold);
    display: inline-block;
  }
  .typing-dot:nth-child(1) { animation: dot1 1.4s ease infinite; }
  .typing-dot:nth-child(2) { animation: dot2 1.4s ease infinite; }
  .typing-dot:nth-child(3) { animation: dot3 1.4s ease infinite; }

  /* Page wrapper with z-index context for noise overlay */
  .page-root { position: relative; z-index: 1; }

  /* ── Theme transition on all themed elements ── */
  h1, h2, h3, p, span, div, nav, button, input, textarea {
    transition: color 0.3s var(--ease), background-color 0.3s var(--ease),
                border-color 0.3s var(--ease), box-shadow 0.3s var(--ease);
  }
`;

// ─── Global Styles Component ──────────────────────────────────────────────────
// Mount this once in App.jsx — it injects all CSS into <head>
export function GlobalStyles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.id    = "elasticlearn-global";
    el.textContent = GLOBAL_CSS;
    // Avoid duplicate injection across HMR reloads
    const existing = document.getElementById("elasticlearn-global");
    if (existing) existing.remove();
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}
