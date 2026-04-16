/**
 * LoginPage.jsx — Authentication screen.
 *
 * Layout: Split panel — left: animated brand panel with quote rotator,
 *                       right: login / register form toggle.
 *
 * API: POST /api/auth/login   — Body: { email, password }  → { token, user }
 * API: POST /api/auth/signup  — Body: { name, email, password } → { token, user }
 */

import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { BrandMark, MonoLabel, Spinner } from "../components/Shared";
import ThemeToggle from "../components/ThemeToggle";

// ─── Rotating quotes shown on the left panel ──────────────────────────────────
const QUOTES = [
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Education is the kindling of a flame, not the filling of a vessel.", author: "Socrates" },
  { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
];

// ─── Inline CSS for this page ─────────────────────────────────────────────────
const PAGE_CSS = `
  .login-input {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 0.92rem;
    padding: 14px 16px 14px 46px;
    outline: none;
    transition: 0.22s cubic-bezier(0.4,0,0.2,1);
  }
  .login-input::placeholder { color: var(--text-dim); }
  .login-input:focus {
    border-color: rgba(201,168,76,0.6);
    background: var(--surface);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.1), inset 0 1px 0 rgba(201,168,76,0.05);
  }
  .login-input-wrap { position: relative; }
  .login-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    pointer-events: none; opacity: 0.45;
  }
  .form-tab {
    flex: 1; padding: 10px;
    background: transparent; border: none;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 0.85rem; font-weight: 500;
    color: var(--text-dim); cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: 0.2s ease;
  }
  .form-tab.active {
    color: var(--gold);
    border-bottom-color: var(--gold);
  }
  .form-tab:hover:not(.active) { color: var(--text-mid); }
  .social-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px; padding: 11px 16px;
    color: var(--text-mid); font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 0.82rem; cursor: pointer;
    transition: 0.22s ease;
  }
  .social-btn:hover {
    border-color: rgba(201,168,76,0.4);
    color: var(--cream-lt);
    background: rgba(201,168,76,0.06);
  }
  .quote-text {
    animation: fadeUp 0.7s ease both;
  }
  .grid-cell {
    border-right: 1px solid rgba(201,168,76,0.06);
    border-bottom: 1px solid rgba(201,168,76,0.06);
  }
  .strength-bar {
    height: 3px; border-radius: 99px;
    transition: width 0.35s ease, background 0.35s ease;
  }
  @media (max-width: 768px) {
    .login-left { display: none !important; }
    .login-right { border-radius: 0 !important; }
  }
`;

// ─── Password strength helper ─────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let s = 0;
  if (pw.length >= 8)   s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "Too short",  color: "var(--red)" },
    { label: "Weak",       color: "var(--red)" },
    { label: "Fair",       color: "var(--gold)" },
    { label: "Good",       color: "var(--gold-lt)" },
    { label: "Strong",     color: "var(--green)" },
  ];
  return { score: s, ...map[s] };
}

