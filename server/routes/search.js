const express = require('express');
const Visit = require('../models/Visit');
const router = express.Router();

// GET /api/visitors/suggestions?q=...
router.get('/visitors/suggestions', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) return res.json([]);

  try {
    const regex = new RegExp(q.trim(), 'i');

    const visits = await Visit.find({ 'visitors.name': regex })
      .sort({ visit_date: -1, createdAt: -1 })
      .limit(30);

    const map = new Map();

    visits.forEach(v => {
      (v.visitors || []).forEach(vis => {
        if (vis.name && regex.test(vis.name)) {
          const key = vis.name.toLowerCase().trim();
          if (!map.has(key)) {
            map.set(key, {
              title: vis.title || 'Mr',
              name: vis.name,
              designation: vis.designation || '',
              company: vis.company || v.company_name || '',
              dept: vis.dept || '',
              prev_visit_date: v.visit_date || '',
              total_visits: 1
            });
          } else {
            const entry = map.get(key);
            entry.total_visits += 1;
            if (!entry.prev_visit_date && v.visit_date) {
              entry.prev_visit_date = v.visit_date;
            }
          }
        }
      });
    });

    const suggestions = Array.from(map.values()).slice(0, 10);
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Suggestion search failed', detail: err.message });
  }
});

// GET /api/visitors/lookup?name=...
router.get('/visitors/lookup', async (req, res) => {
  const { name } = req.query;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

  try {
    const trimmed = name.trim();
    const regexExact = new RegExp(`^${trimmed}$`, 'i');
    const regexFuzzy = new RegExp(trimmed, 'i');

    let visit = await Visit.findOne({ 'visitors.name': regexExact }).sort({ visit_date: -1, createdAt: -1 });

    if (!visit) {
      visit = await Visit.findOne({ 'visitors.name': regexFuzzy }).sort({ visit_date: -1, createdAt: -1 });
    }

    if (!visit) {
      return res.status(404).json({ found: false, message: 'No previous visit records found' });
    }

    const matchedVisitor = (visit.visitors || []).find(v => regexFuzzy.test(v.name)) || {};

    res.json({
      found: true,
      title: matchedVisitor.title || 'Mr',
      name: matchedVisitor.name,
      designation: matchedVisitor.designation || '',
      company: matchedVisitor.company || visit.company_name || '',
      dept: matchedVisitor.dept || '',
      prev_visit_date: visit.visit_date || '',
      company_name: visit.company_name || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lookup failed', detail: err.message });
  }
});

// GET /api/visitors/search?field=name|company|designation|all&q=...
router.get('/visitors/search', async (req, res) => {
  const { field = 'all', q = '' } = req.query;

  try {
    const visits = await Visit.find().sort({ createdAt: -1 }).limit(100);
    const results = [];

    const searchStr = (q || '').toLowerCase().trim();

    visits.forEach(v => {
      (v.visitors || []).forEach(vis => {
        let isMatch = true;

        if (searchStr) {
          if (field === 'name') {
            isMatch = (vis.name || '').toLowerCase().includes(searchStr);
          } else if (field === 'company') {
            isMatch = (vis.company || '').toLowerCase().includes(searchStr) ||
              (v.company_name || '').toLowerCase().includes(searchStr);
          } else if (field === 'designation') {
            isMatch = (vis.designation || '').toLowerCase().includes(searchStr);
          } else {
            isMatch = (vis.name || '').toLowerCase().includes(searchStr) ||
              (vis.company || '').toLowerCase().includes(searchStr) ||
              (v.company_name || '').toLowerCase().includes(searchStr) ||
              (vis.designation || '').toLowerCase().includes(searchStr);
          }
        }

        if (isMatch) {
          results.push({
            id: vis._id ? vis._id.toString() : vis.id,
            visit_id: v._id.toString(),
            title: vis.title || 'Mr',
            name: vis.name,
            designation: vis.designation || '',
            visitor_company: vis.company || v.company_name || '',
            dept: vis.dept || '',
            visited_before: vis.visited_before ? 1 : 0,
            visit_date: v.visit_date,
            visit_advisor: v.visit_advisor,
            company_name: v.company_name,
            visit_no: v.visit_no,
            status: v.status,
            review_points: v.review_points,
            photos: v.photos
          });
        }
      });
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed', detail: err.message });
  }
});

module.exports = router;
