const express = require('express');
const Visit = require('../models/Visit');
const { sendAgendaEmail } = require('../services/emailService');
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

// POST /api/visits/finalize
// Finalizes and saves visit to MongoDB and automatically sends agenda emails upon "Finish"
router.post('/visits/finalize', async (req, res) => {
  try {
    const { visitId, header = {}, visitors = [], topAttendees = [], agenda = [], startTime } = req.body;
    let visit;
    if (visitId) {
      visit = await Visit.findById(visitId);
    }
    if (!visit) {
      visit = new Visit();
    }

    // 1. Map Header
    visit.company_name = header.company || '';
    visit.visit_date = header.visitDate || '';
    visit.visit_start = header.visitStart || '09:00';
    visit.visit_end = header.visitEnd || '';
    visit.visit_advisor = header.visitAdvisor || '';
    visit.visit_no = header.visitNo || '';
    visit.visit_purpose = header.visitPurpose || '';

    // 2. Map Visitors
    visit.visitors = (visitors || []).map(v => ({
      title: v.title || 'Mr',
      name: v.name || '',
      designation: v.designation || '',
      company: v.company || '',
      dept: v.dept || '',
      visited_before: Boolean(v.visitedBefore),
      prev_visit_date: v.prevDate || ''
    }));

    // 3. Map Top Attendees
    visit.top_attendees = (topAttendees || []).map(a => ({
      name: a.name || '',
      role: a.role || '',
      email: a.email || '',
      schedule: a.schedule || {}
    }));

    // 4. Map Timed Agenda
    const start = startTime || header.visitStart || '09:00';
    let cursor = timeToMinutes(start);
    visit.agenda = (agenda || []).map((r, idx) => {
      const from = cursor;
      const dur = Number(r.durationMin || r.duration_min) || 10;
      cursor += dur;
      return {
        sort_order: idx + 1,
        area: r.area || '',
        activity_name: r.activity || r.activity_name || '',
        pic: r.pic || '',
        support_attendees: r.support_attendees || r.supportAttendees || r.support || '',
        duration_min: dur,
        from_time: r.from_time || minutesToTime(from),
        to_time: r.to_time || minutesToTime(cursor)
      };
    });

    visit.status = 'Generated';
    const saved = await visit.save();

    // 5. Automatically dispatch email to attendees upon Finish
    let emailResult = null;
    try {
      emailResult = await sendAgendaEmail(saved);
    } catch (e) {
      console.error('Finalize email dispatch warning:', e.message);
    }

    res.json({
      success: true,
      visit: saved,
      visitId: saved.id || saved._id,
      agenda: saved.agenda,
      emailResult
    });
  } catch (err) {
    console.error('Finalize visit error:', err);
    res.status(500).json({ error: 'Failed to finalize visit', detail: err.message });
  }
});

// POST /api/visits -> create a visit + its visitors + topAttendees
router.post('/visits', async (req, res) => {
  try {
    const { header = {}, visitors = [], topAttendees = [] } = req.body;

    const formattedVisitors = visitors.map(v => ({
      title: v.title || 'Mr',
      name: v.name || '',
      designation: v.designation || '',
      company: v.company || '',
      dept: v.dept || '',
      visited_before: Boolean(v.visitedBefore),
      prev_visit_date: v.prevDate || ''
    }));

    const formattedTopAttendees = topAttendees.map(a => ({
      name: a.name || '',
      role: a.role || '',
      email: a.email || '',
      schedule: a.schedule || {}
    }));

    const visit = new Visit({
      company_name: header.company || '',
      visit_date: header.visitDate || '',
      visit_start: header.visitStart || '09:00',
      visit_end: header.visitEnd || '',
      visit_advisor: header.visitAdvisor || '',
      visit_no: header.visitNo || '',
      visit_purpose: header.visitPurpose || '',
      status: 'Draft',
      visitors: formattedVisitors,
      top_attendees: formattedTopAttendees
    });

    const saved = await visit.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create visit', detail: err.message });
  }
});

// GET /api/visits -> List all visits
router.get('/visits', async (req, res) => {
  try {
    const visits = await Visit.find().sort({ createdAt: -1 });
    res.json(visits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch visits', detail: err.message });
  }
});

// GET /api/visits/:id -> Get single visit
router.get('/visits/:id', async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ error: 'Visit not found' });
    res.json(visit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch visit', detail: err.message });
  }
});

// PUT /api/visits/:id -> Update visit header, visitors, and topAttendees
router.put('/visits/:id', async (req, res) => {
  try {
    const { header, visitors, topAttendees } = req.body;
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ error: 'Visit not found' });

    if (header) {
      if (header.company !== undefined) visit.company_name = header.company;
      if (header.visitDate !== undefined) visit.visit_date = header.visitDate;
      if (header.visitStart !== undefined) visit.visit_start = header.visitStart;
      if (header.visitEnd !== undefined) visit.visit_end = header.visitEnd;
      if (header.visitAdvisor !== undefined) visit.visit_advisor = header.visitAdvisor;
      if (header.visitNo !== undefined) visit.visit_no = header.visitNo;
      if (header.visitPurpose !== undefined) visit.visit_purpose = header.visitPurpose;
    }

    if (visitors) {
      visit.visitors = visitors.map(v => ({
        title: v.title || 'Mr',
        name: v.name || '',
        designation: v.designation || '',
        company: v.company || '',
        dept: v.dept || '',
        visited_before: Boolean(v.visitedBefore),
        prev_visit_date: v.prevDate || ''
      }));
    }

    if (topAttendees) {
      visit.top_attendees = topAttendees.map(a => ({
        name: a.name || '',
        role: a.role || '',
        email: a.email || '',
        schedule: a.schedule || {}
      }));
    }

    await visit.save();
    res.json({ success: true, visit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update visit', detail: err.message });
  }
});

// PUT /api/visits/:id/complete -> Update review points, photos & set status to Completed (Enforce 24h lock)
router.put('/visits/:id/complete', async (req, res) => {
  try {
    const { reviewPoints, photos, status = 'Completed' } = req.body;
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ error: 'Visit not found' });

    // Check if locked (> 24 hours since completed)
    if (visit.status === 'Completed') {
      const refTime = visit.completed_at || visit.createdAt || visit.visit_date;
      if (refTime) {
        const refDate = new Date(refTime);
        if (!isNaN(refDate.getTime())) {
          const diffHours = (Date.now() - refDate.getTime()) / (1000 * 60 * 60);
          if (diffHours >= 24) {
            return res.status(403).json({
              error: 'This visit was completed over 24 hours ago and is locked in read-only mode.'
            });
          }
        }
      }
    }

    const photosArr = Array.isArray(photos) ? photos : (typeof photos === 'string' ? JSON.parse(photos || '[]') : []);

    visit.review_points = reviewPoints || '';
    visit.photos = photosArr;
    visit.status = status;

    if (status === 'Completed' && !visit.completed_at) {
      visit.completed_at = new Date();
    }

    await visit.save();
    res.json({ success: true, visit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update visit status', detail: err.message });
  }
});

module.exports = router;
