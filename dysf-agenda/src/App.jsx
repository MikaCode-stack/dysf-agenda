import { useState, useEffect, useCallback } from "react";

const TYPE_CONFIG = {
  plenary: {
    color: "#D4A017",
    bg: "rgba(212,160,23,0.12)",
    label: "Plenary",
    icon: "\u{1F3A4}",
  },
  workshop: {
    color: "#1B9AAA",
    bg: "rgba(27,154,170,0.10)",
    label: "Workshop",
    icon: "\u{1F6E0}",
  },
  forum: {
    color: "#2D6A4F",
    bg: "rgba(45,106,79,0.10)",
    label: "Forum",
    icon: "\u{1F3DB}",
  },
  fun: {
    color: "#E07A5F",
    bg: "rgba(224,122,95,0.10)",
    label: "Fun",
    icon: "\u{1F389}",
  },
  break: {
    color: "#8D99AE",
    bg: "rgba(141,153,174,0.08)",
    label: "Break",
    icon: "\u{2615}",
  },
  logistics: {
    color: "#7B2D8E",
    bg: "rgba(123,45,142,0.10)",
    label: "Logistics",
    icon: "\u{1F68C}",
  },
};
const BACKGROUND_IMAGE = "url('public/background.jpg')";

const glassCard = {
  background: "rgba(250,250,245,0.88)",
  backdropFilter: "blur(8px)",
  border: "2px solid rgba(255,255,255,0.45)",
  boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
};

const SESSION_TYPES = [
  "plenary",
  "workshop",
  "forum",
  "fun",
  "break",
  "logistics",
];

/* ========== API HELPERS ========== */
async function fetchAgenda() {
  const res = await fetch("/api/agenda");
  return res.json();
}
async function saveAgenda(agenda) {
  await fetch("/api/agenda", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agenda }),
  });
}
async function saveAnnouncement(text) {
  await fetch("/api/announcement", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}
async function loginAdmin(pin) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  return res.ok;
}

/* ========== SHARED COMPONENTS ========== */
const ScoutLogo = () => (
  <img
    src="./public/logo.png"
    alt="worldscouting"
    style={{ width: 200, height: 70, borderRadius: 8, objectFit: "contain" }}
  />
);

const ChevronArrows = () => (
  <img
    src="./public/arrows.png"
    alt="arrows"
    style={{ width: 200, height: 70, borderRadius: 8, objectFit: "contain" }}
  />
);

