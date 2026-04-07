/**
 * ThemeToggle.jsx — Animated sun/moon toggle button.
 * Reads current theme from ThemeContext and provides a premium toggle experience.
 */
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        position: "relative",
        width: 48,
        height: 28,
        borderRadius: 99,
        border: "none",
        cursor: "pointer",
        padding: 0,
        background: isDark
          ? "linear-gradient(135deg, #1A3A6B 0%, #0B1628 100%)"
          : "linear-gradient(135deg, #87CEEB 0%, #FDB813 100%)",
        boxShadow: isDark
          ? "inset 0 1px 4px rgba(0,0,0,0.4), 0 0 12px rgba(201,168,76,0.15)"
          : "inset 0 1px 4px rgba(0,0,0,0.1), 0 0 12px rgba(253,184,19,0.25)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Track decorations — stars (dark) or clouds (light) */}
      <span
        style={{
          position: "absolute",
          top: 6,
          left: 8,
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: isDark ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.8)",
          transition: "all 0.4s ease",
          opacity: isDark ? 1 : 0.6,
          transform: isDark ? "scale(1)" : "scale(1.8)",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          width: 2,
          height: 2,
          borderRadius: "50%",
          background: isDark ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)",
          transition: "all 0.4s ease",
          opacity: isDark ? 1 : 0.5,
          transform: isDark ? "scale(1)" : "scale(2)",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 8,
          left: 20,
          width: 2,
          height: 2,
          borderRadius: "50%",
          background: isDark ? "rgba(255,255,255,0.3)" : "transparent",
          transition: "all 0.4s ease",
        }}
      />

      {/* Sliding knob with icon */}
      <span
        style={{
          position: "absolute",
          top: 2,
          left: isDark ? 2 : 22,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: isDark
            ? "linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%)"
            : "linear-gradient(135deg, #FDB813 0%, #FFDD57 100%)",
          boxShadow: isDark
            ? "0 2px 8px rgba(201,168,76,0.5)"
            : "0 2px 8px rgba(253,184,19,0.5)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Moon icon (dark mode) */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            position: "absolute",
            transition: "all 0.3s ease",
            opacity: isDark ? 1 : 0,
            transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
          }}
        >
          <path
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
            fill="#0B1628"
            stroke="#0B1628"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Sun icon (light mode) */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            position: "absolute",
            transition: "all 0.3s ease",
            opacity: isDark ? 0 : 1,
            transform: isDark ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
          }}
        >
          <circle cx="12" cy="12" r="5" fill="#7B4B00" stroke="#7B4B00" strokeWidth="1.5" />
          <line x1="12" y1="1" x2="12" y2="3" stroke="#7B4B00" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="21" x2="12" y2="23" stroke="#7B4B00" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#7B4B00" strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#7B4B00" strokeWidth="2" strokeLinecap="round" />
          <line x1="1" y1="12" x2="3" y2="12" stroke="#7B4B00" strokeWidth="2" strokeLinecap="round" />
          <line x1="21" y1="12" x2="23" y2="12" stroke="#7B4B00" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#7B4B00" strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#7B4B00" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
    </button>
  );
}
