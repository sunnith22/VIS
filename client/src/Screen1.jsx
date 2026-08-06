import { useState } from 'react';
import { api } from './api.js';

const T = {
  navy: "#7C3AED", navyMid: "#6D28D9", accent: "#7C3AED", bg: "#F8FAFC",
  border: "#E2E8F0", text: "#0F172A", muted: "#64748B",
  row1: "#FFFFFF", row2: "#F8FAFC", white: "#FFFFFF",
  purpleLt: "#F5F3FF",
};

const TITLES = ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof', 'Dato\'', 'Datin', 'Tan Sri', 'Puan Sri', 'Ir', 'Er'];

// ── Small reusable components ──────────────────────────────────────────────────
const SectionCard = ({ num, title, children, style = {} }) => (
  <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 12, boxShadow: '0 1px 3px rgba(15,23,42,0.04)', ...style }}>
    <div style={{ background: T.navy, color: "white", padding: "9px 14px", fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ background: "rgba(255,255,255,0.22)", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{num}</span>
      {title}
    </div>
    <div style={{ padding: "12px 14px" }}>{children}</div>
  </div>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{children}</div>
);

const TInput = ({ value, onChange, placeholder, type = "text", style = {} }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width: "100%", padding: "6px 9px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, color: T.text, background: T.white, boxSizing: "border-box", fontFamily: "'Segoe UI',Arial,sans-serif", ...style }} />
);

const TSelect = ({ value, onChange, children, style = {} }) => (
  <select value={value} onChange={onChange}
    style={{ width: "100%", padding: "6px 9px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, color: T.text, background: T.white, boxSizing: "border-box", fontFamily: "'Segoe UI',Arial,sans-serif", ...style }}>
    {children}
  </select>
);

const Checkbox = ({ checked, onChange, label }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: T.text, userSelect: "none" }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 14, height: 14, accentColor: T.navy, cursor: "pointer" }} />
    {label}
  </label>
);

const Radio = ({ checked, onChange, label }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: T.text, userSelect: "none" }}>
    <input type="radio" checked={checked} onChange={onChange} style={{ accentColor: T.navy, cursor: "pointer" }} />
    {label}
  </label>
);