/* ========== ADMIN LOGIN ========== */
function AdminLogin({ onLogin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const ok = await loginAdmin(pin);
    setLoading(false);
    if (ok) {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAFAF5",
        fontFamily: "'Nunito', sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "40px 32px",
          maxWidth: 340,
          width: "100%",
          textAlign: "center",
          border: "2px solid #F0EDE4",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <ScoutLogo />
        </div>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28,
            color: "#1B6B93",
            margin: "0 0 6px",
            letterSpacing: 2,
          }}
        >
          Admin Access
        </h2>
        <p style={{ fontSize: 13, color: "#999", margin: "0 0 24px" }}>
          Enter your PIN to manage the agenda
        </p>
        <input
          type="password"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="PIN"
          style={{
            width: "100%",
            padding: "14px 16px",
            fontSize: 20,
            textAlign: "center",
            border: error ? "2px solid #ef4444" : "2px solid #E8E8E0",
            borderRadius: 12,
            outline: "none",
            fontFamily: "'Space Mono', monospace",
            letterSpacing: 8,
            background: "#FAFAF5",
            boxSizing: "border-box",
          }}
        />
        {error && (
          <p style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>
            Incorrect PIN
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #1B9AAA, #1B6B93)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Checking..." : "Enter"}
        </button>
      </div>
    </div>
  );
}

/* ========== ADMIN PANEL ========== */
function AdminPanel({ agenda, setAgenda, onLogout }) {
  const [activeDay, setActiveDay] = useState(0);
  const [announcement, setAnnouncementLocal] = useState("");
  const [editingSession, setEditingSession] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSession, setNewSession] = useState({
    time: "",
    end: "",
    title: "",
    type: "plenary",
    facilitator: "",
  });

  useEffect(() => {
    fetchAgenda().then((d) => setAnnouncementLocal(d.announcement || ""));
  }, []);

  const persist = async (updated) => {
    setSaving(true);
    setAgenda(updated);
    await saveAgenda(updated);
    setSaving(false);
  };

  const toggleStatus = async (si) => {
    const updated = JSON.parse(JSON.stringify(agenda));
    const s = updated[activeDay].sessions[si];
    if (s.status === "upcoming") s.status = "active";
    else if (s.status === "active") s.status = "completed";
    else s.status = "upcoming";
    await persist(updated);
  };

  const markAllUpTo = async (si) => {
    const updated = JSON.parse(JSON.stringify(agenda));
    updated[activeDay].sessions.forEach((s, i) => {
      if (i < si) s.status = "completed";
      else if (i === si) s.status = "active";
    });
    await persist(updated);
  };

  const deleteSession = async (si) => {
    const updated = JSON.parse(JSON.stringify(agenda));
    updated[activeDay].sessions.splice(si, 1);
    await persist(updated);
  };

  const addSession = async () => {
    if (!newSession.time || !newSession.end || !newSession.title) return;
    const updated = JSON.parse(JSON.stringify(agenda));
    updated[activeDay].sessions.push({
      ...newSession,
      id: `c_${Date.now()}`,
      status: "upcoming",
    });
    updated[activeDay].sessions.sort((a, b) => a.time.localeCompare(b.time));
    await persist(updated);
    setNewSession({
      time: "",
      end: "",
      title: "",
      type: "plenary",
      facilitator: "",
    });
    setShowAdd(false);
  };

  const saveEditFn = async () => {
    if (!editingSession) return;
    const updated = JSON.parse(JSON.stringify(agenda));
    const idx = updated[activeDay].sessions.findIndex(
      (s) => s.id === editingSession.id,
    );
    if (idx !== -1) {
      updated[activeDay].sessions[idx] = {
        ...updated[activeDay].sessions[idx],
        ...editingSession,
      };
      updated[activeDay].sessions.sort((a, b) => a.time.localeCompare(b.time));
    }
    await persist(updated);
    setEditingSession(null);
  };

  const handleAnnouncementSave = async () => {
    await saveAnnouncement(announcement);
  };

  const resetAll = async () => {
    const updated = JSON.parse(JSON.stringify(agenda));
    updated[activeDay].sessions.forEach((s) => (s.status = "upcoming"));
    await persist(updated);
  };

  const day = agenda[activeDay];
  const inputStyle = {
    padding: "10px 12px",
    borderRadius: 10,
    border: "2px solid #E8E8E0",
    fontSize: 13,
    fontFamily: "'Nunito', sans-serif",
    outline: "none",
    background: "#FAFAF5",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        fontFamily: "'Nunito', sans-serif",
        minHeight: "100vh",
        background: "#F5F5F0",
        color: "#2B2B2B",
      }}
    >
      {/* Admin header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1B6B93, #1B9AAA)",
          padding: "20px 20px 18px",
        }}
      >
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                color: "#fff",
                margin: 0,
                letterSpacing: 2,
              }}
            >
              DYSF Admin Panel
            </h1>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                margin: "2px 0 0",
              }}
            >
              Manage the live agenda · Changes are instant for participants
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {saving && (
              <span style={{ fontSize: 11, color: "#E8C547", fontWeight: 700 }}>
                Saving...
              </span>
            )}
            <button
              onClick={onLogout}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "2px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: 700, margin: "0 auto", padding: "20px 20px 40px" }}
      >
        {/* Announcement */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
            border: "2px solid #F0EDE4",
          }}
        >
          <label
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#D4A017",
              textTransform: "uppercase",
              letterSpacing: 1,
              display: "block",
              marginBottom: 8,
            }}
          >
            Live Announcement Banner
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={announcement}
              onChange={(e) => setAnnouncementLocal(e.target.value)}
              placeholder="e.g. Workshop 1 moved to Room B"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={handleAnnouncementSave}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "none",
                background: "#D4A017",
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Push
            </button>
            <button
              onClick={() => {
                setAnnouncementLocal("");
                saveAnnouncement("");
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "2px solid #E8E8E0",
                background: "transparent",
                color: "#999",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Day tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {agenda.map((d, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveDay(i);
                setEditingSession(null);
                setShowAdd(false);
              }}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 12,
                border: activeDay === i ? "none" : "2px solid #F0EDE4",
                background:
                  activeDay === i
                    ? "linear-gradient(135deg, #1B9AAA, #1B6B93)"
                    : "#fff",
                color: activeDay === i ? "#fff" : "#777",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                boxShadow:
                  activeDay === i
                    ? "0 4px 16px rgba(27,154,170,0.2)"
                    : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {d.day}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  opacity: 0.8,
                  marginTop: 2,
                }}
              >
                {d.date}
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => {
              setShowAdd(!showAdd);
              setEditingSession(null);
            }}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "2px solid #1B9AAA",
              background: showAdd ? "rgba(27,154,170,0.08)" : "transparent",
              color: "#1B9AAA",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + Add Session
          </button>
          <button
            onClick={resetAll}
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              border: "2px solid #E8E8E0",
              background: "transparent",
              color: "#999",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Reset Day
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 18,
              marginBottom: 16,
              border: "2px solid #1B9AAA",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: 14,
                fontWeight: 800,
                color: "#1B6B93",
              }}
            >
              New Session
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <input
                value={newSession.time}
                onChange={(e) =>
                  setNewSession((p) => ({ ...p, time: e.target.value }))
                }
                placeholder="Start (e.g. 09:00)"
                style={inputStyle}
              />
              <input
                value={newSession.end}
                onChange={(e) =>
                  setNewSession((p) => ({ ...p, end: e.target.value }))
                }
                placeholder="End (e.g. 10:00)"
                style={inputStyle}
              />
            </div>
            <input
              value={newSession.title}
              onChange={(e) =>
                setNewSession((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Session title"
              style={{ ...inputStyle, marginBottom: 10 }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <select
                value={newSession.type}
                onChange={(e) =>
                  setNewSession((p) => ({ ...p, type: e.target.value }))
                }
                style={inputStyle}
              >
                {SESSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_CONFIG[t].label}
                  </option>
                ))}
              </select>
              <input
                value={newSession.facilitator}
                onChange={(e) =>
                  setNewSession((p) => ({ ...p, facilitator: e.target.value }))
                }
                placeholder="Facilitator"
                style={inputStyle}
              />
            </div>
            <button
              onClick={addSession}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #1B9AAA, #1B6B93)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Add to {day.day}
            </button>
          </div>
        )}

        {/* Edit form */}
        {editingSession && (
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 18,
              marginBottom: 16,
              border: "2px solid #D4A017",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: 14,
                fontWeight: 800,
                color: "#D4A017",
              }}
            >
              Edit Session
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <input
                value={editingSession.time}
                onChange={(e) =>
                  setEditingSession((p) => ({ ...p, time: e.target.value }))
                }
                style={inputStyle}
              />
              <input
                value={editingSession.end}
                onChange={(e) =>
                  setEditingSession((p) => ({ ...p, end: e.target.value }))
                }
                style={inputStyle}
              />
            </div>
            <input
              value={editingSession.title}
              onChange={(e) =>
                setEditingSession((p) => ({ ...p, title: e.target.value }))
              }
              style={{ ...inputStyle, marginBottom: 10 }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <select
                value={editingSession.type}
                onChange={(e) =>
                  setEditingSession((p) => ({ ...p, type: e.target.value }))
                }
                style={inputStyle}
              >
                {SESSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_CONFIG[t].label}
                  </option>
                ))}
              </select>
              <input
                value={editingSession.facilitator}
                onChange={(e) =>
                  setEditingSession((p) => ({
                    ...p,
                    facilitator: e.target.value,
                  }))
                }
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={saveEditFn}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  background: "#D4A017",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingSession(null)}
                style={{
                  padding: "12px 20px",
                  borderRadius: 12,
                  border: "2px solid #E8E8E0",
                  background: "transparent",
                  color: "#999",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Sessions */}
        {day.sessions.map((session, si) => {
          const cfg = TYPE_CONFIG[session.type] || TYPE_CONFIG.logistics;
          const isDone = session.status === "completed";
          const isActive = session.status === "active";
          return (
            <div
              key={session.id}
              style={{
                display: "flex",
                alignItems: "stretch",
                marginBottom: 8,
                borderRadius: 14,
                overflow: "hidden",
                background: "#fff",
                border: isActive ? "2.5px solid #1B9AAA" : "2px solid #F0EDE4",
                opacity: isDone ? 0.5 : 1,
              }}
            >
              <button
                onClick={() => toggleStatus(si)}
                style={{
                  width: 78,
                  minHeight: 62,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  background: isActive
                    ? "linear-gradient(135deg, #1B9AAA, #1B6B93)"
                    : isDone
                      ? "#22c55e"
                      : cfg.color,
                  padding: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 20,
                    color: "#fff",
                    letterSpacing: 1.5,
                    lineHeight: 1,
                  }}
                >
                  {session.time}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 700,
                    marginTop: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {session.status === "upcoming"
                    ? "TAP"
                    : session.status === "active"
                      ? "LIVE"
                      : "DONE"}
                </span>
              </button>
              <div
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: "#2B2B2B",
                      textDecoration: isDone ? "line-through" : "none",
                      marginBottom: 3,
                    }}
                  >
                    {session.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        background: cfg.bg,
                        color: cfg.color,
                        textTransform: "uppercase",
                      }}
                    >
                      {cfg.icon} {cfg.label}
                    </span>
                    {session.facilitator && (
                      <span style={{ fontSize: 11, color: "#999" }}>
                        {session.facilitator}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingSession({ ...session });
                    setShowAdd(false);
                  }}
                  title="Edit"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "2px solid #E8E8E0",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    flexShrink: 0,
                  }}
                >
                  ✎
                </button>
                <button
                  onClick={() => markAllUpTo(si)}
                  title="Set as current"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "2px solid #E8E8E0",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    flexShrink: 0,
                  }}
                >
                  ▶
                </button>
                <button
                  onClick={() => deleteSession(si)}
                  title="Delete"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "2px solid #fecaca",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ef4444",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========== PARTICIPANT VIEW ========== */
