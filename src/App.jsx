/**
 * App.jsx — Root router for ElasticLearn AI.
 * Now includes SmoothCursor globally so it appears on every page.
 * Wrapped with ThemeProvider for light/dark mode support.
 *
 * Page flow:
 *   login → landing → diagnostic → result → learning
 */
import { useState, useCallback } from "react";
import { GlobalStyles } from "./styles/tokens";
import { ThemeProvider } from "./context/ThemeContext";
import SmoothCursor from "./components/SmoothCursor";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import DiagnosticPage from "./pages/DiagnosticPage";
import ResultPage from "./pages/ResultPage";
import LearningPage from "./pages/LearningPage";

// ─── Cursor hide CSS ──────────────────────────────────────────────────────────
// Hides the browser's default cursor so only our gold one shows.
// Injected as a style tag here so it's always present when the app loads.
const CURSOR_CSS = `
  /* Hide default cursor everywhere */
  *, *::before, *::after {
    cursor: none !important;
  }

  /* Exception: keep the text I-beam cursor inside text inputs and textareas.
     Remove these two lines if you want to hide the caret cursor too. */
  input, textarea, [contenteditable] {
    cursor: text !important;
  }
`;

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("foundation");
  const [gaps, setGaps] = useState([]);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    setScreen("landing");
  }, []);

  const handleDiagnosticComplete = useCallback((detectedLevel, detectedGaps) => {
    setMode(detectedLevel);
    setGaps(detectedGaps);
    setScreen("result");
  }, []);

  return (
    <ThemeProvider>
      {/* ── Global design tokens + animations ── */}
      <GlobalStyles />

      {/* ── Hide the default browser cursor ── */}
      <style>{CURSOR_CSS}</style>

      {/* ── Gold smooth cursor — renders on top of every page ── */}
      {/* springConfig options:
          · Default (balanced):   damping:45  stiffness:400  mass:1
          · Snappy/responsive:    damping:60  stiffness:600  mass:0.8
          · Floaty/laggy:         damping:20  stiffness:150  mass:1.5
          · Heavy/dramatic:       damping:30  stiffness:200  mass:2   */}
      <SmoothCursor
        springConfig={{
          damping: 45,
          stiffness: 400,
          mass: 1,
          restDelta: 0.001,
        }}
      />

      {/* ── Page router ── */}
      {screen === "login" && <LoginPage onLogin={handleLogin} />}
      {screen === "landing" && <LandingPage onStart={() => setScreen("diagnostic")} user={user} />}
      {screen === "diagnostic" && <DiagnosticPage onComplete={handleDiagnosticComplete} />}
      {screen === "result" && <ResultPage level={mode} gaps={gaps} onContinue={() => setScreen("learning")} />}
      {screen === "learning" && <LearningPage mode={mode} gaps={gaps} user={user} onModeChange={setMode} />}
    </ThemeProvider>
  );
}
