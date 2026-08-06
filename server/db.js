const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'visitor.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS area_master (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_name TEXT NOT NULL,
  icon TEXT,
  color_hex TEXT,
  display_order INTEGER
);

CREATE TABLE IF NOT EXISTS sub_area_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_id INTEGER REFERENCES area_master(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  default_pic TEXT,
  default_duration_min INTEGER,
  sort_order INTEGER
);

CREATE TABLE IF NOT EXISTS transit_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  default_pic TEXT,
  default_duration_min INTEGER
);

CREATE TABLE IF NOT EXISTS visitor_visit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT,
  visit_date TEXT,
  visit_start TEXT,
  visit_end TEXT,
  visit_advisor TEXT,
  visit_no TEXT,
  visit_purpose TEXT,
  status TEXT DEFAULT 'Draft',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS visitor_detail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id INTEGER REFERENCES visitor_visit(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Mr',
  name TEXT,
  designation TEXT,
  company TEXT,
  dept TEXT,
  visited_before INTEGER DEFAULT 0,
  prev_visit_date TEXT
);

CREATE TABLE IF NOT EXISTS agenda_row (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visit_id INTEGER REFERENCES visitor_visit(id) ON DELETE CASCADE,
  sort_order INTEGER,
  area TEXT,
  activity_name TEXT,
  pic TEXT,
  duration_min INTEGER,
  from_time TEXT,
  to_time TEXT
);
`);

// Add 'title' column if upgrading from old DB (safe to run on existing DB)
try {
  db.exec(`ALTER TABLE visitor_detail ADD COLUMN title TEXT DEFAULT 'Mr'`);
} catch (_) { /* column already exists, ignore */ }

try {
  db.exec(`ALTER TABLE visitor_visit ADD COLUMN review_points TEXT`);
} catch (_) { /* column already exists, ignore */ }

try {
  db.exec(`ALTER TABLE visitor_visit ADD COLUMN photos TEXT`);
} catch (_) { /* column already exists, ignore */ }

try {
  db.exec(`ALTER TABLE visitor_visit ADD COLUMN completed_at TEXT`);
} catch (_) { /* column already exists, ignore */ }

module.exports = db;


