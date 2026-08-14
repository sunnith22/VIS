const express = require('express');
const Feedback = require('../models/Feedback');
const router = express.Router();

// POST /api/feedback — visitor submits the form
router.post('/feedback', async (req, res) => {
  const { company, visit_date, visit_time, visit_purpose, visitors = [], feedback_rows = [] } = req.body;
  if (!company?.trim()) return res.status(400).json({ error: 'Company name is required' });

  try {
    const fb = new Feedback({
      company: company.trim(),
      visit_date: visit_date || '',
      visit_time: visit_time || '',
      visit_purpose: visit_purpose || '',
      visitors,
      feedback_rows: feedback_rows.map(r => ({ feedback: r.feedback || '', from: r.from || '' })),
      submitted_at: new Date()
    });

    await fb.save();
    res.json({ success: true, feedback: fb });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit feedback', detail: err.message });
  }
});

// GET /api/feedback — staff views all responses
router.get('/feedback', async (req, res) => {
  try {
    const docs = await Feedback.find().sort({ submitted_at: -1 });

    // Format for frontend
    const rows = docs.map(d => ({
      id: d._id.toString(),
      company: d.company,
      visit_date: d.visit_date,
      visit_time: d.visit_time,
      visit_purpose: d.visit_purpose,
      visitors_json: JSON.stringify(d.visitors || []),
      feedback_rows_json: JSON.stringify(d.feedback_rows || []),
      submitted_at: d.submitted_at
    }));

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch feedback', detail: err.message });
  }
});

module.exports = router;
