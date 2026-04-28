const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mikacode-stack.github.io"
  ],
  methods: ["GET", "POST", "PUT"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Serve built frontend in production
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ---------- DATA FILES ----------
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const AGENDA_FILE = path.join(DATA_DIR, 'agenda.json');
const ANNOUNCEMENT_FILE = path.join(DATA_DIR, 'announcement.json');

// Default agenda
const DEFAULT_AGENDA = [
  {
    day: "Friday", date: "08/05", label: "Day 1 — Arrival & Icebreakers",
    sessions: [
      { id: "f1", time: "18:00", end: "19:00", title: "Departure from Port Louis", type: "logistics", facilitator: "", status: "upcoming" },
      { id: "f2", time: "19:00", end: "20:00", title: "Arrival + Registration", type: "logistics", facilitator: "Secretary + Finance Team", status: "upcoming" },
      { id: "f3", time: "20:00", end: "20:30", title: "Camp Set-up", type: "logistics", facilitator: "", status: "upcoming" },
      { id: "f4", time: "20:30", end: "21:15", title: "Dinner", type: "break", facilitator: "", status: "upcoming" },
      { id: "f5", time: "21:15", end: "21:45", title: "Ice-Breaking", type: "fun", facilitator: "", status: "upcoming" },
      { id: "f6", time: "21:45", end: "22:30", title: "Safe from Harm", type: "plenary", facilitator: "SfH Team", status: "upcoming" },
      { id: "f7", time: "22:30", end: "23:00", title: "Night Games", type: "fun", facilitator: "", status: "upcoming" },
      { id: "f8", time: "23:00", end: "23:15", title: "Announcements + Dismiss", type: "workshop", facilitator: "", status: "upcoming" },
    ],
  },
  {
    day: "Saturday", date: "09/05", label: "Day 2 — Main Forum",
    sessions: [
      { id: "s1", time: "07:00", end: "08:00", title: "Wake-Up / Breakfast", type: "break", facilitator: "", status: "upcoming" },
      { id: "s2", time: "08:00", end: "08:30", title: "Opening Ceremony", type: "forum", facilitator: "", status: "upcoming" },
      { id: "s3", time: "08:30", end: "09:15", title: "DYSC 24-26 Report", type: "plenary", facilitator: "Michael + Anne Sophie", status: "upcoming" },
      { id: "s4", time: "09:15", end: "10:00", title: "Resolutions & Recommendations", type: "plenary", facilitator: "Michael + Lucasse", status: "upcoming" },
      { id: "s5", time: "10:00", end: "10:15", title: "Tea and Free Time", type: "break", facilitator: "", status: "upcoming" },
      { id: "s6", time: "10:15", end: "12:15", title: "Expressing with Impact", type: "plenary", facilitator: "Michael Pompeia", status: "upcoming" },
      { id: "s7", time: "12:15", end: "13:00", title: "Lunch", type: "break", facilitator: "", status: "upcoming" },
      { id: "s8", time: "13:00", end: "14:30", title: "Workshop Session 1", type: "workshop", facilitator: "Darel / Axel / Kovalan / Jeremie C", status: "upcoming" },
      { id: "s9", time: "14:30", end: "15:00", title: "Mini Break", type: "break", facilitator: "", status: "upcoming" },
      { id: "s10", time: "15:00", end: "16:45", title: "Workshop Session 2", type: "workshop", facilitator: "Darel / Axel / Kovalan / Jeremie C", status: "upcoming" },
      { id: "s11", time: "16:45", end: "17:00", title: "Tea and Free Time", type: "break", facilitator: "", status: "upcoming" },
      { id: "s12", time: "17:00", end: "18:30", title: "Heritage and Innovation — Panel", type: "plenary", facilitator: "", status: "upcoming" },
      { id: "s13", time: "18:30", end: "19:30", title: "Res & Rec Writing", type: "forum", facilitator: "Michael + Lucasse", status: "upcoming" },
      { id: "s14", time: "19:30", end: "20:30", title: "Elections Process Guidelines", type: "plenary", facilitator: "Michael + Lucasse", status: "upcoming" },
      { id: "s15", time: "20:30", end: "21:30", title: "Dinner", type: "break", facilitator: "", status: "upcoming" },
      { id: "s16", time: "21:30", end: "23:00", title: "Theme Night", type: "fun", facilitator: "", status: "upcoming" },
      { id: "s17", time: "23:00", end: "23:30", title: "Lights Out", type: "forum", facilitator: "", status: "upcoming" },
    ],
  },
  {
    day: "Sunday", date: "10/05", label: "Day 3 — Elections & Closing",
    sessions: [
      { id: "u1", time: "07:00", end: "08:00", title: "Breakfast", type: "break", facilitator: "", status: "upcoming" },
      { id: "u2", time: "08:00", end: "09:15", title: "From Potential to Action", type: "forum", facilitator: "", status: "upcoming" },
      { id: "u3", time: "09:15", end: "10:00", title: "Presentation of Candidates", type: "plenary", facilitator: "Michael + Anne Sophie + NYSC", status: "upcoming" },
      { id: "u4", time: "10:00", end: "10:30", title: "Free Time", type: "fun", facilitator: "", status: "upcoming" },
      { id: "u5", time: "10:30", end: "12:00", title: "Elections + Res Voting", type: "forum", facilitator: "Michael + Anne Sophie + NYSC", status: "upcoming" },
      { id: "u6", time: "12:00", end: "12:45", title: "Lunch", type: "break", facilitator: "", status: "upcoming" },
      { id: "u7", time: "12:45", end: "13:30", title: "Closing Ceremony", type: "forum", facilitator: "", status: "upcoming" },
    ],
  },
];

function readAgenda() {
  try {
    if (fs.existsSync(AGENDA_FILE)) {
      const savedAgenda = JSON.parse(fs.readFileSync(AGENDA_FILE, 'utf8'));

      // Fix old/wrong first date automatically
      if (savedAgenda?.[0]?.date === "2026-08-05") {
        savedAgenda[0].date = "08/05";
        writeAgenda(savedAgenda);
      }

      return savedAgenda;
    }
  } catch (e) {
    console.error('Error reading agenda:', e);
  }

  fs.writeFileSync(AGENDA_FILE, JSON.stringify(DEFAULT_AGENDA, null, 2));
  return DEFAULT_AGENDA;
}
function readAnnouncement() {
  try {
    if (fs.existsSync(ANNOUNCEMENT_FILE)) {
      return JSON.parse(fs.readFileSync(ANNOUNCEMENT_FILE, 'utf8')).text || "";
    }
  } catch (e) {}
  return "";
}

function writeAnnouncement(text) {
  fs.writeFileSync(ANNOUNCEMENT_FILE, JSON.stringify({ text, updated: new Date().toISOString() }));
}

// ---------- API ROUTES ----------

// GET agenda (for participants polling)
app.get('/api/agenda', (req, res) => {
  res.json({ agenda: readAgenda(), announcement: readAnnouncement() });
});

// PUT agenda (admin saves full agenda)
app.put('/api/agenda', (req, res) => {
  const { agenda } = req.body;
  if (!agenda) return res.status(400).json({ error: 'Missing agenda data' });
  writeAgenda(agenda);
  res.json({ ok: true });
});

// PUT announcement
app.put('/api/announcement', (req, res) => {
  const { text } = req.body;
  writeAnnouncement(text || "");
  res.json({ ok: true });
});

// POST admin login
app.post('/api/login', (req, res) => {
  const { pin } = req.body;
  const ADMIN_PIN = process.env.ADMIN_PIN || "2026";
  if (pin === ADMIN_PIN) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Invalid PIN' });
  }
});

// Catch-all: serve frontend for any non-API route (production)
if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🏕️  DYSF Agenda server running at http://localhost:${PORT}`);
  console.log(`   Admin PIN: ${process.env.ADMIN_PIN || "2026"}`);
  console.log(`   Data stored in: ${DATA_DIR}\n`);
});
