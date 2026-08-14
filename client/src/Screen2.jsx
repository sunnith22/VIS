import { useState, useEffect, useRef } from 'react';
import { api } from './api.js';

const T = {
  navy: "#7C3AED", 
  navyMid: "#6D28D9", 
  accent: "#7C3AED",
  bg: "#F8FAFC", 
  border: "#E2E8F0", 
  text: "#0F172A", 
  muted: "#64748B",
};

const FALLBACK_COLOR = { bg: "#F5F3FF", border: "#7C3AED", badge: "#6D28D9" };

function colorSet(hex) {
  if (!hex) return FALLBACK_COLOR;
  return { bg: hex + "1A", border: hex, badge: hex };
}

const PRESET_SUPPORT_NAMES = [
  'MD san',
  'DMD san',
  'Amit San',
  'Yamana san',
  'Senthil san',
  'Pramod san',
  'Anil san',
  'Vijayanand san',
  'Lokesha san',
  'Shiga san',
  'Krishnacharya san',
  'Suzuki san',
  'Singh san',
  'Manu san',
  'Mulia san',
  'Brijendra san',
  'Nethra',
  'Prashanth san',
  'Sridhar Bhat san',
  'Suresh san'
];

const PRESET_GROUPS = [
  { label: '👥 Boardroom Attendees (MD, DMD, Amit, Yamana, Senthil, Pramod, Anil, Vijayanand, Lokesha)', value: 'MD san, DMD san, Amit San, Yamana san, Senthil san, Pramod san, Anil san, Vijayanand san, Lokesha san' },
  { label: '👥 Gemba Tour Group (MD, DMD, Yamana, Senthil, Vijayanand)', value: 'MD san, DMD san, Yamana san, Senthil san, Vijayanand san' },
  { label: '👥 Machining Review Group (MD, DMD, Yamana, Senthil, Vijayanand, Suresh)', value: 'MD san, DMD san, Yamana san, Senthil san, Vijayanand san, Suresh san' },
  { label: '👥 Executive Management (MD san, DMD san)', value: 'MD san, DMD san' },
];

function toMin(t) { const [h, m] = (t || '09:00').split(':').map(Number); return h * 60 + m; }
function toTime(m) { const hh = String(Math.floor(m / 60) % 24).padStart(2, '0'); const mm = String(m % 60).padStart(2, '0'); return `${hh}:${mm}`; }

