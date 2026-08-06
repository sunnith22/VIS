const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/visitors/suggestions?q=...
router.get('/visitors/suggestions', (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) return res.json([]);

  try {
    const rows = db.prepare(`
      SELECT 
        vd.title, 
        vd.name, 
        vd.designation, 
        vd.company, 
        vd.dept, 
        MAX(vv.visit_date) AS prev_visit_date,
        COUNT(vd.id) AS total_visits
      FROM visitor_detail vd
      JOIN visitor_visit vv ON vd.visit_id = vv.id
      WHERE vd.name LIKE ?
      GROUP BY LOWER(TRIM(vd.name))
      ORDER BY prev_visit_date DESC
      LIMIT 10
    `).all(`%${q.trim()}%`);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Suggestion search failed', detail: e.message });
  }
});

// GET /api/visitors/lookup?name=...
router.get('/visitors/lookup', (req, res) => {
  const { name } = req.query;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

  try {
    const trimmed = name.trim();
    // Try exact match first
    let row = db.prepare(`
      SELECT 
        vd.title, 
        vd.name, 
        vd.designation, 
        vd.company, 
        vd.dept, 
        vv.visit_date AS prev_visit_date,
        vv.company_name
      FROM visitor_detail vd
      JOIN visitor_visit vv ON vd.visit_id = vv.id
      WHERE LOWER(TRIM(vd.name)) = LOWER(TRIM(?))
      ORDER BY vv.visit_date DESC, vd.id DESC
      LIMIT 1
    `).get(trimmed);

    // Fallback to fuzzy prefix match
    if (!row) {
      row = db.prepare(`
        SELECT 
          vd.title, 
          vd.name, 
          vd.designation, 
          vd.company, 
          vd.dept, 
          vv.visit_date AS prev_visit_date,
          vv.company_name
        FROM visitor_detail vd
        JOIN visitor_visit vv ON vd.visit_id = vv.id
        WHERE vd.name LIKE ?
        ORDER BY vv.visit_date DESC, vd.id DESC
        LIMIT 1
      `).get(`%${trimmed}%`);
    }

    if (!row) return res.status(444).json({ found: false, message: 'No previous visit records found' });

    res.json({ found: true, ...row });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Lookup failed', detail: e.message });
  }
});

// GET /api/visitors/search?field=name|company|designation|all&q=...
router.get('/visitors/search', (req, res) => {
  const { field = 'all', q = '' } = req.query;

  try {
    let sql = `
      SELECT
        vd.id, vd.visit_id, vd.title, vd.name, vd.designation,
        vd.company AS visitor_company, vd.dept, vd.visited_before,
        vv.visit_date, vv.visit_advisor, vv.company_name, vv.visit_no, vv.status, vv.review_points, vv.photos
      FROM visitor_detail vd
      JOIN visitor_visit vv ON vd.visit_id = vv.id
    `;
    const params = [];
    if (q && q.trim()) {
      const searchStr = `%${q.trim()}%`;
      if (field === 'company') {
        sql += ` WHERE (vd.company LIKE ? OR vv.company_name LIKE ?)`;
        params.push(searchStr, searchStr);
      } else if (field === 'name') {
        sql += ` WHERE vd.name LIKE ?`;
        params.push(searchStr);
      } else if (field === 'designation') {
        sql += ` WHERE vd.designation LIKE ?`;
        params.push(searchStr);
      } else {
        sql += ` WHERE (vd.name LIKE ? OR vd.company LIKE ? OR vv.company_name LIKE ? OR vd.designation LIKE ?)`;
        params.push(searchStr, searchStr, searchStr, searchStr);
      }
    }
    sql += ` ORDER BY vv.id DESC, vv.visit_date DESC LIMIT 100`;

    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed', detail: e.message });
  }
});


module.exports = router;

