# 🏕️ DYSF Edition 2K26 — Live Agenda

A real-time forum agenda with **admin controls** and a **read-only participant view**.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run in development mode
```bash
npm run dev
```
This starts both the backend (port 3001) and frontend (port 5173).

Open **http://localhost:5173** in your browser.

### 3. How it works

- **Participants** open the link and tap "I'm a Participant" — they see a read-only live agenda that auto-refreshes every 5 seconds.
- **Admin** (you) taps "Admin Access" and enters the PIN (default: `2026`).

### Admin Features
| Action | How |
|--------|-----|
| Mark progress | Tap the colored time block: upcoming → active → completed |
| Jump to session | Hit ▶ to mark everything before it as done |
| Edit session | Hit ✎ to change title, time, type, facilitator |
| Add session | Click "+ Add Session" |
| Delete session | Hit ✕ |
| Push announcement | Type a message and hit "Push" — appears for all participants |
| Reset day | Sets all sessions back to "upcoming" |

### Change the Admin PIN
```bash
ADMIN_PIN=mySecretPin npm run dev
```

## Deploy for the Forum

### Option A: Run on a laptop at the venue
1. Connect your laptop to the venue WiFi
2. Run `npm run dev`
3. Find your laptop's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
4. Share `http://YOUR_IP:3001` with participants (e.g. via QR code)

### Option B: Deploy to the cloud (Render, Railway, etc.)
```bash
npm run build
npm start
```
The `npm start` command serves both the API and the built frontend on port 3001.

Set the `PORT` environment variable if your host requires a specific port.
Set `ADMIN_PIN` as an environment variable to change the admin PIN.

## Data Storage

All data is stored as JSON files in `server/data/`:
- `agenda.json` — the full agenda with session statuses
- `announcement.json` — the current live announcement

You can edit `agenda.json` directly to bulk-update the agenda.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Express.js
- **Storage**: JSON files (no database needed)
