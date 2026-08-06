# TIEI Visitor Management System

A full-stack web app: React (Vite) frontend + Node/Express backend + SQLite database.

---

## 🚀 How to Deploy (Step-by-Step)

### Option A — Run on a Company PC / Local Server (Simplest)

**Requirements:** Node.js 18+ installed on the PC.
Download from: https://nodejs.org

**Steps:**

1. Copy this entire folder to the server PC (e.g. `C:\VisitorApp\`)

2. Open Command Prompt and run:
```
cd C:\VisitorApp\server
npm install
```

3. Then build the React frontend:
```
cd C:\VisitorApp\client
npm install
npm run build
```

4. Start the server:
```
cd C:\VisitorApp\server
node server.js
```

5. Open browser on any PC on the same network:
```
http://<server-PC-IP-address>:4000
```
   To find your IP: open CMD → type `ipconfig` → look for IPv4 Address

6. To run 24/7 automatically, install PM2:
```
npm install -g pm2
pm2 start server.js --name visitor-app
pm2 startup
pm2 save
```

---

### Option B — Docker (Recommended for IT deployment)

**Requirements:** Docker Desktop installed.

```bash
docker-compose up --build -d
```

App runs at: http://localhost:4000

---

### Option C — Azure / Cloud Hosting

1. Push to GitHub
2. Create Azure App Service (Node 18 LTS)
3. Set build command: `cd client && npm install && npm run build`
4. Set start command: `cd server && npm install && node server.js`
5. App goes live at your Azure URL — accessible from anywhere

---

## 🔐 Default Login Credentials

| Username       | Password    | Role          |
|----------------|-------------|---------------|
| admin          | toyota2024  | Admin         |
| visit.advisor  | vis@2024    | Visit Advisor |
| reception      | recep@2024  | Reception     |

To add/change users: edit the `USERS` array in `client/src/Login.jsx`

---

## 📁 Project Structure

```
visitor-app/
├── client/          ← React frontend (Vite)
│   └── src/
│       ├── Login.jsx      ← Login screen
│       ├── App.jsx        ← App shell + session
│       ├── Screen1.jsx    ← Visit details + visitor table
│       ├── Screen2.jsx    ← Agenda builder + preview/print
│       └── api.js         ← API calls
├── server/          ← Node/Express backend
│   ├── server.js          ← Main server
│   ├── db.js              ← SQLite schema
│   ├── seed.js            ← Seed plant areas data
│   └── routes/
│       ├── visits.js
│       ├── areas.js
│       └── agenda.js
└── docker-compose.yml
```

---

## ⚙️ First Time Setup (Seed Plant Areas)

After starting the server for the first time, run the seed script to load plant areas:

```
cd server
node seed.js
```

This loads: Board Room, GD, TNGA, DOJO, Development Center, VIP Dining Hall

