const express = require('express');
const Area = require('../models/Area');
const Transit = require('../models/Transit');
const router = express.Router();

// GET /api/areas -> { areas: [...], subAreas: [...], transit: [...] }
router.get('/areas', async (req, res) => {
  try {
    const areaDocs = await Area.find().sort({ order: 1 });
    const transitDocs = await Transit.find();

    // Map to frontend expected shape
    const areas = [];
    const subAreas = [];

    areaDocs.forEach(a => {
      areas.push({
        id: a._id.toString(),
        area_name: a.name,
        icon: a.icon,
        color_hex: a.color,
        display_order: a.order
      });

      (a.subs || []).forEach(s => {
        subAreas.push({
          id: s._id.toString(),
          area_id: a._id.toString(),
          activity_name: s.name,
          default_pic: s.pic,
          default_duration_min: s.min,
          sort_order: s.order
        });
      });
    });

    const transit = transitDocs.map(t => ({
      id: t._id.toString(),
      label: t.label,
      default_pic: t.pic,
      default_duration_min: t.min
    }));

    res.json({ areas, subAreas, transit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch areas', detail: err.message });
  }
});

module.exports = router;
