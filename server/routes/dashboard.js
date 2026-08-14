const express = require('express');
const Visit = require('../models/Visit');
const Feedback = require('../models/Feedback');
const router = express.Router();

router.get('/dashboard/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo  = new Date(Date.now() - 7  * 86400000).toISOString().slice(0, 10);
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

    const [todayCount, weekCount, monthCount, fbCount] = await Promise.all([
      Visit.countDocuments({ visit_date: today }),
      Visit.countDocuments({ visit_date: { $gte: weekAgo } }),
      Visit.countDocuments({ visit_date: { $gte: monthAgo } }),
      Feedback.countDocuments()
    ]);

    res.json({
      today: todayCount,
      week: weekCount,
      month: monthCount,
      feedback: fbCount
    });
  } catch (err) {
    console.error(err);
    res.json({ today: 0, week: 0, month: 0, feedback: 0 });
  }
});

module.exports = router;
