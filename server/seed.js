// Seeds Area Master, Sub Area Items and Transit Items with the actual
// Gemba Presentation details (from Visitors_Gemba_presentation.xlsx).
// Run once: node seed.js   (safe to re-run — it clears and re-inserts)

const db = require('./db');

const AREAS = [
  { name: "Board Room", icon: "🏛️", color: "#1565C0", order: 1, subs: [
    { name: "Company Profile",                                pic: "DMD",              min: 10 },
    { name: "HOD Introduction",                                pic: "DMD",              min: 5 },
    { name: "India Business Outlook",                          pic: "Amit san",         min: 15 },
    { name: "Manufacturing Competitiveness & Kadai",           pic: "DMD",              min: 15 },
    { name: "TNGA Future Volume",                              pic: "Lokesh",           min: 5 },
    { name: "Cap up Plan (900D & Kamigo B/Localization)",      pic: "Lokesh",           min: 7 },
    { name: "26MTP Volume & Capacity (PC)",                    pic: "Krishnacharya",    min: 7 },
    { name: "Cap up Plan & Layout Plan (PE)",                  pic: "Lokesh",           min: 6 },
    { name: "Closing Meeting — Wrap-up Mtg & Group Photo",     pic: "",                 min: 10 },
    { name: "Visitor Company Presentation",                    pic: "",                 min: 10 },
  ]},
  { name: "GD Area", icon: "🔧", color: "#2E7D32", order: 2, subs: [
    { name: "Walk Through Explanation at Machining (Head > Crank > Block)", pic: "Antonoy", min: 15 },
    { name: "Walk Through Explanation at Assemble Mendomi",    pic: "Antonoy",          min: 10 },
    { name: "CR (Localization Kaizens)",                       pic: "Pavan",            min: 10 },
    { name: "Environment Kaizen",                              pic: "Naveen",           min: 10 },
    { name: "Inhouse Cost Mgt / Control System",               pic: "Sathisha san",     min: 15 },
    { name: "GL/TL Mendomi (GD Assy/GD Mach)",                 pic: "Anotony",          min: 10 },
  ]},
  { name: "TNGA Assembly", icon: "🏭", color: "#E65100", order: 3, subs: [
    { name: "Line Layout & ΣcT Reduction Activity",            pic: "Vijayanad",        min: 15 },
    { name: "TNGA Assy Kaizens — Tansu Kaizen",                pic: "Singh san",        min: 5 },
    { name: "FIPG Image Inspection System",                    pic: "Joshi san",        min: 5 },
    { name: "Cranking Phase-Alignment Jig",                    pic: "Dilip san",        min: 5 },
    { name: "Simplify Standardized Work",                      pic: "Vijayanad",        min: 5 },
    { name: "AMR Activities",                                  pic: "Joshi san",        min: 5 },
    { name: "Cam Cap Tightening Cobot",                        pic: "Joshi san",        min: 5 },
    { name: "De-Skilling",                                     pic: "",                 min: 5 },
  ]},
  { name: "TNGA Machining", icon: "⚙️", color: "#AD1457", order: 4, subs: [
    { name: "Maintenance Activity",                            pic: "Bhat san",         min: 10 },
    { name: "Machine Reliable Enhancement",                    pic: "Prashanth",        min: 10 },
    { name: "Fanuc Robot",                                     pic: "Shiva san",        min: 10 },
    { name: "Intermediate Leak Test Machine in Head Line of India-Made", pic: "Shingh san", min: 10 },
    { name: "TNGA Machining => DC Layout & Auto DC Line Visiting", pic: "",             min: 15 },
    { name: "Machining & Casting",                             pic: "",                 min: 20 },
  ]},
  { name: "DOJO", icon: "🥋", color: "#6A1B9A", order: 5, subs: [
    { name: "Dojo - Overview",                                 pic: "Manu /Brijendra",  min: 20 },
    { name: "Dojo - Attrition Reduction of Trainees",          pic: "",                 min: 10 },
    { name: "New Developments — Karakuri, PE/ME/QC HRD",       pic: "",                 min: 10 },
  ]},
  { name: "Development Centre", icon: "🔬", color: "#00695C", order: 6, subs: [
    { name: "Mid Term Plan",                                   pic: "Vishranth san",    min: 10 },
    { name: "About Digitalization",                            pic: "",                 min: 5 },
    { name: "Dashboards for Each Shop",                        pic: "",                 min: 5 },
    { name: "Maintenance System",                               pic: "",                 min: 6 },
    { name: "About Scada System",                              pic: "",                 min: 6 },
  ]},
  { name: "Supplier", icon: "📦", color: "#4527A0", order: 7, subs: [
    { name: "TNGA 5C Parts Status (Supplier Parts) — Block, Head, Cam", pic: "Manu /Brijendra", min: 10 },
  ]},
];

const TRANSIT = [
  { label: "Move by Buggy", pic: "Nethra", min: 3 },
  { label: "Move by Walk",  pic: "Nethra", min: 2 },
  { label: "Move by Bus",   pic: "Nethra", min: 5 },
  { label: "Rest Break",    pic: "",       min: 5 },
];

const tx = db.transaction(() => {
  db.exec(`DELETE FROM sub_area_item; DELETE FROM area_master; DELETE FROM transit_item;`);

  const insArea = db.prepare(`INSERT INTO area_master (area_name, icon, color_hex, display_order) VALUES (?,?,?,?)`);
  const insSub  = db.prepare(`INSERT INTO sub_area_item (area_id, activity_name, default_pic, default_duration_min, sort_order) VALUES (?,?,?,?,?)`);
  const insTr   = db.prepare(`INSERT INTO transit_item (label, default_pic, default_duration_min) VALUES (?,?,?)`);

  for (const area of AREAS) {
    const { lastInsertRowid: areaId } = insArea.run(area.name, area.icon, area.color, area.order);
    area.subs.forEach((s, idx) => insSub.run(areaId, s.name, s.pic, s.min, idx + 1));
  }
  for (const t of TRANSIT) insTr.run(t.label, t.pic, t.min);
});

tx();
console.log("✅ Seed data inserted: Board Room, GD Area, TNGA Assembly, TNGA Machining, DOJO, Development Centre, Supplier (from Gemba Presentation sheet)");
