const express = require('express');
const db = require('../db');
const router = express.Router();

function timeToMinutes(t) {
  const [h, m] = (t || '09:00').split(':').map(Number);
  return h * 60 + m;
}
function minutesToTime(m) {
  const hh = String(Math.floor(m / 60) % 24).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

// POST /api/visits/:id/agenda
// body: { rows: [{area, activity, pic, durationMin}], startTime: "09:00" }
// Server calculates From/To for every row (cascading) and saves them.
router.post('/visits/:id/agenda', (req, res) => {
  const visitId = req.params.id;
  const { rows = [], startTime } = req.body;

  const visit = db.prepare(`SELECT * FROM visitor_visit WHERE id=?`).get(visitId);
  if (!visit) return res.status(404).json({ error: 'Visit not found' });

  const start = startTime || visit.visit_start || '09:00';

  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM agenda_row WHERE visit_id=?`).run(visitId);

    const insRow = db.prepare(`
      INSERT INTO agenda_row (visit_id, sort_order, area, activity_name, pic, duration_min, from_time, to_time)
      VALUES (?,?,?,?,?,?,?,?)
    `);

    let cursor = timeToMinutes(start);
    rows.forEach((r, idx) => {
      const from = cursor;
      cursor += Number(r.durationMin) || 0;
      insRow.run(
        visitId, idx + 1, r.area, r.activity, r.pic || '',
        Number(r.durationMin) || 0, minutesToTime(from), minutesToTime(cursor)
      );
    });

    db.prepare(`UPDATE visitor_visit SET status='Generated' WHERE id=?`).run(visitId);
  });

  tx();

  const saved = db.prepare(`SELECT * FROM agenda_row WHERE visit_id=? ORDER BY sort_order`).all(visitId);
  res.json(saved);
});

// GET /api/visits/:id/agenda  -> the saved, timed agenda rows
router.get('/visits/:id/agenda', (req, res) => {
  const rows = db.prepare(`SELECT * FROM agenda_row WHERE visit_id=? ORDER BY sort_order`).all(req.params.id);
  res.json(rows);
});

// GET /api/visits/:id/full  -> everything needed for the preview/print screen
router.get('/visits/:id/full', (req, res) => {
  const visit = db.prepare(`SELECT * FROM visitor_visit WHERE id=?`).get(req.params.id);
  if (!visit) return res.status(404).json({ error: 'Visit not found' });
  const visitors = db.prepare(`SELECT * FROM visitor_detail WHERE visit_id=?`).all(req.params.id);
  const agenda = db.prepare(`SELECT * FROM agenda_row WHERE visit_id=? ORDER BY sort_order`).all(req.params.id);
  res.json({ visit, visitors, agenda });
});

module.exports = router;
