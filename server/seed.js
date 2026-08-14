// Seeds Area Master, Sub Area Items and Transit Items into MongoDB
// from the Gemba Presentation details (Visitors_Gemba_presentation.xlsx)
// Run: node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const Area = require('./models/Area');
const Transit = require('./models/Transit');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tiei_visitor_db';

const AREAS = [
  { name: "Board Room", icon: "🏛️", color: "#1565C0", order: 1, subs: [
    { name: "Company Profile",                                pic: "DMD",              min: 10, order: 1 },
    { name: "HOD Introduction",                                pic: "DMD",              min: 5,  order: 2 },
    { name: "India Business Outlook",                          pic: "Amit san",         min: 15, order: 3 },
    { name: "Manufacturing Competitiveness & Kadai",           pic: "DMD",              min: 15, order: 4 },
    { name: "TNGA Future Volume",                              pic: "Lokesh",           min: 5,  order: 5 },
    { name: "Cap up Plan (900D & Kamigo B/Localization)",      pic: "Lokesh",           min: 7,  order: 6 },
    { name: "26MTP Volume & Capacity (PC)",                    pic: "Krishnacharya",    min: 7,  order: 7 },
    { name: "Cap up Plan & Layout Plan (PE)",                  pic: "Lokesh",           min: 6,  order: 8 },
    { name: "Closing Meeting — Wrap-up Mtg & Group Photo",     pic: "",                 min: 10, order: 9 },
    { name: "Visitor Company Presentation",                    pic: "",                 min: 10, order: 10 },
  ]},
  { name: "GD Area", icon: "🔧", color: "#2E7D32", order: 2, subs: [
    { name: "Walk Through Explanation at Machining (Head > Crank > Block)", pic: "Antonoy", min: 15, order: 1 },
    { name: "Walk Through Explanation at Assemble Mendomi",    pic: "Antonoy",          min: 10, order: 2 },
    { name: "CR (Localization Kaizens)",                       pic: "Pavan",            min: 10, order: 3 },
    { name: "Environment Kaizen",                              pic: "Naveen",           min: 10, order: 4 },
    { name: "Inhouse Cost Mgt / Control System",               pic: "Sathisha san",     min: 15, order: 5 },
    { name: "GL/TL Mendomi (GD Assy/GD Mach)",                 pic: "Anotony",          min: 10, order: 6 },
  ]},
  { name: "TNGA Assembly", icon: "🏭", color: "#E65100", order: 3, subs: [
    { name: "Line Layout & ΣcT Reduction Activity",            pic: "Vijayanad",        min: 15, order: 1 },
    { name: "TNGA Assy Kaizens — Tansu Kaizen",                pic: "Singh san",        min: 5,  order: 2 },
    { name: "FIPG Image Inspection System",                    pic: "Joshi san",        min: 5,  order: 3 },
    { name: "Cranking Phase-Alignment Jig",                    pic: "Dilip san",        min: 5,  order: 4 },
    { name: "Simplify Standardized Work",                      pic: "Vijayanad",        min: 5,  order: 5 },
    { name: "AMR Activities",                                  pic: "Joshi san",        min: 5,  order: 6 },
    { name: "Cam Cap Tightening Cobot",                        pic: "Joshi san",        min: 5,  order: 7 },
    { name: "De-Skilling",                                     pic: "",                 min: 5,  order: 8 },
  ]},
  { name: "TNGA Machining", icon: "⚙️", color: "#AD1457", order: 4, subs: [
    { name: "Maintenance Activity",                            pic: "Bhat san",         min: 10, order: 1 },
    { name: "Machine Reliable Enhancement",                    pic: "Prashanth",        min: 10, order: 2 },
    { name: "Fanuc Robot",                                     pic: "Shiva san",        min: 10, order: 3 },
    { name: "Intermediate Leak Test Machine in Head Line of India-Made", pic: "Shingh san", min: 10, order: 4 },
    { name: "TNGA Machining => DC Layout & Auto DC Line Visiting", pic: "",             min: 15, order: 5 },
    { name: "Machining & Casting",                             pic: "",                 min: 20, order: 6 },
  ]},
  { name: "DOJO", icon: "🥋", color: "#6A1B9A", order: 5, subs: [
    { name: "Dojo - Overview",                                 pic: "Manu /Brijendra",  min: 20, order: 1 },
    { name: "Dojo - Attrition Reduction of Trainees",          pic: "",                 min: 10, order: 2 },
    { name: "New Developments — Karakuri, PE/ME/QC HRD",       pic: "",                 min: 10, order: 3 },
  ]},
  { name: "Development Centre", icon: "🔬", color: "#00695C", order: 6, subs: [
    { name: "Mid Term Plan",                                   pic: "Vishranth san",    min: 10, order: 1 },
    { name: "About Digitalization",                            pic: "",                 min: 5,  order: 2 },
    { name: "Dashboards for Each Shop",                        pic: "",                 min: 5,  order: 3 },
    { name: "Maintenance System",                               pic: "",                 min: 6,  order: 4 },
    { name: "About Scada System",                              pic: "",                 min: 6,  order: 5 },
  ]},
  { name: "Supplier", icon: "📦", color: "#4527A0", order: 7, subs: [
    { name: "TNGA 5C Parts Status (Supplier Parts) — Block, Head, Cam", pic: "Manu /Brijendra", min: 10, order: 1 },
  ]},
];

const TRANSIT = [
  { label: "Move by Buggy", pic: "Nethra", min: 3 },
  { label: "Move by Walk",  pic: "Nethra", min: 2 },
  { label: "Move by Bus",   pic: "Nethra", min: 5 },
  { label: "Rest Break",    pic: "",       min: 5 },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB for seeding: ${MONGODB_URI}`);

    await Area.deleteMany({});
    await Transit.deleteMany({});

    for (const a of AREAS) {
      await Area.create(a);
    }

    for (const t of TRANSIT) {
      await Transit.create(t);
    }

    console.log("✅ MongoDB Seed Completed: Inserted Areas, Sub-Areas & Transit Items.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