export default function Screen2({ formData, setFormData, visitId, setVisitId, onBack, onNext }) {
  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [transit, setTransit] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selAreaId, setSelAreaId] = useState('');
  const [selSubId, setSelSubId] = useState('');
  const [selTransitId, setSelTransitId] = useState('');
  const [customPic, setCustomPic] = useState('');
  const [customSupport, setCustomSupport] = useState('');
  const [customMin, setCustomMin] = useState('');

  const [rows, setRows] = useState([]); // {rowId, area, activity, pic, support, durationMin}
  const [nextRowId, setNextRowId] = useState(1);

  const [view, setView] = useState('builder'); // builder | preview
  const [genError, setGenError] = useState('');
  const printRef = useRef();

  const startTime = formData?.visitStart || '09:00';

  // Extract attendee names dynamically from Step 1 topAttendees
  const dynamicAttendees = (formData?.topAttendees || [])
    .map(a => a.name?.trim())
    .filter(Boolean);

  const allSupportOptions = Array.from(new Set([...PRESET_SUPPORT_NAMES, ...dynamicAttendees]));

  useEffect(() => {
    api.getAreas().then(data => {
      setAreas(data.areas || []);
      setSubAreas(data.subAreas || []);
      setTransit(data.transit || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const subsForArea = (areaId) => subAreas.filter(s => String(s.area_id) === String(areaId));

  const onAreaChange = (val) => {
    setSelAreaId(val);
    setSelSubId('');
    setSelTransitId('');
    const subs = subsForArea(val);
    if (subs.length) { 
      setCustomPic(subs[0].default_pic || ''); 
      setCustomMin(String(subs[0].default_duration_min || '')); 
    } else { 
      setCustomPic(''); 
      setCustomMin(''); 
    }
  };

  const onSubChange = (val) => {
    setSelSubId(val);
    const s = subAreas.find(x => String(x.id) === String(val));
    if (s) { 
      setCustomPic(s.default_pic || ''); 
      setCustomMin(String(s.default_duration_min || '')); 
    }
  };

  const onTransitChange = (val) => {
    setSelTransitId(val);
    setSelAreaId(''); 
    setSelSubId('');
    const t = transit.find(x => String(x.id) === String(val));
    if (t) { 
      setCustomPic(t.default_pic || ''); 
      setCustomMin(String(t.default_duration_min || '')); 
    }
  };

  const selectedArea = areas.find(a => String(a.id) === String(selAreaId));

  const addSupportName = (name) => {
    if (!name) return;
    setCustomSupport(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return name;
      const list = trimmed.split(',').map(s => s.trim());
      if (list.includes(name)) return trimmed; // Already added
      return `${trimmed}, ${name}`;
    });
  };

  const setSupportGroup = (val) => {
    if (!val) return;
    setCustomSupport(val);
  };

  const addRow = () => {
    let areaName, activity, pic, dur, support;
    if (selTransitId && !selAreaId) {
      const t = transit.find(x => String(x.id) === String(selTransitId));
      if (!t) return;
      areaName = "Transit"; 
      activity = t.label; 
      pic = customPic || t.default_pic || ''; 
      support = customSupport || '';
      dur = parseInt(customMin) || t.default_duration_min;
    } else {
      if (!selAreaId || !selSubId) return;
      const s = subAreas.find(x => String(x.id) === String(selSubId));
      if (!s) return;
      areaName = selectedArea?.area_name; 
      activity = s.activity_name; 
      pic = customPic || s.default_pic || ''; 
      support = customSupport || '';
      dur = parseInt(customMin) || s.default_duration_min;
    }
    setRows(p => [...p, { rowId: nextRowId, area: areaName, activity, pic: pic || '', support: support || '', durationMin: Math.max(1, dur || 1) }]);
    setNextRowId(n => n + 1);
    setSelAreaId(''); 
    setSelSubId(''); 
    setSelTransitId(''); 
    setCustomPic(''); 
    setCustomSupport('');
    setCustomMin('');
    setGenError('');
  };

  const removeRow = (rowId) => setRows(p => p.filter(r => r.rowId !== rowId));
  const moveRow = (idx, dir) => setRows(p => { const a = [...p]; const t = a[idx]; a[idx] = a[idx + dir]; a[idx + dir] = t; return a; });
  const updateDur = (rowId, val) => setRows(p => p.map(r => r.rowId === rowId ? { ...r, durationMin: Math.max(1, parseInt(val) || 1) } : r));

  // Live cascading schedule (client-side preview)
  const schedule = (() => {
    let cursor = toMin(startTime);
    return rows.map((r, idx) => { 
      const from = toTime(cursor); 
      cursor += r.durationMin; 
      const to = toTime(cursor);
      return { 
        ...r, 
        sort_order: idx + 1,
        from_time: from, 
        to_time: to,
        from, 
        to,
        activity_name: r.activity,
        support_attendees: r.support
      }; 
    });
  })();

  const totalMin = rows.reduce((s, r) => s + r.durationMin, 0);

  // Advances to Step 3 Summary Screen (In-memory draft, does NOT write to database yet!)
  const handleProceedToSummary = () => {
    setGenError('');
    if (rows.length === 0) {
      setGenError('Please add at least 1 agenda activity or transit before proceeding.');
      return;
    }
    if (onNext) {
      onNext(schedule, visitId);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Visitor Agenda</title><style>
      body{font-family:Arial;font-size:11px;margin:20px}
      table{border-collapse:collapse;width:100%}
      th{background:#7C3AED;color:white;padding:6px 8px;text-align:left}
      td{border:1px solid #ccc;padding:5px 8px;vertical-align:top}
      tr:nth-child(even) td{background:#f5f8ff}
    </style></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close(); 
    win.print();
  };

  const selStyle = { 
    padding: "7px 10px", border: `1.5px solid ${T.border}`, borderRadius: 6, 
    fontSize: 13, color: T.text, background: "white", cursor: "pointer", outline: "none" 
  };

  if (loading) return <div style={{ padding: 40, fontFamily: "'Segoe UI',Arial,sans-serif" }}>Loading areas…</div>;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
      
      {/* Step 2 Header */}
      <div style={{ background: T.navy, color: "white", padding: "0 20px", height: 52, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "none", borderRadius: 5, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          ← Back to Step 1 (Edit Details)
        </button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Agenda Builder</span>
        <span style={{ fontSize: 12, opacity: 0.8, marginLeft: 4 }}>
          {formData?.company || 'Company'} · {formData?.visitDate} · Visit #{formData?.visitNo}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setView('builder')} style={{ background: view === 'builder' ? "#6D28D9" : "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: view === 'builder' ? 700 : 400 }}>
            🏗 Builder
          </button>
          <button onClick={() => setView('preview')} style={{ background: view === 'preview' ? "#6D28D9" : "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: view === 'preview' ? 700 : 400 }}>
            📄 Live Preview ({rows.length})
          </button>
          {rows.length > 0 && (
            <button onClick={handleProceedToSummary} style={{ background: "#059669", color: "white", border: "none", borderRadius: 5, padding: "6px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700, boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>
              Next: Review & Finish (Step 3) →
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "20px 16px" }}>

        {view === 'builder' && (
          <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 16, alignItems: "start" }}>

            {/* LEFT PANEL */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ background: T.navy, color: "white", padding: "10px 14px", fontWeight: 700, fontSize: 13 }}>
                  🗺️ Add Area / Transit to Agenda
                </div>
                <div style={{ padding: "14px" }}>

                  <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Step 1 — Select Plant Area
                  </div>
                  <select value={selAreaId} onChange={e => onAreaChange(e.target.value)} style={{ ...selStyle, width: "100%" }}>
                    <option value="">— Choose an Area —</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.icon} {a.area_name}</option>)}
                  </select>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0", color: T.muted, fontSize: 11 }}>
                    <div style={{ flex: 1, height: 1, background: T.border }} />OR add transit<div style={{ flex: 1, height: 1, background: T.border }} />
                  </div>

                  <select value={selTransitId} onChange={e => onTransitChange(e.target.value)} style={{ ...selStyle, width: "100%", borderColor: selTransitId ? "#7C3AED" : T.border }}>
                    <option value="">— Transit / Break —</option>
                    {transit.map(t => <option key={t.id} value={t.id}>🚌 {t.label}</option>)}
                  </select>

                  {selAreaId && selectedArea && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: selectedArea.color_hex, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
                        Step 2 — Select Activity in {selectedArea.area_name}
                      </div>
                      <div style={{ background: colorSet(selectedArea.color_hex).bg, border: `1.5px solid ${selectedArea.color_hex}`, borderRadius: 6, padding: "6px 10px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{selectedArea.icon}</span>
                        <span style={{ fontWeight: 700, color: selectedArea.color_hex, fontSize: 13 }}>{selectedArea.area_name}</span>
                        <span style={{ fontSize: 11, color: selectedArea.color_hex, opacity: 0.7 }}>{subsForArea(selAreaId).length} activities</span>
                      </div>
                      <select value={selSubId} onChange={e => onSubChange(e.target.value)} style={{ ...selStyle, width: "100%", borderColor: selSubId ? selectedArea.color_hex : T.border }}>
                        <option value="">— Choose Activity —</option>
                        {subsForArea(selAreaId).map(s => <option key={s.id} value={s.id}>{s.activity_name} ({s.default_duration_min} min)</option>)}
                      </select>
                    </div>
                  )}

                  {(selSubId || selTransitId) && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
                        Step 3 — Customise Presenter, Support & Duration
                      </div>
                      
                      {/* PIC / Presenter */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: T.muted, marginBottom: 3, fontWeight: 600 }}>PIC / Presenter *</div>
                        <input value={customPic} onChange={e => setCustomPic(e.target.value)} placeholder="e.g. Shiga san, DMD san"
                          style={{ width: "100%", padding: "6px 9px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, boxSizing: "border-box" }} />
                      </div>

                      {/* Support / Attendees Dropdown & Free Text */}
                      <div style={{ marginBottom: 8, background: "#FDF4FF", border: "1px solid #F0ABFC", borderRadius: 6, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: "#86198F", marginBottom: 4, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
                          <span>👥 Support / Attendees</span>
                          <span>(Dropdown or Enter Custom)</span>
                        </div>

                        {/* Quick Selection Dropdown */}
                        <select
                          onChange={e => {
                            const val = e.target.value;
                            if (!val) return;
                            if (val.startsWith('group:')) {
                              const group = PRESET_GROUPS.find(g => `group:${g.label}` === val);
                              if (group) setSupportGroup(group.value);
                            } else {
                              addSupportName(val);
                            }
                            e.target.value = '';
                          }}
                          style={{ width: "100%", padding: "5px 8px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 11, background: "white", marginBottom: 6, cursor: "pointer", color: T.text }}
                        >
                          <option value="">— Select preset group or name to add —</option>
                          <optgroup label="📋 Standard Preset Groups">
                            {PRESET_GROUPS.map(g => (
                              <option key={g.label} value={`group:${g.label}`}>{g.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="👤 Individual Attendees">
                            {allSupportOptions.map(n => (
                              <option key={n} value={n}>+ {n}</option>
                            ))}
                          </optgroup>
                        </select>

                        {/* Free-text Editable Field */}
                        <input
                          value={customSupport}
                          onChange={e => setCustomSupport(e.target.value)}
                          placeholder="Type custom names or pick from dropdown above..."
                          style={{ width: "100%", padding: "6px 9px", border: `1px solid #E879F9`, borderRadius: 4, fontSize: 11, boxSizing: "border-box", background: "white" }}
                        />

                        {/* Quick Add Chips */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 9, color: "#701A75", fontWeight: 700 }}>Quick Add:</span>
                          {['MD san', 'DMD san', 'Amit San', 'Yamana san', 'Senthil san', 'Pramod san', 'Anil san', 'Vijayanand san'].map(name => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => addSupportName(name)}
                              style={{ background: "white", color: "#86198F", border: "1px solid #E879F9", borderRadius: 10, padding: "1px 7px", fontSize: 9.5, cursor: "pointer", fontWeight: 600 }}
                            >
                              + {name}
                            </button>
                          ))}
                          {customSupport && (
                            <button
                              type="button"
                              onClick={() => setCustomSupport('')}
                              style={{ background: "none", color: "#DC2626", border: "none", fontSize: 9.5, cursor: "pointer", marginLeft: "auto", textDecoration: "underline" }}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Duration */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: T.muted, marginBottom: 3, fontWeight: 600 }}>Duration *</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input type="number" min="1" max="180" value={customMin} onChange={e => setCustomMin(e.target.value)} placeholder="Min"
                            style={{ width: 70, padding: "6px 8px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, boxSizing: "border-box", textAlign: "center" }} />
                          <span style={{ fontSize: 12, color: T.muted }}>minutes</span>
                        </div>
                      </div>

                      <button onClick={addRow} style={{ background: "#7C3AED", color: "white", border: "none", borderRadius: 6, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 4 }}>
                        + Add to Agenda
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Tips & Back Button */}
              <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text, marginBottom: 4 }}>Need to change visitor info?</div>
                <button onClick={onBack} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 5, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: T.navy, cursor: "pointer", width: "100%" }}>
                  ← Back to Step 1 (Edit Visitors & Details)
                </button>
              </div>
            </div>

            {/* RIGHT PANEL: Live Timeline & Agenda Items */}
            <div>
              {rows.length > 0 && (
                <div style={{ background: "white", border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>
                    Live Schedule Timeline ({rows.length} items · Total: {Math.floor(totalMin / 60)}h {totalMin % 60}m)
                  </div>
                  <div style={{ display: "flex", gap: 2, height: 22, borderRadius: 4, overflow: "hidden" }}>
                    {schedule.map(r => {
                      const area = areas.find(a => a.area_name === r.area);
                      const c = colorSet(area?.color_hex);
                      const pct = (r.durationMin / totalMin * 100).toFixed(1);
                      return (
                        <div key={r.rowId} title={`${r.activity} — ${r.area} (${r.durationMin}m)`}
                          style={{ background: c.border, flex: `0 0 ${pct}%`, minWidth: 3, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          {r.durationMin >= 10 && <span style={{ color: "white", fontSize: 8, fontWeight: 700 }}>{r.durationMin}m</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.muted, marginTop: 4 }}>
                    <span>{startTime}</span>
                    <span>{schedule.length ? schedule[schedule.length - 1].to : ""}</span>
                  </div>
                </div>
              )}

              {rows.length === 0 && (
                <div style={{ background: "white", border: `2px dashed ${T.border}`, borderRadius: 8, padding: "40px 20px", textAlign: "center", color: T.muted }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No agenda items yet</div>
                  <div style={{ fontSize: 12 }}>Select an area from the left panel and click "+ Add to Agenda"</div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {schedule.map((row, idx) => {
                  const area = areas.find(a => a.area_name === row.area);
                  const c = colorSet(area?.color_hex);
                  return (
                    <div key={row.rowId} style={{ background: c.bg, border: `2px solid ${c.border}`, borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: c.border, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flexShrink: 0, textAlign: "center", minWidth: 70 }}>
                        <div style={{ fontSize: 18 }}>{area?.icon || "🚌"}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: c.badge, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 3, padding: "0 4px", marginTop: 1, whiteSpace: "nowrap" }}>
                          {row.area}
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: T.navy, fontSize: 13, marginBottom: 2 }}>{row.activity}</div>
                        <div style={{ display: "flex", gap: 12, fontSize: 11, color: T.muted, flexWrap: "wrap", alignItems: "center" }}>
                          <span>👤 <strong>PIC:</strong> {row.pic || "—"}</span>
                          {row.support && (
                            <span style={{ color: "#7C3AED", background: "#F5F3FF", padding: "1px 6px", borderRadius: 4, border: "1px solid #DDD6FE" }}>
                              👥 <strong>Support:</strong> {row.support}
                            </span>
                          )}
                          <span style={{ fontWeight: 600, color: c.badge }}>🕐 {row.from} → {row.to}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
                        <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, textTransform: "uppercase" }}>Min</div>
                        <div style={{ display: "flex", alignItems: "center"}}>
                          <button onClick={() => updateDur(row.rowId, row.durationMin - 1)} style={{ width: 22, height: 26, background: c.border, color: "white", border: "none", borderRadius: "4px 0 0 4px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>−</button>
                          <input type="number" min="1" value={row.durationMin} onChange={e => updateDur(row.rowId, e.target.value)}
                            style={{ width: 44, height: 26, textAlign: "center", border: `1px solid ${c.border}`, borderLeft: "none", borderRight: "none", fontSize: 13, fontWeight: 700, color: T.navy, background: "white" }} />
                          <button onClick={() => updateDur(row.rowId, row.durationMin + 1)} style={{ width: 22, height: 26, background: c.border, color: "white", border: "none", borderRadius: "0 4px 4px 0", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>+</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                        <button disabled={idx === 0} onClick={() => moveRow(idx, -1)} style={{ width: 22, height: 22, background: idx === 0 ? "#F1F5F9" : T.navy, color: "white", border: "none", borderRadius: 3, cursor: idx === 0 ? "not-allowed" : "pointer", fontSize: 12 }}>↑</button>
                        <button disabled={idx === rows.length - 1} onClick={() => moveRow(idx, 1)} style={{ width: 22, height: 22, background: idx === rows.length - 1 ? "#F1F5F9" : T.navy, color: "white", border: "none", borderRadius: 3, cursor: idx === rows.length - 1 ? "not-allowed" : "pointer", fontSize: 12 }}>↓</button>
                      </div>
                      <button onClick={() => removeRow(row.rowId)} style={{ width: 26, height: 26, background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 4, cursor: "pointer", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>×</button>
                    </div>
                  );
                })}
              </div>

              {genError && <div style={{ color: "#DC2626", fontSize: 13, marginTop: 10, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6, padding: "8px 12px", fontWeight: 600 }}>⚠️ {genError}</div>}

              {rows.length > 0 && (
                <button
                  onClick={handleProceedToSummary}
                  style={{
                    marginTop: 16, background: "#7C3AED", color: "white", border: "none",
                    borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", width: "100%", boxShadow: "0 2px 6px rgba(124,58,237,0.3)"
                  }}
                >
                  Next: Review & Finish (Step 3) →
                </button>
              )}
            </div>
          </div>
        )}

        {view === 'preview' && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ color: T.navy, margin: 0, fontSize: 18 }}>Visitor Agenda Live Preview</h2>
                <p style={{ color: T.muted, margin: "4px 0 0", fontSize: 13 }}>Draft schedule · Click "Next: Review & Finish" to finalize</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => setView('builder')} style={{ background: "white", color: T.navy, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  ← Back to Builder
                </button>
                <button onClick={handlePrint} style={{ background: T.navy, color: "white", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                  🖨 Print Preview
                </button>
                {rows.length > 0 && (
                  <button onClick={handleProceedToSummary} style={{ background: '#059669', color: "white", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    Next: Review & Finish (Step 3) →
                  </button>
                )}
              </div>
            </div>

            <div ref={printRef}>
              <div style={{ background: T.navy, color: "white", borderRadius: "8px 8px 0 0", padding: "14px 18px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 2 }}>VISITOR PRESENTATION AGENDA</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{formData?.company || "Visitor Delegation"}</div>
                  {(formData?.visitors || []).map((v, i) => (
                    <div key={i} style={{ fontSize: 12, opacity: 0.85 }}>• {v.title ? v.title + ' ' : ''}{v.name}{v.designation ? `, ${v.designation}` : ""}</div>
                  ))}
                </div>
                <div style={{ textAlign: "right", fontSize: 12 }}>
                  <div><b>Date:</b> {formData?.visitDate}</div>
                  <div><b>Time:</b> {startTime} – {schedule.length ? schedule[schedule.length - 1].to_time : ""}</div>
                  <div><b>Advisor:</b> {formData?.visitAdvisor || "—"}</div>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, background: "white", border: `1px solid ${T.border}`, borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
                <thead>
                  <tr style={{ background: T.navyMid, color: "white" }}>
                    {["#", "Time", "Duration", "Area", "Activity", "PIC / Presenter", "Support / Attendees"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "white" : T.bg }}>
                      <td style={{ border: `1px solid ${T.border}`, padding: "7px 10px" }}>{i + 1}</td>
                      <td style={{ border: `1px solid ${T.border}`, padding: "7px 10px", fontWeight: 700, color: T.navy }}>{r.from_time} – {r.to_time}</td>
                      <td style={{ border: `1px solid ${T.border}`, padding: "7px 10px" }}>{r.duration_min || r.durationMin} min</td>
                      <td style={{ border: `1px solid ${T.border}`, padding: "7px 10px", fontWeight: 600 }}>{r.area}</td>
                      <td style={{ border: `1px solid ${T.border}`, padding: "7px 10px" }}>{r.activity_name || r.activity}</td>
                      <td style={{ border: `1px solid ${T.border}`, padding: "7px 10px" }}>{r.pic || "—"}</td>
                      <td style={{ border: `1px solid ${T.border}`, padding: "7px 10px", color: "#475569" }}>{r.support_attendees || r.support || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
