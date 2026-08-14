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

// POST /api/visits/:id/agenda
// Generates timed agenda & automatically triggers email to attendees
router.post('/visits/:id/agenda', async (req, res) => {
  try {
    const visitId = req.params.id;
    const { rows = [], startTime } = req.body;

    const visit = await Visit.findById(visitId);
    if (!visit) return res.status(404).json({ error: 'Visit not found' });

    const start = startTime || visit.visit_start || '09:00';
    let cursor = timeToMinutes(start);

    const agendaRows = rows.map((r, idx) => {
      const from = cursor;
      cursor += Number(r.durationMin || r.duration_min) || 0;
      return {
        sort_order: idx + 1,
        area: r.area || '',
        activity_name: r.activity || r.activity_name || '',
        pic: r.pic || '',
        support_attendees: r.support_attendees || r.supportAttendees || r.support || '',
        duration_min: Number(r.durationMin || r.duration_min) || 0,
        from_time: minutesToTime(from),
        to_time: minutesToTime(cursor)
      };
    });

    visit.agenda = agendaRows;
    visit.status = 'Generated';
    await visit.save();

    // Automatically trigger agenda email in the background without blocking response
    sendAgendaEmail(visit).catch(e => {
      console.error('Auto email dispatch warning:', e.message);
    });

    // Return array of agenda rows directly for 100% frontend compatibility
    res.json(visit.agenda);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save agenda', detail: err.message });
  }
});

// POST /api/visits/:id/send-email -> Manual/Resend agenda email
router.post('/visits/:id/send-email', async (req, res) => {
  try {
    const { recipients } = req.body;
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ error: 'Visit not found' });

    const result = await sendAgendaEmail(visit, recipients);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send agenda email', detail: err.message });
  }
});

// GET /api/visits/:id/agenda -> the saved, timed agenda rows
router.get('/visits/:id/agenda', async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ error: 'Visit not found' });
    res.json(visit.agenda || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch agenda', detail: err.message });
  }
});

// GET /api/visits/:id/full -> everything needed for the preview/print screen
router.get('/visits/:id/full', async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ error: 'Visit not found' });
    res.json({
      visit,
      visitors: visit.visitors || [],
      agenda: visit.agenda || [],
      top_attendees: visit.top_attendees || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch full visit', detail: err.message });
  }
});

module.exports = router;
