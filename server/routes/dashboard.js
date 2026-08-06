const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/dashboard/stats', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo  = new Date(Date.now() - 7  * 86400000).toISOString().slice(0, 10);
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

    const todayCount = db.prepare(`SELECT COUNT(*) as c FROM visitor_visit WHERE visit_date = ?`).get(today).c;
    const weekCount  = db.prepare(`SELECT COUNT(*) as c FROM visitor_visit WHERE visit_date >= ?`).get(weekAgo).c;
    const monthCount = db.prepare(`SELECT COUNT(*) as c FROM visitor_visit WHERE visit_date >= ?`).get(monthAgo).c;
    const fbCount    = db.prepare(`SELECT COUNT(*) as c FROM visitor_feedback`).get().c;

    res.json({ today: todayCount, week: weekCount, month: monthCount, feedback: fbCount });
  } catch (e) {
    console.error(e);
    res.json({ today: 0, week: 0, month: 0, feedback: 0 });
  }
});

module.exports = router;