const CircleToggle = ({ checked, onChange }) => (
  <div onClick={onChange} style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${T.navy}`, background: checked ? T.navy : "white", margin: "auto", cursor: "pointer" }} />
);

// ── Visit Purpose Matrix ───────────────────────────────────────────────────────
const MATRIX_ROWS = ["Learn System / Facility", "Glide System / Facility", "Assess Mgmt/Capability"];
const MATRIX_COLS = ["Customer", "Parts", "Equip/Tools", "Group Co.", "Govt", "Others"];

function VisitPurposeMatrix({ matrix, setMatrix }) {
  const toggle = (r, c) => {
    const key = `${r}-${c}`;
    setMatrix(p => ({ ...p, [key]: !p[key] }));
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ padding: "5px 8px", textAlign: "left", color: T.muted, fontWeight: 600, borderBottom: `1px solid ${T.border}`, minWidth: 140 }}></th>
            {MATRIX_COLS.map(c => (
              <th key={c} style={{ padding: "5px 8px", textAlign: "center", color: T.muted, fontWeight: 600, borderBottom: `1px solid ${T.border}`, fontSize: 10 }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MATRIX_ROWS.map((row, ri) => (
            <tr key={row} style={{ background: ri % 2 === 0 ? T.row1 : T.row2 }}>
              <td style={{ padding: "6px 8px", fontSize: 11, color: T.text, borderBottom: `1px solid ${T.border}` }}>{row}</td>
              {MATRIX_COLS.map(col => (
                <td key={col} style={{ padding: "6px 8px", textAlign: "center", borderBottom: `1px solid ${T.border}` }}>
                  <div onClick={() => toggle(ri, col)}
                    style={{ width: 14, height: 14, background: matrix[`${ri}-${col}`] ? T.navy : "white", border: `2px solid ${T.navy}`, borderRadius: 2, margin: "auto", cursor: "pointer" }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── TIEI Top Attendees ─────────────────────────────────────────────────────────
const SESSION_COLS = ["Opening EBR", "Lunch", "Gemba", "Closing EBR"];

function generateDates(startDate, count = 3) {
  if (!startDate) return [];
  const dates = [];
  const d = new Date(startDate);
  for (let i = 0; i < count; i++) {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    dates.push(dd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  }
  return dates;
}

function AttendeesGrid({ visitDate, attendees, setAttendees }) {
  const dates = generateDates(visitDate, 3);
  const EMPTY = { name: '', role: '', schedule: {} };

  const addRow = () => setAttendees(p => [...p, { ...EMPTY, id: Date.now() }]);
  const updField = (idx, field, val) => setAttendees(p => p.map((a, i) => i === idx ? { ...a, [field]: val } : a));
  const toggleCell = (idx, dateIdx, col) => {
    const key = `${dateIdx}-${col}`;
    setAttendees(p => p.map((a, i) => i === idx ? { ...a, schedule: { ...a.schedule, [key]: !a.schedule[key] } } : a));
  };

  const thStyle = { padding: "5px 6px", color: "white", fontWeight: 600, fontSize: 9, textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.15)", whiteSpace: "nowrap" };
  const tdStyle = { padding: "5px 6px", textAlign: "center", borderBottom: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: 700 }}>
        <thead>
          <tr style={{ background: T.navy }}>
            <th style={{ ...thStyle, textAlign: "left", minWidth: 30 }}><span style={{ color: "white" }}>S.No</span></th>
            <th style={{ ...thStyle, textAlign: "left", minWidth: 110 }}>Name</th>
            <th style={{ ...thStyle, textAlign: "left", minWidth: 80 }}>Role</th>
            {dates.map((date, di) => (
              <th key={di} colSpan={SESSION_COLS.length} style={{ ...thStyle, borderLeft: "1px solid rgba(255,255,255,0.3)" }}>
                {date}
              </th>
            ))}
            <th style={{ ...thStyle, width: 24 }}></th>
          </tr>
          <tr style={{ background: T.navyMid }}>
            <th colSpan={3}></th>
            {dates.map((_, di) => (
              SESSION_COLS.map(col => (
                <th key={`${di}-${col}`} style={{ ...thStyle, fontSize: 8 }}>{col}</th>
              ))
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((att, idx) => (
            <tr key={att.id || idx} style={{ background: idx % 2 === 0 ? T.row1 : T.row2 }}>
              <td style={{ ...tdStyle, color: T.muted, fontWeight: 700 }}>{idx + 1}</td>
              <td style={{ ...tdStyle, padding: "4px 5px" }}>
                <input value={att.name} onChange={e => updField(idx, 'name', e.target.value)}
                  placeholder="Name" style={{ width: "100%", padding: "3px 6px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 11, boxSizing: "border-box" }} />
              </td>
              <td style={{ ...tdStyle, padding: "4px 5px" }}>
                <input value={att.role} onChange={e => updField(idx, 'role', e.target.value)}
                  placeholder="Role" style={{ width: "100%", padding: "3px 6px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 11, boxSizing: "border-box", background: "#FFF3CD" }} />
              </td>
              {dates.map((_, di) => (
                SESSION_COLS.map(col => (
                  <td key={`${di}-${col}`} style={tdStyle}>
                    <CircleToggle checked={!!att.schedule[`${di}-${col}`]} onChange={() => toggleCell(idx, di, col)} />
                  </td>
                ))
              ))}
              <td style={tdStyle}>
                <button onClick={() => setAttendees(p => p.filter((_, i) => i !== idx))}
                  style={{ background: "none", border: "none", color: "#E53935", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={3 + dates.length * SESSION_COLS.length + 1} style={{ padding: "6px 8px" }}>
              <button onClick={addRow}
                style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                + Add attendee
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── MAIN SCREEN 1 ──────────────────────────────────────────────────────────────
export default function Screen1({ formData, setFormData, onNext }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const upd = (key, val) => setFormData(p => ({ ...p, [key]: val }));



  const EMPTY_VISITOR = { title: 'Mr', name: '', designation: '', company: '', dept: '', visitedBefore: false, prevDate: '' };
  const [newVisitor, setNewVisitor] = useState({ ...EMPTY_VISITOR });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleNameChange = async (val) => {
    setNewVisitor(p => ({ ...p, name: val }));
    if (val.trim().length >= 2) {
      try {
        const list = await api.getVisitorSuggestions(val);
        setSuggestions(list || []);
        setShowSuggestions(true);
      } catch (_) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (s) => {
    setNewVisitor({
      title: s.title || 'Mr',
      name: s.name,
      designation: s.designation || '',
      company: s.company || '',
      dept: s.dept || '',
      visitedBefore: true,
      prevDate: s.prev_visit_date || ''
    });
    if (s.prev_visit_date) setPrevVisitDate(s.prev_visit_date);
    setVisitedBefore('Yes');
    if (!formData.company && s.company) {
      upd('company', s.company);
    }
    setSuggestions([]);
    setShowSuggestions(false);
    setFetchStatus({
      type: 'success',
      msg: `✅ Auto-fetched previous visit details for ${s.name} (Last Visit: ${s.prev_visit_date || 'Recorded'})`
    });
  };

  const handleLookupVisitor = async (queryName) => {
    const q = queryName || newVisitor.name || formData.company;
    if (!q || !q.trim()) {
      setFetchStatus({ type: 'info', msg: 'Please enter a visitor name or company name to fetch previous details.' });
      return;
    }
    setIsSearching(true);
    setFetchStatus(null);
    try {
      const res = await api.lookupVisitor(q);
      if (res && res.found) {
        setNewVisitor(p => ({
          ...p,
          title: res.title || p.title || 'Mr',
          name: res.name || p.name || q,
          designation: res.designation || p.designation || '',
          company: res.company || p.company || '',
          dept: res.dept || p.dept || '',
          visitedBefore: true,
          prevDate: res.prev_visit_date || ''
        }));
        if (res.prev_visit_date) setPrevVisitDate(res.prev_visit_date);
        setVisitedBefore('Yes');
        if (!formData.company && res.company) {
          upd('company', res.company);
        }
        setFetchStatus({
          type: 'success',
          msg: `✅ Found previous visit from ${res.prev_visit_date || 'past date'}! Auto-filled details for ${res.name}.`
        });
      } else {
        setFetchStatus({ type: 'info', msg: `ℹ️ No previous visit history found for "${q}".` });
      }
    } catch (e) {
      setFetchStatus({ type: 'info', msg: `ℹ️ No previous visit records found for "${q}".` });
    } finally {
      setIsSearching(false);
    }
  };

  const addVisitor = async () => {
    if (!newVisitor.name.trim()) return;
    let visitedBeforeFlag = newVisitor.visitedBefore;
    let prevDateVal = newVisitor.prevDate;

    if (!visitedBeforeFlag) {
      try {
        const check = await api.lookupVisitor(newVisitor.name);
        if (check && check.found) {
          visitedBeforeFlag = true;
          prevDateVal = check.prev_visit_date || prevDateVal;
          if (check.prev_visit_date) setPrevVisitDate(check.prev_visit_date);
          setVisitedBefore('Yes');
        }
      } catch (_) { }
    }

    setFormData(p => ({
      ...p,
      visitors: [
        ...p.visitors,
        {
          ...newVisitor,
          visitedBefore: visitedBeforeFlag,
          prevDate: prevDateVal
        }
      ]
    }));
    setNewVisitor({ ...EMPTY_VISITOR });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeVisitor = (idx) => setFormData(p => ({ ...p, visitors: p.visitors.filter((_, i) => i !== idx) }));

  const toggleVisited = async (idx) => {
    const v = formData.visitors[idx];
    const newStatus = !v.visitedBefore;
    let newPrevDate = v.prevDate;

    if (newStatus && !newPrevDate && v.name) {
      try {
        const res = await api.lookupVisitor(v.name);
        if (res && res.found && res.prev_visit_date) {
          newPrevDate = res.prev_visit_date;
          if (res.prev_visit_date) setPrevVisitDate(res.prev_visit_date);
          setVisitedBefore('Yes');
        }
      } catch (_) { }
    }

    setFormData(p => ({
      ...p,
      visitors: p.visitors.map((item, i) =>
        i === idx ? { ...item, visitedBefore: newStatus, prevDate: newPrevDate } : item
      )
    }));
  };

  const updVisitorField = (idx, field, val) => setFormData(p => ({ ...p, visitors: p.visitors.map((v, i) => i === idx ? { ...v, [field]: val } : v) }));


  // Extra form state
  const [rehearsals, setRehearsals] = useState({ mdSan: true, gmdSan: true, svp: false, vp: false, avp: false, hdd: false, count: 3 });
  const [lunch, setLunch] = useState({ date: '', type: 'Special', venue: 'VIP' });
  const [hotel, setHotel] = useState({ required: false, detail: '' });
  const [plantTour, setPlantTour] = useState('Bus');
  const [taxiRows, setTaxiRows] = useState([{ id: 1, date: '', time: '', from: '', to: '' }]);
  const [matrix, setMatrix] = useState({});
  const [attendees, setAttendees] = useState([
    { id: 1, name: 'MD San', role: 'MD', schedule: {} },
    { id: 2, name: 'GMD San', role: 'GMD', schedule: {} },
  ]);
  const [prevVisitDate, setPrevVisitDate] = useState('');
  const [visitedBefore, setVisitedBefore] = useState('No');

  const addTaxiRow = () => setTaxiRows(p => [...p, { id: Date.now(), date: '', time: '', from: '', to: '' }]);
  const updTaxi = (id, field, val) => setTaxiRows(p => p.map(r => r.id === id ? { ...r, [field]: val } : r));
  const removeTaxi = (id) => setTaxiRows(p => p.filter(r => r.id !== id));

  const handleNext = async () => {
    setError('');
    if (!formData.company.trim()) { setError('Please enter the company name.'); return; }
    setSaving(true);
    try {
      const visit = await api.createVisit(
        {
          company: formData.company, visitDate: formData.visitDate, visitStart: formData.visitStart,
          visitEnd: formData.visitEnd, visitAdvisor: formData.visitAdvisor, visitNo: formData.visitNo, visitPurpose: formData.visitPurpose
        },
        formData.visitors
      );
      onNext(visit.id);
    } catch (e) {
      setError(e.message || 'Failed to save visit.');
    } finally {
      setSaving(false);
    }
  };

  const inputRow = { padding: "5px 7px", border: `1px dashed ${T.border}`, borderRadius: 4, fontSize: 11, background: "#F8FAFF", boxSizing: "border-box", width: "100%", fontFamily: "'Segoe UI',Arial,sans-serif" };

  return (
    <div style={{ background: T.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif", minHeight: "100vh" }}>

      {/* ── VIS sub-header with key fields ── */}
      <div style={{ background: "#ffffff", borderBottom: `1px solid ${T.border}`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>Visit Advisor</label>
          <input value={formData.visitAdvisor} onChange={e => upd('visitAdvisor', e.target.value)}
            style={{ flex: 1, padding: "5px 9px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, fontWeight: 500, outline: "none", color: T.text, minWidth: 130 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>Date</label>
          <input type="date" value={formData.visitDate} onChange={e => upd('visitDate', e.target.value)}
            style={{ padding: "5px 9px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, outline: "none", color: T.text }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>Time</label>
          <input type="time" value={formData.visitStart} onChange={e => upd('visitStart', e.target.value)}
            style={{ padding: "5px 8px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, outline: "none", color: T.text, width: 100 }} />
          <span style={{ color: T.muted, fontSize: 12 }}>to</span>
          <input type="time" value={formData.visitEnd} onChange={e => upd('visitEnd', e.target.value)}
            style={{ padding: "5px 8px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, outline: "none", color: T.text, width: 100 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>Visit No.</label>
          <input value={formData.visitNo} onChange={e => upd('visitNo', e.target.value)} placeholder="e.g. 3rd"
            style={{ padding: "5px 9px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, fontWeight: 600, outline: "none", color: T.text, width: 80 }} />
        </div>
        <div style={{ marginLeft: "auto" }}>
          {error && <span style={{ color: "#DC2626", fontSize: 12, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 5, padding: "4px 10px" }}>⚠️ {error}</span>}
        </div>
      </div>

      {/* ── 3-COLUMN LAYOUT ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 20px", display: "grid", gridTemplateColumns: "220px 1fr 220px", gap: 14, alignItems: "start" }}>

        {/* ════════════ LEFT COLUMN ════════════ */}
        <div>
          {/* Company & Visit Details */}
          <SectionCard num="①" title="Company & Visit Details">
            <Label>Name of Company</Label>
            <TInput value={formData.company} onChange={e => upd('company', e.target.value)} placeholder="Toyota Kirloskar Motor" style={{ marginBottom: 10 }} />
            <Label>Visit Purpose</Label>
            <textarea value={formData.visitPurpose} onChange={e => upd('visitPurpose', e.target.value)} rows={3}
              placeholder="Production system assessment & kaizen review"
              style={{ width: "100%", padding: "6px 9px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, resize: "vertical", boxSizing: "border-box", marginBottom: 10, fontFamily: "'Segoe UI',Arial,sans-serif" }} />
            <Label>Date of Previous Visit</Label>
            <TInput type="date" value={prevVisitDate} onChange={e => setPrevVisitDate(e.target.value)} style={{ marginBottom: 10 }} />
            <Label>Visited Before?</Label>
            <div style={{ display: "flex", gap: 14, marginTop: 2 }}>
              <Radio checked={visitedBefore === 'Yes'} onChange={() => setVisitedBefore('Yes')} label="Yes" />
              <Radio checked={visitedBefore === 'No'} onChange={() => setVisitedBefore('No')} label="No" />
            </div>
          </SectionCard>

          {/* Hotel Booking */}
          <SectionCard num="②" title="Hotel Booking">
            <Label>Required?</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: hotel.required ? 10 : 0 }}>
              <div onClick={() => setHotel(p => ({ ...p, required: !p.required }))}
                style={{ width: 38, height: 20, borderRadius: 10, background: hotel.required ? T.accent : "#CBD5E1", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: hotel.required ? 20 : 2, transition: "left 0.2s" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: hotel.required ? T.accent : T.muted }}>{hotel.required ? "Yes" : "No"}</span>
            </div>
            {hotel.required && (
              <TInput value={hotel.detail} onChange={e => setHotel(p => ({ ...p, detail: e.target.value }))}
                placeholder="" />
            )}
          </SectionCard>

          {/* Plant Tour By */}
          <SectionCard num="③" title="Plant Tour By">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {['Bus', 'Car', 'Walk', 'Buggy'].map(opt => (
                <Radio key={opt} checked={plantTour === opt} onChange={() => setPlantTour(opt)} label={opt} />
              ))}
            </div>
          </SectionCard>

          {/* Taxi / Bus Schedule */}
          <SectionCard num="④" title="Taxi / Bus Schedule">
            {taxiRows.map((row, idx) => (
              <div key={row.id} style={{ marginBottom: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 4 }}>
                  <div>
                    <div style={{ fontSize: 9, color: T.muted, marginBottom: 2 }}>Date</div>
                    <input type="date" value={row.date} onChange={e => updTaxi(row.id, 'date', e.target.value)} style={{ ...inputRow }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: T.muted, marginBottom: 2 }}>Time</div>
                    <input type="time" value={row.time} onChange={e => updTaxi(row.id, 'time', e.target.value)} style={{ ...inputRow }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: T.muted, marginBottom: 2 }}>From</div>
                    <input value={row.from} onChange={e => updTaxi(row.id, 'from', e.target.value)} placeholder="From" style={{ ...inputRow }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: T.muted, marginBottom: 2 }}>To</div>
                    <input value={row.to} onChange={e => updTaxi(row.id, 'to', e.target.value)} placeholder="To" style={{ ...inputRow }} />
                  </div>
                </div>
                {taxiRows.length > 1 && (
                  <button onClick={() => removeTaxi(row.id)} style={{ background: "none", border: "none", color: "#E53935", fontSize: 11, cursor: "pointer", padding: 0 }}>− Remove</button>
                )}
                {idx < taxiRows.length - 1 && <div style={{ height: 1, background: T.border, marginTop: 6 }} />}
              </div>
            ))}
            <button onClick={addTaxiRow} style={{ background: "none", border: "none", color: T.accent, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0, marginTop: 2 }}>+ Add row</button>
          </SectionCard>
        </div>

        {/* ════════════ CENTRE COLUMN ════════════ */}
        <div>
          {/* Visitor Details */}
          <SectionCard num="⑤" title="Visitor Details">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: 11, color: T.muted }}>
                Enter visitor name — previous visit details will be auto-suggested or click to fetch.
              </div>
              <button
                type="button"
                onClick={() => handleLookupVisitor()}
                disabled={isSearching}
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  opacity: isSearching ? 0.7 : 1,
                  boxShadow: "0 2px 4px rgba(124,58,237,0.25)",
                  transition: "all 0.2s"
                }}
              >
                {isSearching ? '🔍 Searching…' : '⚡ Fetch Previous Details'}
              </button>
            </div>

            {fetchStatus && (
              <div style={{
                marginBottom: 8,
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                background: fetchStatus.type === 'success' ? '#F0FDF4' : '#EFF6FF',
                color: fetchStatus.type === 'success' ? '#166534' : '#1E40AF',
                border: `1px solid ${fetchStatus.type === 'success' ? '#BBF7D0' : '#BFDBFE'}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span>{fetchStatus.msg}</span>
                <button onClick={() => setFetchStatus(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "inherit", padding: "0 4px" }}>×</button>
              </div>
            )}

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: T.bg }}>
                    {["S.No", "Title", "Name", "Designation", "Company", "Dept/Division", "Visited Before", "Prev. Visit Date", ""].map(h => (
                      <th key={h} style={{ padding: "5px 7px", textAlign: "left", color: T.muted, fontWeight: 600, fontSize: 10, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData.visitors.map((v, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? T.row1 : T.row2 }}>
                      <td style={{ padding: "5px 7px", color: T.muted, borderBottom: `1px solid ${T.border}` }}>{i + 1}</td>
                      <td style={{ padding: "5px 7px", borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ background: "#EEF2FF", color: "#3730A3", border: "1px solid #C7D2FE", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700 }}>{v.title || 'Mr'}</span>
                      </td>
                      <td style={{ padding: "5px 7px", borderBottom: `1px solid ${T.border}`, fontWeight: 600 }}>{v.name}</td>
                      <td style={{ padding: "5px 7px", borderBottom: `1px solid ${T.border}` }}>{v.designation}</td>
                      <td style={{ padding: "5px 7px", borderBottom: `1px solid ${T.border}` }}>{v.company}</td>
                      <td style={{ padding: "5px 7px", borderBottom: `1px solid ${T.border}` }}>{v.dept}</td>
                      <td style={{ padding: "5px 7px", borderBottom: `1px solid ${T.border}`, textAlign: "center" }}>
                        <CircleToggle checked={v.visitedBefore} onChange={() => toggleVisited(i)} />
                      </td>
                      <td style={{ padding: "3px 6px", borderBottom: `1px solid ${T.border}` }}>
                        <input type="date" value={v.prevDate || ''} onChange={e => updVisitorField(i, 'prevDate', e.target.value)}
                          style={{ border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 5px", fontSize: 11, background: T.white, width: 120 }} />
                      </td>
                      <td style={{ padding: "5px 7px", borderBottom: `1px solid ${T.border}` }}>
                        <button onClick={() => removeVisitor(i)} style={{ background: "none", border: "none", color: "#E53935", cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
                      </td>
                    </tr>
                  ))}
                  {/* Add row */}
                  <tr style={{ background: "#FAFBFF" }}>
                    <td style={{ padding: "5px 7px", color: T.muted, fontSize: 11 }}>{formData.visitors.length + 1}</td>
                    <td style={{ padding: "3px 5px" }}>
                      <select value={newVisitor.title} onChange={e => setNewVisitor(p => ({ ...p, title: e.target.value }))}
                        style={{ padding: "3px 5px", border: `1px dashed ${T.border}`, borderRadius: 4, fontSize: 11, background: "#F8FAFF", width: 65 }}>
                        {TITLES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    {/* Name input with suggestions */}
                    <td style={{ padding: "3px 5px", position: "relative", minWidth: 120 }}>
                      <input
                        value={newVisitor.name}
                        onChange={e => handleNameChange(e.target.value)}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                        onKeyDown={e => e.key === 'Enter' && addVisitor()}
                        placeholder="Name"
                        style={{ ...inputRow }}
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          zIndex: 100,
                          background: "white",
                          border: `1px solid ${T.navy}`,
                          borderRadius: 6,
                          boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                          maxHeight: 210,
                          overflowY: "auto",
                          marginTop: 2,
                          minWidth: 280
                        }}>
                          <div style={{ padding: "5px 9px", background: "#F1F5F9", fontSize: 9, fontWeight: 700, color: T.muted, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
                            <span>PREVIOUS VISITORS FOUND</span>
                            <span>Click to auto-fill</span>
                          </div>
                          {suggestions.map((s, idx) => (
                            <div
                              key={idx}
                              onClick={() => selectSuggestion(s)}
                              style={{
                                padding: "7px 9px",
                                borderBottom: idx < suggestions.length - 1 ? `1px solid ${T.border}` : 'none',
                                cursor: "pointer",
                                fontSize: 11,
                                background: "white",
                                transition: "background 0.15s"
                              }}
                              onMouseDown={e => e.preventDefault()}
                              onMouseEnter={e => e.currentTarget.style.background = "#F5F3FF"}
                              onMouseLeave={e => e.currentTarget.style.background = "white"}
                            >
                              <div style={{ fontWeight: 600, color: T.text }}>
                                {s.title || 'Mr'} {s.name} <span style={{ fontWeight: 400, color: T.muted }}>({s.designation || 'N/A'})</span>
                              </div>
                              <div style={{ fontSize: 10, color: T.muted, marginTop: 2, display: "flex", justifyContent: "space-between", gap: 8 }}>
                                <span>🏢 {s.company} ({s.dept || 'General'})</span>
                                <span style={{ fontWeight: 600, color: "#7C3AED" }}>📅 {s.prev_visit_date || 'Previous Visit'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "3px 5px" }}>
                      <input value={newVisitor.designation} onChange={e => setNewVisitor(p => ({ ...p, designation: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addVisitor()}
                        placeholder="Designation"
                        style={{ ...inputRow }} />
                    </td>
                    <td style={{ padding: "3px 5px" }}>
                      <input value={newVisitor.company} onChange={e => setNewVisitor(p => ({ ...p, company: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addVisitor()}
                        placeholder="Company"
                        style={{ ...inputRow }} />
                    </td>
                    <td style={{ padding: "3px 5px" }}>
                      <input value={newVisitor.dept} onChange={e => setNewVisitor(p => ({ ...p, dept: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addVisitor()}
                        placeholder="Dept"
                        style={{ ...inputRow }} />
                    </td>
                    <td colSpan={3} style={{ padding: "3px 7px", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => handleLookupVisitor()}
                        title="Fetch previous visit details for entered name"
                        style={{ background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", fontWeight: 600, marginRight: 4 }}>
                        ⚡ Fetch Prev
                      </button>
                      <button onClick={addVisitor}
                        style={{ background: T.accent, color: "white", border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                        + Add
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Visit Purpose Matrix */}
          <SectionCard num="⑥" title="Visit Purpose Matrix">
            <VisitPurposeMatrix matrix={matrix} setMatrix={setMatrix} />
          </SectionCard>

          {/* TIEI Top Attendees */}
          <SectionCard num="⑦" title="TIEI Top Attendees — Meeting Schedule">
            <AttendeesGrid visitDate={formData.visitDate} attendees={attendees} setAttendees={setAttendees} />
          </SectionCard>
        </div>

        {/* ════════════ RIGHT COLUMN ════════════ */}
        <div>
          {/* Rehearsals */}
          <SectionCard num="⑧" title="Rehearsals">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
              {[['mdSan', 'MD San'], ['gmdSan', 'GMD San'], ['svp', 'SVP'], ['vp', 'VP'], ['avp', 'AVP'], ['hdd', 'HDD']].map(([key, lbl]) => (
                <Checkbox key={key} checked={rehearsals[key]} label={lbl} onChange={e => setRehearsals(p => ({ ...p, [key]: e.target.checked }))} />
              ))}
            </div>
            <Label>No. of Rehearsals</Label>
            <TInput type="number" value={rehearsals.count} onChange={e => setRehearsals(p => ({ ...p, count: e.target.value }))} style={{ width: 70 }} />
          </SectionCard>

          {/* Lunch at TIEI */}
          <SectionCard num="⑨" title="Lunch at TIEI">
            <Label>Date</Label>
            <TInput type="date" value={lunch.date} onChange={e => setLunch(p => ({ ...p, date: e.target.value }))} style={{ marginBottom: 10 }} />
            <Label>Type</Label>
            <TSelect value={lunch.type} onChange={e => setLunch(p => ({ ...p, type: e.target.value }))} style={{ marginBottom: 10 }}>
              {['Special', 'Regular', 'Japanese', 'Buffet'].map(t => <option key={t}>{t}</option>)}
            </TSelect>
            <Label>Venue</Label>
            <TSelect value={lunch.venue} onChange={e => setLunch(p => ({ ...p, venue: e.target.value }))}>
              {['VIP', 'Main Hall', 'Conference Room', 'Cafeteria'].map(v => <option key={v}>{v}</option>)}
            </TSelect>
          </SectionCard>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <button onClick={handleNext} disabled={saving}
              style={{ background: "#7C3AED", color: "white", border: "none", borderRadius: 7, padding: "11px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Next: Build Agenda →'}
            </button>
            <button style={{ background: "white", color: "#374151", border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 16px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              Save Draft
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
