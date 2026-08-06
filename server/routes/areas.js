const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/areas  -> { areas: [...], subAreas: [...], transit: [...] }
router.get('/areas', (req, res) => {
  const areas = db.prepare(`SELECT * FROM area_master ORDER BY display_order`).all();
  const subAreas = db.prepare(`SELECT * FROM sub_area_item ORDER BY area_id, sort_order`).all();
  const transit = db.prepare(`SELECT * FROM transit_item`).all();
  res.json({ areas, subAreas, transit });
});

module.exports = router;
