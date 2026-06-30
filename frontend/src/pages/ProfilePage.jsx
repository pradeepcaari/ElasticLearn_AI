/**
 * ProfilePage.jsx — User profile & settings page.
 * Sections: Profile info, Appearance, Learning prefs, Notifications, Account actions.
 * All settings persist to localStorage.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoldLine, MonoLabel, BrandMark } from "../components/Shared";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

// ─── Inline CSS ───────────────────────────────────────────────────────────────
const PAGE_CSS = `
  .profile-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: background 0.3s var(--ease), border-color 0.3s var(--ease);
  }
  .profile-section:hover {
    border-color: var(--gold);
  }
  .profile-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0;
  }
  .profile-row + .profile-row {
    border-top: 1px solid var(--border);
  }
  .profile-row-label {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .profile-row-title {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--cream-lt);
  }
  .profile-row-desc {
    font-size: 0.78rem;
    color: var(--text-dim);
    line-height: 1.5;
  }
  .profile-toggle {
    position: relative;
    width: 44px;
    height: 24px;
    border-radius: 99px;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  }
  .profile-toggle .toggle-knob {
    position: absolute;
    top: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }
  .profile-input {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 0.9rem;
    padding: 10px 14px;
    outline: none;
    transition: 0.22s cubic-bezier(0.4,0,0.2,1);
    width: 100%;
  }
  .profile-input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px var(--gold-dim);
  }
  .profile-input::placeholder { color: var(--text-dim); }
  .danger-zone {
    border-color: rgba(224,82,82,0.25) !important;
  }
  .danger-zone:hover {
    border-color: rgba(224,82,82,0.45) !important;
  }
  .btn-danger {
    background: rgba(224,82,82,0.1);
    color: var(--red);
    border: 1px solid rgba(224,82,82,0.3);
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 500;
    font-size: 0.85rem;
    cursor: pointer;
    transition: 0.22s ease;
    padding: 10px 24px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-danger:hover {
    background: rgba(224,82,82,0.18);
    border-color: rgba(224,82,82,0.5);
  }
  .confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease both;
  }
  .confirm-modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 32px;
    max-width: 420px;
    width: 90%;
    animation: fadeUp 0.3s ease both;
  }
  @media (max-width: 640px) {
    .profile-layout {
      grid-template-columns: 1fr !important;
    }
    .profile-header-inner {
      flex-direction: column !important;
      text-align: center !important;
    }
  }
`;

// ─── Toggle Switch Component ──────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      className="profile-toggle"
      onClick={() => onChange(!checked)}
      style={{
        background: checked
          ? "linear-gradient(135deg, var(--gold) 0%, var(--gold-lt) 100%)"
          : "rgba(128,128,128,0.2)",
      }}
    >
      <span
        className="toggle-knob"
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, children, delay = 0, className = "" }) {
  return (
    <div
      className={`profile-section ${className}`}
      style={{
        animation: `fadeUp 0.5s ease both`,
        animationDelay: `${delay}s`,
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 20, paddingBottom: 14,
        borderBottom: "1px solid var(--border)",
      }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--gold-dim)",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>
          {icon}
        </span>
        <span style={{
          fontSize: "0.82rem", fontWeight: 500,
          color: "var(--cream-lt)",
          letterSpacing: "0.02em",
        }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, danger }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.3rem",
          fontWeight: 600,
          color: danger ? "var(--red)" : "var(--cream-lt)",
          marginBottom: 10,
        }}>
          {title}
        </h3>
        <p style={{
          color: "var(--text-mid)",
          fontSize: "0.88rem",
          lineHeight: 1.6,
          marginBottom: 28,
        }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onCancel} style={{ padding: "10px 22px" }}>
            Cancel
          </button>
          <button
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
            style={{ padding: "10px 24px" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage({ user, mode, gaps, onLogout, onUpdateUser }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Local settings state (persisted to localStorage)
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || "");
  const [studyReminders, setStudyReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("el_study_reminders")) ?? true; } catch { return true; }
  });
  const [progressReports, setProgressReports] = useState(() => {
    try { return JSON.parse(localStorage.getItem("el_progress_reports")) ?? true; } catch { return true; }
  });
  const [autoDetectMode, setAutoDetectMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem("el_auto_detect")) ?? true; } catch { return true; }
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Inject page CSS
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "profile-css";
    el.textContent = PAGE_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  // Persist notification toggles
  useEffect(() => {
    localStorage.setItem("el_study_reminders", JSON.stringify(studyReminders));
  }, [studyReminders]);
  useEffect(() => {
    localStorage.setItem("el_progress_reports", JSON.stringify(progressReports));
  }, [progressReports]);
  useEffect(() => {
    localStorage.setItem("el_auto_detect", JSON.stringify(autoDetectMode));
  }, [autoDetectMode]);

  // Handle name save
  const handleSaveName = () => {
    if (nameValue.trim() && nameValue.trim() !== user?.name) {
      onUpdateUser({ ...user, name: nameValue.trim() });
    }
    setEditingName(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("el_user");
    localStorage.removeItem("el_mode");
    localStorage.removeItem("el_gaps");
    localStorage.removeItem("el_study_reminders");
    localStorage.removeItem("el_progress_reports");
    localStorage.removeItem("el_auto_detect");
    onLogout();
    navigate("/login");
  };

  const isFoundation = mode === "foundation";
  const memberSince = user?.joinedAt || "June 2025";

  return (
    <div className="noise-bg" style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse 60% 50% at 30% 20%, var(--page-bg-subtle) 0%, transparent 55%),
                   radial-gradient(ellipse 40% 40% at 80% 80%, rgba(201,168,76,0.04) 0%, transparent 60%),
                   var(--page-bg)`,
      position: "relative",
    }}>
      <GoldLine />

      {/* ── Top bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 60,
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        padding: "0 24px",
        background: "var(--nav-bg)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}>
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost"
          style={{ padding: "8px 14px", fontSize: "0.82rem", marginRight: 16 }}
        >
          ← Back
        </button>
        <BrandMark />
        <div style={{ flex: 1 }} />
      </div>

      {/* ── Content ── */}
      <div style={{
        maxWidth: 780,
        margin: "0 auto",
        padding: "40px 24px 80px",
      }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 40, animation: "fadeUp 0.4s ease both" }}>
          <MonoLabel>Settings</MonoLabel>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 2.8rem)",
            fontWeight: 600,
            color: "var(--cream-lt)",
            marginTop: 8,
            lineHeight: 1.1,
          }}>
            Your Profile
          </h1>
        </div>

        <div
          className="profile-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 20,
          }}
        >

          {/* ═══ Profile Info Section ═══ */}
          <Section title="Profile Information" icon="◉" delay={0.05}>
            <div className="profile-header-inner" style={{
              display: "flex", alignItems: "center", gap: 24,
              marginBottom: 24,
            }}>
              {/* Avatar */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, var(--gold) 0%, var(--gold-lt) 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", fontWeight: 600, color: "var(--page-bg)",
                boxShadow: "0 0 0 3px var(--page-bg), 0 0 0 5px rgba(201,168,76,0.3)",
              }}>
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  user?.name?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <div style={{ flex: 1 }}>
                {/* Editable name */}
                {editingName ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                    <input
                      className="profile-input"
                      value={nameValue}
                      onChange={e => setNameValue(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSaveName()}
                      autoFocus
                      style={{ maxWidth: 260 }}
                    />
                    <button className="btn-primary" onClick={handleSaveName} style={{ padding: "10px 18px", fontSize: "0.82rem" }}>
                      Save
                    </button>
                    <button className="btn-ghost" onClick={() => { setEditingName(false); setNameValue(user?.name || ""); }} style={{ padding: "10px 14px", fontSize: "0.82rem" }}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h2 style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: "var(--cream-lt)",
                    }}>
                      {user?.name || "User"}
                    </h2>
                    <button
                      onClick={() => setEditingName(true)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-dim)", padding: 4,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                      title="Edit name"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                )}
                <p style={{ fontSize: "0.85rem", color: "var(--text-mid)" }}>
                  {user?.email || "user@email.com"}
                </p>
                <span style={{
                  fontSize: "0.72rem",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                  marginTop: 6,
                  display: "inline-block",
                }}>
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </Section>

          {/* ═══ Appearance Section ═══ */}
          <Section title="Appearance" icon="◐" delay={0.1}>
            <div className="profile-row">
              <div className="profile-row-label">
                <span className="profile-row-title">Theme</span>
                <span className="profile-row-desc">
                  Switch between dark and light mode
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  fontSize: "0.78rem",
                  color: "var(--text-mid)",
                  fontFamily: "var(--font-mono)",
                  textTransform: "capitalize",
                }}>
                  {theme}
                </span>
                <ThemeToggle />
              </div>
            </div>
          </Section>

          {/* ═══ Learning Preferences Section ═══ */}
          <Section title="Learning Preferences" icon="⬡" delay={0.15}>
            {/* Current mode */}
            <div className="profile-row">
              <div className="profile-row-label">
                <span className="profile-row-title">Current Learning Mode</span>
                <span className="profile-row-desc">
                  {isFoundation
                    ? "Building from first principles with intuitive analogies"
                    : "Advanced theory and research-level challenges"
                  }
                </span>
              </div>
              <span className={`badge ${isFoundation ? "badge-foundation" : "badge-acceleration"}`}>
                <span style={{ fontSize: 8 }}>●</span>
                {isFoundation ? "Foundation" : "Acceleration"}
              </span>
            </div>

            {/* Auto-detect toggle */}
            <div className="profile-row">
              <div className="profile-row-label">
                <span className="profile-row-title">Auto-detect Mode</span>
                <span className="profile-row-desc">
                  Let AI automatically adjust your level based on responses
                </span>
              </div>
              <Toggle checked={autoDetectMode} onChange={setAutoDetectMode} />
            </div>

            {/* Retake diagnostic */}
            <div className="profile-row">
              <div className="profile-row-label">
                <span className="profile-row-title">Retake Diagnostic</span>
                <span className="profile-row-desc">
                  Re-assess your knowledge level with a new diagnostic quiz
                </span>
              </div>
              <button
                className="btn-ghost"
                onClick={() => navigate("/diagnostic")}
                style={{ padding: "8px 18px", fontSize: "0.82rem" }}
              >
                Retake →
              </button>
            </div>

            {/* Detected gaps */}
            {gaps && gaps.length > 0 && (
              <div style={{ paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <span style={{
                  fontSize: "0.75rem", color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
                  textTransform: "uppercase", display: "block", marginBottom: 10,
                }}>
                  Detected Knowledge Gaps
                </span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {gaps.map(g => (
                    <span key={g} style={{
                      padding: "4px 12px",
                      borderRadius: 99,
                      fontSize: "0.76rem",
                      background: "rgba(224,82,82,0.08)",
                      color: "var(--red)",
                      border: "1px solid rgba(224,82,82,0.22)",
                    }}>
                      ⚑ {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* ═══ Notifications Section ═══ */}
          <Section title="Notifications" icon="🔔" delay={0.2}>
            <div className="profile-row">
              <div className="profile-row-label">
                <span className="profile-row-title">Study Reminders</span>
                <span className="profile-row-desc">
                  Get daily reminders to continue your learning streak
                </span>
              </div>
              <Toggle checked={studyReminders} onChange={setStudyReminders} />
            </div>

            <div className="profile-row">
              <div className="profile-row-label">
                <span className="profile-row-title">Progress Reports</span>
                <span className="profile-row-desc">
                  Receive weekly summaries of your learning progress
                </span>
              </div>
              <Toggle checked={progressReports} onChange={setProgressReports} />
            </div>
          </Section>

          {/* ═══ Account Actions Section ═══ */}
          <Section title="Account" icon="⚙" delay={0.25}>
            {/* Logout */}
            <div className="profile-row">
              <div className="profile-row-label">
                <span className="profile-row-title">Sign Out</span>
                <span className="profile-row-desc">
                  Log out of your account on this device
                </span>
              </div>
              <button
                className="btn-ghost"
                onClick={() => setShowLogoutModal(true)}
                style={{ padding: "8px 22px", fontSize: "0.82rem" }}
              >
                Log Out
              </button>
            </div>
          </Section>

          {/* ═══ Danger Zone ═══ */}
          <Section title="Danger Zone" icon="⚠" delay={0.3} className="danger-zone">
            <div className="profile-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <div className="profile-row-label">
                <span className="profile-row-title" style={{ color: "var(--red)" }}>
                  Delete Account
                </span>
                <span className="profile-row-desc">
                  Permanently delete your account and all learning progress. This action cannot be undone.
                </span>
              </div>
              <button
                className="btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </button>
            </div>
          </Section>

        </div>
      </div>

      {/* ── Logout Modal ── */}
      {showLogoutModal && (
        <ConfirmModal
          title="Sign Out"
          message="Are you sure you want to sign out? You'll need to log in again to access your learning path."
          confirmLabel="Sign Out"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      {/* ── Delete Account Modal ── */}
      {showDeleteModal && (
        <ConfirmModal
          danger
          title="Delete Account"
          message="This will permanently delete your account and all your learning progress. This action cannot be undone."
          confirmLabel="Delete Forever"
          onConfirm={() => {
            // Placeholder: in production, call DELETE /api/user endpoint
            handleLogout();
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
