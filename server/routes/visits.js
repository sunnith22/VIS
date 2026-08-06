const express = require('express');
const db = require('../db');
const router = express.Router();

// POST /api/visits  -> create a visit + its visitors
router.post('/visits', (req, res) => {
  const { header, visitors = [] } = req.body;

  const tx = db.transaction(() => {
    const info = db.prepare(`
      INSERT INTO visitor_visit
        (company_name, visit_date, visit_start, visit_end, visit_advisor, visit_no, visit_purpose, status)
      VALUES (?,?,?,?,?,?,?,'Draft')
    `).run(
      header.company || '',
      header.visitDate || '',
      header.visitStart || '09:00',
      header.visitEnd || '',
      header.visitAdvisor || '',
      header.visitNo || '',
      header.visitPurpose || ''
    );
    const visitId = info.lastInsertRowid;

    const insVisitor = db.prepare(`
      INSERT INTO visitor_detail (visit_id, title, name, designation, company, dept, visited_before, prev_visit_date)
      VALUES (?,?,?,?,?,?,?,?)
    `);
    for (const v of visitors) {
      insVisitor.run(
        visitId,
        v.title || 'Mr',
        v.name || '',
        v.designation || '',
        v.company || '',
        v.dept || '',
        v.visitedBefore ? 1 : 0,
        v.prevDate || null
      );
    }
    return visitId;
  });

  const visitId = tx();
  const visit = db.prepare(`SELECT * FROM visitor_visit WHERE id = ?`).get(visitId);
  res.json(visit);
});

// GET /api/visits
router.get('/visits', (req, res) => {
  const visits = db.prepare(`SELECT * FROM visitor_visit ORDER BY id DESC`).all();
  res.json(visits);
});

// GET /api/visits/:id
router.get('/visits/:id', (req, res) => {
  const visit = db.prepare(`SELECT * FROM visitor_visit WHERE id = ?`).get(req.params.id);
  if (!visit) return res.status(404).json({ error: 'Visit not found' });
  const visitors = db.prepare(`SELECT * FROM visitor_detail WHERE visit_id = ?`).all(req.params.id);
  res.json({ ...visit, visitors });
});

// PUT /api/visits/:id
router.put('/visits/:id', (req, res) => {
  const { header, visitors } = req.body;
  const id = req.params.id;

  const tx = db.transaction(() => {
    if (header) {
      db.prepare(`
        UPDATE visitor_visit SET
          company_name=?, visit_date=?, visit_start=?, visit_end=?,
          visit_advisor=?, visit_no=?, visit_purpose=?
        WHERE id=?
      `).run(
        header.company || '', header.visitDate || '', header.visitStart || '09:00',
        header.visitEnd || '', header.visitAdvisor || '', header.visitNo || '',
        header.visitPurpose || '', id
      );
    }
    if (visitors) {
      db.prepare(`DELETE FROM visitor_detail WHERE visit_id=?`).run(id);
      const ins = db.prepare(`
        INSERT INTO visitor_detail (visit_id, title, name, designation, company, dept, visited_before, prev_visit_date)
        VALUES (?,?,?,?,?,?,?,?)
      `);
      for (const v of visitors) {
        ins.run(id, v.title || 'Mr', v.name || '', v.designation || '', v.company || '', v.dept || '', v.visitedBefore ? 1 : 0, v.prevDate || null);
      }
    }
  });
  tx();
  res.json({ success: true });
});

// PUT /api/visits/:id/complete -> Update review points, photos & set status to Completed
router.put('/visits/:id/complete', (req, res) => {
  const { reviewPoints, photos, status = 'Completed' } = req.body;
  const id = req.params.id;

  try {
    const existing = db.prepare(`SELECT * FROM visitor_visit WHERE id = ?`).get(id);
    if (!existing) return res.status(404).json({ error: 'Visit not found' });

    // Check if locked (> 24 hours since completed)
    if (existing.status === 'Completed') {
      const refTime = existing.completed_at || existing.created_at || existing.visit_date;
      if (refTime) {
        const refDate = new Date(refTime);
        if (!isNaN(refDate.getTime())) {
          const diffHours = (Date.now() - refDate.getTime()) / (1000 * 60 * 60);
          if (diffHours >= 24) {
            return res.status(403).json({ error: 'This visit was completed over 24 hours ago and is locked in read-only mode.' });
          }
        }
      }
    }

    const photosStr = typeof photos === 'string' ? photos : JSON.stringify(photos || []);
    
    // Set completed_at timestamp if completing for the first time
    let completedAtVal = existing.completed_at;
    if (status === 'Completed' && !completedAtVal) {
      completedAtVal = new Date().toISOString();
    }

    db.prepare(`
      UPDATE visitor_visit 
      SET review_points = ?, photos = ?, status = ?, completed_at = ?
      WHERE id = ?
    `).run(reviewPoints || '', photosStr, status, completedAtVal, id);

    const updated = db.prepare(`SELECT * FROM visitor_visit WHERE id = ?`).get(id);
    res.json({ success: true, visit: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update visit status', detail: e.message });
  }
});

module.exports = router;


