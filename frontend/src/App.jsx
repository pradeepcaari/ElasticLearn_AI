/**
 * App.jsx — Root router for ElasticLearn AI.
 * Now includes SmoothCursor globally so it appears on every page.
 * Wrapped with ThemeProvider for light/dark mode support.
 *
 * Page flow (via react-router-dom):
 *   /login → / (landing) → /diagnostic → /result → /learning
 */
import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GlobalStyles } from "./styles/tokens";
import { ThemeProvider } from "./context/ThemeContext";
import SmoothCursor from "./components/SmoothCursor";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import DiagnosticPage from "./pages/DiagnosticPage";
import ResultPage from "./pages/ResultPage";
import LearningPage from "./pages/LearningPage";
import ProfilePage from "./pages/ProfilePage";

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

// ─── Protected Route wrapper ──────────────────────────────────────────────────
// Redirects to /login when user is not authenticated.
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => loadJSON("el_user", null));
  const [mode, setMode] = useState(() => loadJSON("el_mode", "foundation"));
  const [gaps, setGaps] = useState(() => loadJSON("el_gaps", []));

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("el_user", JSON.stringify(userData));
  }, []);

  const handleDiagnosticComplete = useCallback((detectedLevel, detectedGaps) => {
    setMode(detectedLevel);
    setGaps(detectedGaps);
    localStorage.setItem("el_mode", JSON.stringify(detectedLevel));
    localStorage.setItem("el_gaps", JSON.stringify(detectedGaps));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setMode("foundation");
    setGaps([]);
  }, []);

  const handleUpdateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("el_user", JSON.stringify(updatedUser));
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

      {/* ── URL-based page router ── */}
      <BrowserRouter>
        <Routes>
          {/* Public: login — redirect to landing if already logged in */}
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
          } />

          {/* Protected: landing */}
          <Route path="/" element={
            <ProtectedRoute user={user}>
              <LandingPage user={user} />
            </ProtectedRoute>
          } />

          {/* Protected: diagnostic quiz */}
          <Route path="/diagnostic" element={
            <ProtectedRoute user={user}>
              <DiagnosticPage onComplete={handleDiagnosticComplete} />
            </ProtectedRoute>
          } />

          {/* Protected: result reveal */}
          <Route path="/result" element={
            <ProtectedRoute user={user}>
              <ResultPage level={mode} gaps={gaps} />
            </ProtectedRoute>
          } />

          {/* Protected: learning chat */}
          <Route path="/learning" element={
            <ProtectedRoute user={user}>
              <LearningPage mode={mode} gaps={gaps} user={user} onModeChange={(m) => { setMode(m); localStorage.setItem("el_mode", JSON.stringify(m)); }} />
            </ProtectedRoute>
          } />


          {/* Protected: user profile & settings */}
          <Route path="/profile" element={
            <ProtectedRoute user={user}>
              <ProfilePage user={user} mode={mode} gaps={gaps} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
            </ProtectedRoute>
          } />

          {/* Wildcard: redirect unknown paths to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
