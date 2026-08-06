const express = require('express');
const db = require('../db');
const router = express.Router();

// Create table matching the actual TIEI feedback sheet structure
db.exec(`
  CREATE TABLE IF NOT EXISTS visitor_feedback (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    company           TEXT,
    visit_date        TEXT,
    visit_time        TEXT,
    visit_purpose     TEXT,
    visitors_json     TEXT,       -- JSON array of visitor objects
    feedback_rows_json TEXT,      -- JSON array of {feedback, from} objects
    submitted_at      TEXT DEFAULT (datetime('now'))
  );
`);

// POST /api/feedback  — visitor submits the form
router.post('/feedback', (req, res) => {
  const { company, visit_date, visit_time, visit_purpose, visitors = [], feedback_rows = [] } = req.body;
  if (!company?.trim()) return res.status(400).json({ error: 'Company name is required' });
  try {
    db.prepare(`
      INSERT INTO visitor_feedback (company, visit_date, visit_time, visit_purpose, visitors_json, feedback_rows_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      company || '',
      visit_date || '',
      visit_time || '',
      visit_purpose || '',
      JSON.stringify(visitors),
      JSON.stringify(feedback_rows)
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to submit feedback', detail: e.message });
  }
});

// GET /api/feedback  — staff views all responses
router.get('/feedback', (req, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM visitor_feedback ORDER BY submitted_at DESC`).all();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch feedback', detail: e.message });
  }
});

module.exports = router;
