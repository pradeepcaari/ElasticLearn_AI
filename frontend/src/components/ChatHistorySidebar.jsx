import { useState } from "react";

export default function ChatHistorySidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onCloseSidebar,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (e) {
      return "";
    }
  };

  return (
    <div
      style={{
        width: 280,
        background: "var(--page-bg-subtle)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 10,
      }}
    >
      {/* Sidebar Header with New Chat Button & Collapse Button */}
      <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={onNewChat}
          className="btn-primary"
          style={{
            flex: 1,
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: "0.9rem",
            fontWeight: 600,
            background: "linear-gradient(135deg, var(--accent) 0%, #d946ef 100%)",
            border: "none",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(170, 59, 255, 0.2)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(170, 59, 255, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(170, 59, 255, 0.2)";
          }}
        >
          {/* Plus Icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
          New Chat
        </button>

        {/* Collapse Button */}
        <button
          onClick={onCloseSidebar}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 10,
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-mid)",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-h)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-mid)"; }}
        >
          {/* Chevron Left / Collapse Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Sessions List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ fontSize: "0.75rem", color: "var(--text-mid)", padding: "0 8px 8px", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
          Recent Chats
        </div>
        {sessions.length === 0 ? (
          <div style={{ padding: "20px 8px", textAlign: "center", color: "var(--text-mid)", fontSize: "0.85rem", fontStyle: "italic" }}>
            No recent chats
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = currentSessionId === session.session_id;
            const isHovered = hoveredId === session.session_id;

            return (
              <div
                key={session.session_id}
                onClick={() => onSelectSession(session.session_id)}
                onMouseEnter={() => setHoveredId(session.session_id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  padding: "12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: isActive
                    ? "var(--accent-bg)"
                    : isHovered
                    ? "rgba(255, 255, 255, 0.03)"
                    : "transparent",
                  borderLeft: `3px solid ${isActive ? "var(--accent)" : "transparent"}`,
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
              >
                {/* Chat Bubble Icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isActive ? "var(--accent)" : "var(--text-mid)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, transition: "stroke 0.2s ease" }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>

                {/* Session Title & Date */}
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--text-h)" : "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      lineHeight: "1.2rem",
                    }}
                  >
                    {session.session_title}
                  </div>
                  {session.timestamp && (
                    <div style={{ fontSize: "0.7rem", color: "var(--text-mid)", marginTop: 2 }}>
                      {formatDate(session.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