// ─── Animated grid background ─────────────────────────────────────────────────
function GridBackground() {
  const cols = 8, rows = 10;
  return (
    <div style={{
      position: "absolute", inset: 0, display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      overflow: "hidden",
    }}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} className="grid-cell" style={{
          animation: `fadeIn ${0.8 + (i % 7) * 0.15}s ease both`,
          animationDelay: `${(i % 13) * 0.04}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Left brand panel ─────────────────────────────────────────────────────────
function LeftPanel() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [visible, setVisible]   = useState(true);

  // Rotate quotes every 5 seconds with fade
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const q = QUOTES[quoteIdx];

  return (
    <div className="login-left" style={{
      flex: "0 0 42%",
      position: "relative",
      overflow: "hidden",
      background: `radial-gradient(ellipse 80% 60% at 30% 40%, rgba(26,58,107,0.7) 0%, transparent 65%), var(--navy)`,
      display: "flex", flexDirection: "column",
      padding: "48px 44px",
    }}>
      <GridBackground />

      {/* Diagonal gold accent line */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 2, height: "100%",
        background: `linear-gradient(180deg, transparent 0%, var(--gold) 35%, var(--gold-lt) 55%, transparent 100%)`,
        opacity: 0.25,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Brand */}
        <div style={{ marginBottom: 12 }}>
          <BrandMark size="1.8rem" />
        </div>
        <MonoLabel>Agentic Learning Platform</MonoLabel>
      </div>

      {/* Center: feature list */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
        {[
          { icon: "⬡", title: "Foundation Mode",    desc: "First-principles explanations with analogies" },
          { icon: "⚡", title: "Acceleration Mode",  desc: "Advanced theory and research-level challenges" },
          { icon: "◈", title: "Real-Time Diagnosis", desc: "AI detects your gaps before you even notice them" },
          { icon: "◉", title: "Help Me Understand",  desc: "Instant re-explanation at any depth level" },
        ].map(f => (
          <div key={f.title} style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            <div style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background: "rgba(201,168,76,0.08)",
              border: "1px solid var(--border)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:16, color: "var(--gold)",
            }}>
              {f.icon}
            </div>
            <div>
              <div style={{ fontSize:"0.88rem", fontWeight:500, color: "var(--cream-lt)", marginBottom:3 }}>{f.title}</div>
              <div style={{ fontSize:"0.78rem", color: "var(--text-mid)", lineHeight:1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: rotating quote */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "24px",
        background: "rgba(11,22,40,0.5)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        <div style={{ fontSize:"0.1rem", color: "var(--gold)", marginBottom:10, opacity:0.5 }}>
          {"— "}
        </div>
        <p className="quote-text" key={quoteIdx} style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.05rem",
          fontStyle: "italic",
          color: "var(--cream)",
          lineHeight: 1.6,
          marginBottom: 10,
        }}>
          "{q.text}"
        </p>
        <span style={{ fontSize:"0.72rem", color: "var(--text-dim)", fontFamily:"var(--font-mono)", letterSpacing:"0.06em" }}>
          — {q.author}
        </span>
        {/* Quote dots */}
        <div style={{ display:"flex", gap:5, marginTop:14 }}>
          {QUOTES.map((_, i) => (
            <div key={i} style={{
              width: i === quoteIdx ? 18 : 5,
              height: 5,
              borderRadius: 99,
              background: i === quoteIdx ? "var(--gold)" : "var(--text-dim)",
              transition: "all 0.35s ease",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
export default function LoginPage({ onLogin }) {
  const [tab,       setTab]       = useState("login");   // "login" | "signup"
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [gLoading,  setGLoading]  = useState(false);
  const [error,     setError]     = useState("");

  const strength = getStrength(password);
  const isLogin  = tab === "login";

  const handleSubmit = async () => {
    setError("");
    // Basic validation
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!isLogin && !name)   { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      /**
       * API: POST /api/auth/login
       * Body: { email: string, password: string }
       * Response: { token: string, user: { id, name, email } }
       *
       * API: POST /api/auth/signup
       * Body: { name: string, email: string, password: string }
       * Response: { token: string, user: { id, name, email } }
       */
      // const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      // const body = isLogin ? { email, password } : { name, email, password };
      // const res  = await fetch(endpoint, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(body),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message || "Authentication failed");
      // localStorage.setItem("el_token", data.token);
      // onLogin(data.user);

      // ── Mock: simulate network delay ──
      await new Promise(r => setTimeout(r, 1500));
      onLogin({ name: name || email.split("@")[0], email });
    } catch (e) {
      setError(e.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In via @react-oauth/google ────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      setError("");
      try {
        // Fetch user profile from Google using the access token
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch Google profile.");
        const profile = await res.json();
        // Store token for potential backend use
        localStorage.setItem("el_google_token", tokenResponse.access_token);
        // Call onLogin with user data from Google profile
        onLogin({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          googleId: profile.sub,
        });
      } catch (e) {
        setError(e.message || "Google sign-in failed. Please try again.");
      } finally {
        setGLoading(false);
      }
    },
    onError: (err) => {
      console.error("Google login error:", err);
      setError("Google sign-in was cancelled or failed.");
    },
    flow: "implicit",
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  // Inject page-specific CSS
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "login-css";
    el.textContent = PAGE_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--page-bg)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* ── Theme Toggle ── */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200 }}>
        <ThemeToggle />
      </div>
      {/* Ambient glow */}
      <div style={{
        position:"fixed", top:"-20%", right:"10%",
        width:500, height:500, borderRadius:"50%",
        background:"rgba(26,58,107,0.35)",
        filter:"blur(100px)", pointerEvents:"none",
      }} />

      {/* ── Left Panel ── */}
      <LeftPanel />

      {/* ── Right: Form Panel ── */}
      <div className="login-right" style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 32px",
        position: "relative",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 420,
          animation: "fadeUp 0.6s ease both",
        }}>
          {/* Mobile-only brand */}
          <div style={{ display:"none", marginBottom:32, textAlign:"center" }}>
            <BrandMark size="1.6rem" />
          </div>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              fontWeight: 600,
              color: "var(--cream-lt)",
              lineHeight: 1.1,
              marginBottom: 10,
            }}>
              {isLogin ? "Welcome back." : "Begin your journey."}
            </h2>
            <p style={{ fontSize:"0.88rem", color: "var(--text-mid)", lineHeight: 1.6 }}>
              {isLogin
                ? "Sign in to continue your personalized learning path."
                : "Create your account and let AI adapt to your level."}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            marginBottom: 28,
          }}>
            <button className={`form-tab ${isLogin ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>
              Sign In
            </button>
            <button className={`form-tab ${!isLogin ? "active" : ""}`} onClick={() => { setTab("signup"); setError(""); }}>
              Create Account
            </button>
          </div>

          {/* ── Form ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Name field — signup only */}
            {!isLogin && (
              <div className="login-input-wrap" style={{ animation:"fadeDown 0.3s ease both" }}>
                <span className="login-input-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5.5" r="2.5" stroke="var(--text-dim)" strokeWidth="1.2"/>
                    <path d="M2.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="var(--text-dim)" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type="text"
                  className="login-input"
                  placeholder="Full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            {/* Email */}
            <div className="login-input-wrap">
              <span className="login-input-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="2" stroke="var(--text-dim)" strokeWidth="1.2"/>
                  <path d="M1.5 5.5l5.646 3.764a1.5 1.5 0 001.708 0L14.5 5.5" stroke="var(--text-dim)" strokeWidth="1.2"/>
                </svg>
              </span>
              <input
                type="email"
                className="login-input"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Password */}
            <div>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="7" rx="2" stroke="var(--text-dim)" strokeWidth="1.2"/>
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="var(--text-dim)" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  className="login-input"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ paddingRight: 44 }}
                />
                {/* Show/hide toggle */}
                <button
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer", color: "var(--text-dim)",
                    padding:4, transition:"color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                >
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3 3l10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
                  }
                </button>
              </div>

              {/* Password strength — signup only */}
              {!isLogin && password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display:"flex", gap:4, marginBottom:5 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} className="strength-bar" style={{
                        flex:1,
                        background: i <= strength.score ? strength.color : "rgba(128,128,128,0.1)",
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize:"0.72rem", color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Forgot password — login only */}
            {isLogin && (
              <div style={{ textAlign:"right", marginTop:-8 }}>
                <button style={{
                  background:"none", border:"none", cursor:"pointer",
                  fontSize:"0.78rem", color: "var(--text-mid)",
                  transition:"color 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-mid)"}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{
                background: "rgba(224,82,82,0.08)",
                border: `1px solid rgba(224,82,82,0.25)`,
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                fontSize: "0.82rem",
                color: "var(--red)",
                animation: "fadeDown 0.25s ease both",
              }}>
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ width:"100%", padding:"14px", fontSize:"0.95rem", marginTop:4 }}
            >
              {loading ? (
                <><Spinner size={18} /> {isLogin ? "Signing in…" : "Creating account…"}</>
              ) : (
                isLogin ? "Sign In →" : "Create Account →"
              )}
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display:"flex", alignItems:"center", gap:14,
            margin:"24px 0", color: "var(--text-dim)", fontSize:"0.75rem",
          }}>
            <div style={{ flex:1, height:1, background: "var(--border)" }} />
            or continue with
            <div style={{ flex:1, height:1, background: "var(--border)" }} />
          </div>

          {/* Social login */}
          <div style={{ display:"flex", gap:10 }}>
            <button
              className="social-btn"
              onClick={() => googleLogin()}
              disabled={gLoading}
              style={{ opacity: gLoading ? 0.6 : 1 }}
            >
              {gLoading ? (
                <>
                  <Spinner size={14} />
                  Signing in…
                </>
              ) : (
                <>
                  {/* Google icon */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.68 3.68 0 01-1.6 2.41v2h2.58c1.51-1.39 2.4-3.44 2.4-5.87z" fill="#4285F4"/>
                    <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.59-2a4.78 4.78 0 01-7.15-2.5H.96v2.06A8 8 0 008 16z" fill="#34A853"/>
                    <path d="M3.56 9.56A4.8 4.8 0 013.31 8c0-.54.1-1.07.25-1.56V4.38H.96A8 8 0 000 8c0 1.29.31 2.51.96 3.62l2.6-2.06z" fill="#FBBC05"/>
                    <path d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.38-2.38A7.96 7.96 0 008 0a8 8 0 00-7.04 4.38l2.6 2.06A4.77 4.77 0 018 3.18z" fill="#EA4335"/>
                  </svg>
                  Google
                </>
              )}
            </button>
            <button className="social-btn">
              {/* GitHub icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: "var(--text-mid)" }}>
                <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Footer terms */}
          {!isLogin && (
            <p style={{ fontSize:"0.72rem", color: "var(--text-dim)", textAlign:"center", marginTop:20, lineHeight:1.6 }}>
              By creating an account you agree to our{" "}
              <span style={{ color: "var(--gold)", cursor:"pointer" }}>Terms of Service</span>
              {" "}and{" "}
              <span style={{ color: "var(--gold)", cursor:"pointer" }}>Privacy Policy</span>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
