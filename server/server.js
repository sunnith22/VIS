require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db');

const areasRouter     = require('./routes/areas');
const visitsRouter    = require('./routes/visits');
const agendaRouter    = require('./routes/agenda');
const dashboardRouter = require('./routes/dashboard');
const searchRouter    = require('./routes/search');
const feedbackRouter  = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// CORS configuration for decoupled Frontend on a separate server
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── API routes ──
app.use('/api', areasRouter);
app.use('/api', visitsRouter);
app.use('/api', agendaRouter);
app.use('/api', dashboardRouter);
app.use('/api', searchRouter);
app.use('/api', feedbackRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok', database: 'mongodb', time: new Date() }));

// ── Optional: Serve built React app if colocated ──
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.get('*', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) {
        res.json({ message: 'TIEI Visitor Management API running. Frontend hosted separately.' });
      }
    });
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ TIEI Visitor API Server running at http://localhost:${PORT}`);
});