function ParticipantView({ agenda, activeDay, setActiveDay, announcement }) {
  const day = agenda[activeDay];
  const getProgress = () => {
    let done = day.sessions.filter((s) => s.status === "completed").length;
    return Math.round((done / day.sessions.length) * 100);
  };
  const currentSession = (() => {
    for (let di = 0; di < agenda.length; di++) {
      const s = agenda[di].sessions.find((s) => s.status === "active");
      if (s) return { dayIndex: di, session: s };
    }
    return null;
  })();

  return (
    <div
      style={{
        fontFamily: "'Nunito', sans-serif",
        minHeight: "100vh",
        background: "#FAFAF5",
        color: "#2B2B2B",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <svg
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 160,
          pointerEvents: "none",
          zIndex: 0,
        }}
        viewBox="0 0 800 160"
        preserveAspectRatio="none"
      >
        <path
          d="M0,160 L0,90 L180,30 L320,110 L480,15 L640,80 L800,25 L800,160 Z"
          fill="none"
          stroke="#1B9AAA"
          strokeWidth="3"
          opacity="0.18"
        />
        <path
          d="M0,160 L0,120 L160,55 L340,130 L500,40 L660,100 L800,50 L800,160 Z"
          fill="none"
          stroke="#D4A017"
          strokeWidth="2.5"
          opacity="0.12"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -80,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #D4A017 0%, #E8C547 30%, transparent 65%)",
          opacity: 0.2,
          pointerEvents: "none",
        }}
      />

      {/* Banner Wrapper */}
      <div
        style={{
          backgroundImage: "url('background.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
        {/* Header */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "30px 20px 18px",
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 46,
                  lineHeight: 0.92,
                  margin: 0,
                  color: "#1B6B93",
                  letterSpacing: 2,
                }}
              >
                DYSF
                <br />
                Edition 2K26
              </h1>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  padding: "4px 16px",
                  background: "#D4A017",
                  color: "#fff",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 15,
                  letterSpacing: 3,
                  borderRadius: 4,
                }}
              >
                LIVE AGENDA
              </div>
            </div>
            <ScoutLogo />
          </div>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 14, color: "#333" }}>
              May 8 – 10, 2026 &nbsp;·&nbsp; Pointe Jerome
            </span>
            {currentSession && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: "rgba(34,197,94,0.1)",
                  border: "1.5px solid rgba(34,197,94,0.35)",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#16a34a",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#22c55e",
                    animation: "pulse 2s infinite",
                  }}
                />{" "}
                LIVE
              </span>
            )}
          </div>
          <div style={{ marginTop: 12 }}>
            <ChevronArrows />
          </div>

          {announcement && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background:
                  "linear-gradient(135deg, rgba(212,160,23,0.08), rgba(212,160,23,0.15))",
                border: "2px solid #D4A017",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                color: "#B8860B",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>{"\u{1F4E2}"}</span>
              {announcement}
            </div>
          )}

          {currentSession && (
            <div
              style={{
                marginTop: 14,
                padding: "14px 18px",
                background:
                  "linear-gradient(135deg, rgba(27,107,147,0.06), rgba(212,160,23,0.06))",
                border: "2px solid #1B9AAA",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span style={{ fontSize: 26 }}>
                {TYPE_CONFIG[currentSession.session.type]?.icon}
              </span>
              <div>
                <div
                  style={{ fontWeight: 900, fontSize: 16, color: "#1B6B93" }}
                >
                  {currentSession.session.title}
                </div>
                <div style={{ fontSize: 12, color: "#777", fontWeight: 600 }}>
                  {currentSession.session.time} – {currentSession.session.end} ·{" "}
                  {agenda[currentSession.dayIndex].day}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Day tabs & sessions */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 700,
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {agenda.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 10,
                border: "none",
                background:
                  activeDay === i
                    ? "linear-gradient(135deg, #1B9AAA, #1B6B93)"
                    : "#ECEADE",
                color: activeDay === i ? "#fff" : "#777",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                boxShadow:
                  activeDay === i ? "0 4px 16px rgba(27,154,170,0.25)" : "none",
              }}
            >
              {d.day}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 7,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#999" }}>
              {day.label}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: "#D4A017",
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: 1.5,
              }}
            >
              {getProgress()}%
            </span>
          </div>
          <div
            style={{
              height: 8,
              background: "#E8E8E0",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${getProgress()}%`,
                background: "linear-gradient(90deg, #D4A017, #E8C547)",
                borderRadius: 999,
                transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
        </div>

        <div style={{ paddingBottom: 140 }}>
          {day.sessions.map((session) => {
            const cfg = TYPE_CONFIG[session.type] || TYPE_CONFIG.logistics;
            const isDone = session.status === "completed";
            const isActive = session.status === "active";
            return (
              <div
                key={session.id}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  marginBottom: 8,
                  borderRadius: 14,
                  overflow: "hidden",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(27,107,147,0.05), rgba(212,160,23,0.05))"
                    : "#fff",
                  border: isActive
                    ? "2.5px solid #1B9AAA"
                    : "2px solid #F0EDE4",
                  opacity: isDone ? 0.4 : 1,
                  boxShadow: isActive
                    ? "0 6px 24px rgba(27,154,170,0.12)"
                    : "0 1px 4px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  style={{
                    width: 78,
                    minHeight: 62,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: isActive
                      ? "linear-gradient(135deg, #1B9AAA, #1B6B93)"
                      : isDone
                        ? "#C4C4BA"
                        : cfg.color,
                    padding: "8px 6px",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 22,
                      color: "#fff",
                      letterSpacing: 1.5,
                      lineHeight: 1,
                    }}
                  >
                    {session.time}
                  </span>
                  {isActive && (
                    <span
                      style={{
                        fontSize: 8,
                        color: "rgba(255,255,255,0.9)",
                        fontWeight: 800,
                        marginTop: 3,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      NOW
                    </span>
                  )}
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: isActive ? "#1B6B93" : "#2B2B2B",
                        textDecoration: isDone ? "line-through" : "none",
                        marginBottom: 4,
                      }}
                    >
                      {session.title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 9px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          background: cfg.bg,
                          color: cfg.color,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                      {session.facilitator && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#999",
                            fontWeight: 600,
                          }}
                        >
                          {session.facilitator}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: isDone
                        ? "2.5px solid #1B9AAA"
                        : isActive
                          ? "2.5px solid #1B9AAA"
                          : "2.5px solid #E0DDD4",
                      background: isDone
                        ? "rgba(27,154,170,0.1)"
                        : isActive
                          ? "rgba(27,154,170,0.08)"
                          : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      color: "#1B9AAA",
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? "\u2713" : isActive ? "\u25CF" : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 700,
          margin: "0 auto",
          padding: "0 20px 20px",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
        }}
      >
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "#999",
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 4,
                background: cfg.color,
                display: "inline-block",
              }}
            />
            {cfg.label}
          </div>
        ))}
      </div>
      <div
        style={{
          textAlign: "center",
          padding: "0 20px 28px",
          fontSize: 11,
          color: "#ccc",
          fontFamily: "'Space Mono', monospace",
          position: "relative",
          zIndex: 1,
        }}
      >
        Live agenda · Updates automatically
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}

/* ========== MAIN APP ========== */
export default function App() {
  const [mode, setMode] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);

  // Initial load
  useEffect(() => {
    fetchAgenda().then((d) => {
      setAgenda(d.agenda);
      setAnnouncement(d.announcement || "");
      setLoading(false);
    });
  }, []);

  // Poll for updates in participant mode (every 5s)
  useEffect(() => {
    if (mode !== "participant") return;
    const iv = setInterval(() => {
      fetchAgenda().then((d) => {
        setAgenda(d.agenda);
        setAnnouncement(d.announcement || "");
      });
    }, 5000);
    return () => clearInterval(iv);
  }, [mode]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAF5",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <ScoutLogo />
          <p style={{ marginTop: 16, color: "#999", fontWeight: 700 }}>
            Loading agenda...
          </p>
        </div>
      </div>
    );
  }

  if (mode === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Nunito', sans-serif",
          padding: 20,
          backgroundImage: BACKGROUND_IMAGE,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 380,
            width: "100%",
            padding: "34px 24px",
            borderRadius: 22,
            ...glassCard,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <ScoutLogo />
          </div>

          <h1
            style={{
              fontFamily: "'Scouts GT Planar', sans-serif",
              fontStyle: "oblique",
              fontWeight: "bold",
              fontSize: 40,
              color: "#1B6B93",
              margin: "0 0 4px",
              letterSpacing: 2,
              lineHeight: 0.95,
            }}
          >
            DYSF
            <br />
            Edition 2K26
          </h1>

          <div
            style={{
              display: "inline-block",
              margin: "8px 0 24px",
              padding: "4px 16px",
              background: "#D4A017",
              color: "#fff",
              fontFamily: "'Noto Sans', sans-serif",
              fontSize: 14,
              letterSpacing: 3,
              borderRadius: 4,
            }}
          >
            LIVE AGENDA
          </div>

          <p
            style={{
              color: "#999",
              fontFamily: "'Noto Sans', sans-serif",
              fontSize: 14,
              marginBottom: 28,
            }}
          >
            Bienveni dan DYSF 2026🎉
          </p>

          <button
            onClick={() => setMode("participant")}
            style={{
              width: "100%",
              padding: "18px",
              marginBottom: 12,
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #1B9AAA, #1B6B93)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 6px 24px rgba(27,154,170,0.25)",
            }}
          >
            {"\u{1F4F1}"} I'm a Participant
          </button>

          <button
            onClick={() => setMode("admin-login")}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 14,
              border: "2px solid #D4A017",
              background: "rgba(212,160,23,0.05)",
              color: "#D4A017",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {"\u{1F511}"} Admin Access
          </button>
        </div>
      </div>
    );
  }

  if (mode === "admin-login")
    return <AdminLogin onLogin={() => setMode("admin")} />;
  if (mode === "admin")
    return (
      <AdminPanel
        agenda={agenda}
        setAgenda={setAgenda}
        onLogout={() => setMode(null)}
      />
    );
  return (
    <ParticipantView
      agenda={agenda}
      activeDay={activeDay}
      setActiveDay={setActiveDay}
      announcement={announcement}
    />
  );
}
