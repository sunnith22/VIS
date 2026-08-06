require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');


const areasRouter     = require('./routes/areas');
const visitsRouter    = require('./routes/visits');
const agendaRouter    = require('./routes/agenda');
const dashboardRouter = require('./routes/dashboard');
const searchRouter    = require('./routes/search');
const feedbackRouter  = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ── API routes ──
app.use('/api', areasRouter);
app.use('/api', visitsRouter);
app.use('/api', agendaRouter);
app.use('/api', dashboardRouter);
app.use('/api', searchRouter);
app.use('/api', feedbackRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Serve built React app ──
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// SPA fallback — all routes (including /feedback) serve index.html
// and React's main.jsx handles the routing client-side
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ TIEI Visitor Management System running at http://localhost:${PORT}`);
});
