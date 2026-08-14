import { useState, useEffect } from 'react';
import { api } from './api.js';

// ── COLOR THEME ───────────────────────────────────────────────────────────────
const T = {
  navy: '#7C3AED',
  navyMid: '#6D28D9',
  accent: '#7C3AED',
  accentDark: '#6D28D9',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  white: '#FFFFFF',
  row1: '#FFFFFF',
  row2: '#F8FAFF',
};

const TITLES = ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof'];

const EMPTY_VISITOR = {
  title: 'Mr',
  name: '',
  designation: '',
  company: '',
  dept: '',
  visitedBefore: false,
  prevDate: '',
};

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────
const SectionCard = ({ num, title, children, style = {} }) => (
  <div style={{
    background: T.card,
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    marginBottom: 14,
    ...style
  }}>
    <div style={{
      background: T.navy,
      color: "white",
      padding: "8px 12px",
      fontSize: 12,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      gap: 6
    }}>
      <span style={{ fontSize: 13 }}>{num}</span>
      <span>{title}</span>
    </div>
    <div style={{ padding: "12px 14px" }}>
      {children}
    </div>
  </div>
);

const Label = ({ children, required }) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>
    {children} {required && <span style={{ color: '#DC2626' }}>*</span>}
  </div>
);

const TInput = ({ style = {}, ...props }) => (
  <input style={{
    width: "100%", padding: "6px 9px", border: `1px solid ${T.border}`,
    borderRadius: 5, fontSize: 12, outline: "none", boxSizing: "border-box",
    background: T.white, color: T.text, fontFamily: "'Segoe UI',Arial,sans-serif",
    ...style
  }} {...props} />
);

const TSelect = ({ children, style = {}, ...props }) => (
  <select style={{
    width: "100%", padding: "6px 9px", border: `1px solid ${T.border}`,
    borderRadius: 5, fontSize: 12, outline: "none", boxSizing: "border-box",
    background: T.white, color: T.text, fontFamily: "'Segoe UI',Arial,sans-serif",
    ...style
  }} {...props}>
    {children}
  </select>
);

const ToggleSwitch = ({ checked, onChange, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={onChange}>
    <div style={{
      width: 38, height: 20, borderRadius: 10,
      background: checked ? T.accent : "#CBD5E1",
      position: "relative", transition: "background 0.2s"
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: "50%", background: "white",
        position: "absolute", top: 2, left: checked ? 20 : 2, transition: "left 0.2s"
      }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 600, color: checked ? T.accent : T.muted }}>
      {label || (checked ? "Yes" : "No")}
    </span>
  </div>
);

const Radio = ({ checked, onChange, label }) => (
  <label style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer", color: T.text }}>
    <input type="radio" checked={checked} onChange={onChange} style={{ accentColor: T.accent }} />
    {label}
  </label>
);

const Checkbox = ({ checked, onChange, label }) => (
  <label style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer", color: T.text }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: T.accent }} />
    {label}
  </label>
);

const CircleToggle = ({ checked, onChange }) => (
  <div onClick={onChange} style={{
    width: 16, height: 16, borderRadius: "50%",
    border: `2px solid ${T.navy}`, background: checked ? T.navy : "white",
    margin: "auto", cursor: "pointer"
  }} />
);

// ── Visit Purpose Matrix ───────────────────────────────────────────────────────
const MATRIX_ROWS = ["Learn System / Facility", "Glide System / Facility", "Assess Mgmt/Capability"];
const MATRIX_COLS = ["Customer", "Parts", "Equip/Tools", "Group Co.", "Govt", "Others"];

function VisitPurposeMatrix({ matrix = {}, setMatrix }) {
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

function generateDates(startDate) {
  if (!startDate) return ['Visit Date'];
  const d = new Date(startDate);
  return [d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })];
}

function AttendeesGrid({ visitDate, attendees = [], setAttendees }) {
  const dates = generateDates(visitDate);
  const EMPTY = { name: '', role: '', email: '', schedule: {} };

  const addRow = () => setAttendees(p => [...p, { ...EMPTY, id: Date.now() }]);
  const updField = (idx, field, val) => setAttendees(p => p.map((a, i) => i === idx ? { ...a, [field]: val } : a));
  const toggleCell = (idx, dateIdx, col) => {
    const key = `${dateIdx}-${col}`;
    setAttendees(p => p.map((a, i) => i === idx ? { ...a, schedule: { ...a.schedule, [key]: !a.schedule[key] } } : a));
  };

  const thStyle = { padding: "6px 8px", color: "white", fontWeight: 600, fontSize: 10, textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.15)", whiteSpace: "nowrap" };
  const tdStyle = { padding: "5px 6px", textAlign: "center", borderBottom: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 11, width: "100%", minWidth: 620 }}>
        <thead>
          <tr style={{ background: T.navy }}>
            <th style={{ ...thStyle, textAlign: "left", width: 35 }}><span style={{ color: "white" }}>S.No</span></th>
            <th style={{ ...thStyle, textAlign: "left", minWidth: 100 }}>Name *</th>
            <th style={{ ...thStyle, textAlign: "left", minWidth: 70 }}>Role *</th>
            <th style={{ ...thStyle, textAlign: "left", minWidth: 140 }}>Email (For Agenda PDF) *</th>
            {dates.map((date, di) => (
              <th key={di} colSpan={SESSION_COLS.length} style={{ ...thStyle, borderLeft: "1px solid rgba(255,255,255,0.3)" }}>
                📅 {date}
              </th>
            ))}
            <th style={{ ...thStyle, width: 24 }}></th>
          </tr>
          <tr style={{ background: T.navyMid }}>
            <th colSpan={4}></th>
            {dates.map((_, di) => (
              SESSION_COLS.map(col => (
                <th key={`${di}-${col}`} style={{ ...thStyle, fontSize: 8.5, padding: "4px 6px" }}>{col}</th>
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
                  placeholder="Attendee Name" style={{ width: "100%", padding: "4px 6px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 11, boxSizing: "border-box" }} />
              </td>
              <td style={{ ...tdStyle, padding: "4px 5px" }}>
                <input value={att.role} onChange={e => updField(idx, 'role', e.target.value)}
                  placeholder="Role" style={{ width: "100%", padding: "4px 6px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 11, boxSizing: "border-box", background: "#FFF3CD" }} />
              </td>
              <td style={{ ...tdStyle, padding: "4px 5px" }}>
                <input type="email" value={att.email || ''} onChange={e => updField(idx, 'email', e.target.value)}
                  placeholder="name@company.com" style={{ width: "100%", padding: "4px 6px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 11, boxSizing: "border-box", background: "#F0FDF4" }} />
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
            <td colSpan={4 + dates.length * SESSION_COLS.length + 1} style={{ padding: "8px 8px" }}>
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
export default function Screen1({ formData, setFormData, onNext, onBack }) {
  const [error, setError] = useState('');
  const [newVisitor, setNewVisitor] = useState({ ...EMPTY_VISITOR });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const upd = (key, val) => setFormData(p => ({ ...p, [key]: val }));

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
    if (s.prev_visit_date) upd('prevVisitDate', s.prev_visit_date);
    upd('visitedBefore', 'Yes');
    if (!formData.company && s.company) {
      upd('company', s.company);
    }
    setSuggestions([]);
    setShowSuggestions(false);
    setFetchStatus({
      type: 'success',
      msg: `✅ Auto-fetched details for ${s.name} (Last Visit: ${s.prev_visit_date || 'Recorded'})`
    });
  };

  const handleLookupVisitor = async (queryName) => {
    const q = queryName || newVisitor.name || formData.company;
    if (!q || !q.trim()) {
      setFetchStatus({ type: 'info', msg: 'Please enter a visitor or company name to fetch previous details.' });
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
        if (res.prev_visit_date) upd('prevVisitDate', res.prev_visit_date);
        upd('visitedBefore', 'Yes');
        if (!formData.company && res.company) {
          upd('company', res.company);
        }
        setFetchStatus({
          type: 'success',
          msg: `✅ Found previous record from ${res.prev_visit_date || 'past date'}! Auto-filled details.`
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
          if (check.prev_visit_date) upd('prevVisitDate', check.prev_visit_date);
          upd('visitedBefore', 'Yes');
        }
      } catch (_) { }
    }

    setFormData(p => ({
      ...p,
      visitors: [
        ...(p.visitors || []),
        {
          ...newVisitor,
          company: newVisitor.company.trim() || formData.company.trim(),
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
          if (res.prev_visit_date) upd('prevVisitDate', res.prev_visit_date);
          upd('visitedBefore', 'Yes');
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

  // Taxi schedule helpers
  const addTaxiRow = () => setFormData(p => ({
    ...p,
    taxi: {
      ...p.taxi,
      rows: [...(p.taxi?.rows || []), { id: Date.now(), date: p.visitDate || '', time: '09:00', from: '', to: '' }]
    }
  }));

  const updTaxi = (id, field, val) => setFormData(p => ({
    ...p,
    taxi: {
      ...p.taxi,
      rows: p.taxi.rows.map(r => r.id === id ? { ...r, [field]: val } : r)
    }
  }));

  const removeTaxi = (id) => setFormData(p => ({
    ...p,
    taxi: {
      ...p.taxi,
      rows: p.taxi.rows.filter(r => r.id !== id)
    }
  }));

  // Validate all mandatory fields before advancing to Screen 2
  const handleNext = () => {
    setError('');

    // Mandatory Header Validations
    if (!formData.company?.trim()) {
      setError('Company Name is required.');
      return;
    }
    if (!formData.visitAdvisor?.trim()) {
      setError('Visit Advisor is required.');
      return;
    }
    if (!formData.visitDate?.trim()) {
      setError('Visit Date is required.');
      return;
    }
    if (!formData.visitStart?.trim() || !formData.visitEnd?.trim()) {
      setError('Visit Start and End Times are required.');
      return;
    }
    if (!formData.visitNo?.trim()) {
      setError('Visit Number is required (e.g. 1st, 3rd).');
      return;
    }
    if (!formData.visitPurpose?.trim()) {
      setError('Visit Purpose is required.');
      return;
    }

    // Mandatory Visitors Validation
    if (!formData.visitors || formData.visitors.length === 0) {
      setError('Please add at least 1 Visitor in Section ⑤.');
      return;
    }
    for (let i = 0; i < formData.visitors.length; i++) {
      const v = formData.visitors[i];
      if (!v.name?.trim()) {
        setError(`Visitor #${i + 1} Name is required.`);
        return;
      }
      if (!v.designation?.trim()) {
        setError(`Visitor #${i + 1} Designation is required.`);
        return;
      }
      if (!v.company?.trim()) {
        setError(`Visitor #${i + 1} Company is required.`);
        return;
      }
    }

    // Mandatory Top Attendees Email Validation
    if (formData.topAttendees && formData.topAttendees.length > 0) {
      for (let i = 0; i < formData.topAttendees.length; i++) {
        const att = formData.topAttendees[i];
        if (att.name?.trim() && (!att.email?.trim() || !att.email.includes('@'))) {
          setError(`Please provide a valid email for Top Attendee "${att.name}" so the agenda can be sent.`);
          return;
        }
      }
    }

    // Hotel Booking Validation
    if (formData.hotel?.required && !formData.hotel.detail?.trim()) {
      setError('Please enter Hotel Booking Details in Section ②.');
      return;
    }

    // Taxi Booking Validation
    if (formData.taxi?.required) {
      const rows = formData.taxi.rows || [];
      if (rows.length === 0) {
        setError('Please add at least 1 Taxi / Bus schedule row in Section ④.');
        return;
      }
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (!r.date || !r.time || !r.from?.trim() || !r.to?.trim()) {
          setError(`Please fill all fields (Date, Time, From, To) for Taxi row #${i + 1}.`);
          return;
        }
      }
    }

    // Lunch Validation
    if (formData.lunch?.required && !formData.lunch.date) {
      setError('Please enter Lunch Date in Section ⑨.');
      return;
    }

    // All validations passed! Advance to Step 2 (Agenda Builder in-memory)
    onNext();
  };

  const inputRow = {
    padding: "5px 7px", border: `1px dashed ${T.border}`, borderRadius: 4,
    fontSize: 11, background: "#F8FAFF", boxSizing: "border-box", width: "100%",
    fontFamily: "'Segoe UI',Arial,sans-serif"
  };

  return (
    <div style={{ background: T.bg, fontFamily: "'Inter','Segoe UI',Arial,sans-serif", minHeight: "100vh" }}>

      {/* ── Sub-header with key fields ── */}
      <div style={{ background: "#ffffff", borderBottom: `1px solid ${T.border}`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200 }}>
          <Label required>Visit Advisor</Label>
          <input value={formData.visitAdvisor || ''} onChange={e => upd('visitAdvisor', e.target.value)}
            placeholder="Advisor Name"
            style={{ flex: 1, padding: "5px 9px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, fontWeight: 500, outline: "none", color: T.text, minWidth: 130 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Label required>Date</Label>
          <input type="date" value={formData.visitDate || ''} onChange={e => upd('visitDate', e.target.value)}
            style={{ padding: "5px 9px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, outline: "none", color: T.text }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Label required>Time</Label>
          <input type="time" value={formData.visitStart || '09:00'} onChange={e => upd('visitStart', e.target.value)}
            style={{ padding: "5px 8px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, outline: "none", color: T.text, width: 100 }} />
          <span style={{ color: T.muted, fontSize: 12 }}>to</span>
          <input type="time" value={formData.visitEnd || '17:00'} onChange={e => upd('visitEnd', e.target.value)}
            style={{ padding: "5px 8px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, outline: "none", color: T.text, width: 100 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Label required>Visit No.</Label>
          <input value={formData.visitNo || ''} onChange={e => upd('visitNo', e.target.value)} placeholder="e.g. 1st"
            style={{ padding: "5px 9px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, fontWeight: 600, outline: "none", color: T.text, width: 80 }} />
        </div>
        <div style={{ marginLeft: "auto" }}>
          {error && <span style={{ color: "#DC2626", fontSize: 12, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 5, padding: "5px 12px", fontWeight: 600 }}>⚠️ {error}</span>}
        </div>
      </div>

      {/* ── 3-COLUMN LAYOUT ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 20px", display: "grid", gridTemplateColumns: "230px 1fr 230px", gap: 14, alignItems: "start" }}>

        {/* ════════════ LEFT COLUMN ════════════ */}
        <div>
          {/* Section ①: Company & Visit Details */}
          <SectionCard num="①" title="Company & Visit Details">
            <Label required>Name of Company</Label>
            <TInput value={formData.company || ''} onChange={e => upd('company', e.target.value)} placeholder="e.g. Toyota Kirloskar Motor" style={{ marginBottom: 10 }} />
            
            <Label required>Visit Purpose</Label>
            <textarea value={formData.visitPurpose || ''} onChange={e => upd('visitPurpose', e.target.value)} rows={3}
              placeholder="e.g. Production system assessment & Gemba review"
              style={{ width: "100%", padding: "6px 9px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 12, resize: "vertical", boxSizing: "border-box", marginBottom: 10, fontFamily: "'Segoe UI',Arial,sans-serif" }} />
            
            <Label>Date of Previous Visit</Label>
            <TInput type="date" value={formData.prevVisitDate || ''} onChange={e => upd('prevVisitDate', e.target.value)} style={{ marginBottom: 10 }} />
            
            <Label>Visited Before?</Label>
            <div style={{ display: "flex", gap: 14, marginTop: 2 }}>
              <Radio checked={formData.visitedBefore === 'Yes'} onChange={() => upd('visitedBefore', 'Yes')} label="Yes" />
              <Radio checked={formData.visitedBefore !== 'Yes'} onChange={() => upd('visitedBefore', 'No')} label="No" />
            </div>
          </SectionCard>

          {/* Section ②: Hotel Booking with Toggle */}
          <SectionCard num="②" title="Hotel Booking">
            <Label>Required?</Label>
            <div style={{ marginBottom: formData.hotel?.required ? 10 : 0 }}>
              <ToggleSwitch
                checked={!!formData.hotel?.required}
                onChange={() => upd('hotel', { ...formData.hotel, required: !formData.hotel?.required })}
              />
            </div>
            {formData.hotel?.required ? (
              <div>
                <Label required>Hotel Details</Label>
                <textarea
                  value={formData.hotel?.detail || ''}
                  onChange={e => upd('hotel', { ...formData.hotel, detail: e.target.value })}
                  placeholder="Hotel name, room count, check-in details"
                  rows={2}
                  style={{ width: "100%", padding: "6px 9px", border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 11, boxSizing: "border-box" }}
                />
              </div>
            ) : (
              <div style={{ fontSize: 11, color: T.muted, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4, border: `1px dashed ${T.border}` }}>
                ℹ️ No Hotel Booking Required
              </div>
            )}
          </SectionCard>

          {/* Section ③: Plant Tour By */}
          <SectionCard num="③" title="Plant Tour By">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {['Bus', 'Car', 'Walk', 'Buggy'].map(opt => (
                <Radio key={opt} checked={(formData.plantTour || 'Bus') === opt} onChange={() => upd('plantTour', opt)} label={opt} />
              ))}
            </div>
          </SectionCard>

          {/* Section ④: Taxi / Bus Schedule with Toggle */}
          <SectionCard num="④" title="Taxi / Bus Schedule">
            <Label>Required?</Label>
            <div style={{ marginBottom: formData.taxi?.required ? 10 : 0 }}>
              <ToggleSwitch
                checked={!!formData.taxi?.required}
                onChange={() => upd('taxi', { ...formData.taxi, required: !formData.taxi?.required })}
              />
            </div>
            
            {formData.taxi?.required ? (
              <div>
                {(formData.taxi?.rows || []).map((row, idx) => (
                  <div key={row.id || idx} style={{ marginBottom: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 9, color: T.muted, marginBottom: 2 }}>Date *</div>
                        <input type="date" value={row.date || formData.visitDate || ''} onChange={e => updTaxi(row.id, 'date', e.target.value)} style={{ ...inputRow }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: T.muted, marginBottom: 2 }}>Time *</div>
                        <input type="time" value={row.time || '09:00'} onChange={e => updTaxi(row.id, 'time', e.target.value)} style={{ ...inputRow }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: T.muted, marginBottom: 2 }}>From *</div>
                        <input value={row.from || ''} onChange={e => updTaxi(row.id, 'from', e.target.value)} placeholder="From location" style={{ ...inputRow }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: T.muted, marginBottom: 2 }}>To *</div>
                        <input value={row.to || ''} onChange={e => updTaxi(row.id, 'to', e.target.value)} placeholder="To destination" style={{ ...inputRow }} />
                      </div>
                    </div>
                    {(formData.taxi.rows.length > 1) && (
                      <button onClick={() => removeTaxi(row.id)} style={{ background: "none", border: "none", color: "#E53935", fontSize: 11, cursor: "pointer", padding: 0 }}>− Remove</button>
                    )}
                    {idx < formData.taxi.rows.length - 1 && <div style={{ height: 1, background: T.border, marginTop: 6 }} />}
                  </div>
                ))}
                <button onClick={addTaxiRow} style={{ background: "none", border: "none", color: T.accent, fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0, marginTop: 2 }}>+ Add row</button>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: T.muted, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4, border: `1px dashed ${T.border}` }}>
                ℹ️ No Taxi / Bus Booking Required
              </div>
            )}
          </SectionCard>
        </div>

        {/* ════════════ CENTRE COLUMN ════════════ */}
        <div>
          {/* Section ⑤: Visitor Details */}
          <SectionCard num="⑤" title="Visitor Details (At least 1 required)">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: 11, color: T.muted }}>
                Enter visitor name — suggestions auto-fill previous records.
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
                  boxShadow: "0 2px 4px rgba(124,58,237,0.25)"
                }}
              >
                {isSearching ? '🔍 Searching…' : '⚡ Auto-Fill Previous Details'}
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
                <button onClick={() => setFetchStatus(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "inherit" }}>×</button>
              </div>
            )}

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: T.bg }}>
                    {["S.No", "Title", "Name *", "Designation *", "Company *", "Dept", "Visited Before", "Prev. Visit Date", ""].map(h => (
                      <th key={h} style={{ padding: "5px 7px", textAlign: "left", color: T.muted, fontWeight: 600, fontSize: 10, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(formData.visitors || []).map((v, i) => (
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
                          style={{ border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 5px", fontSize: 11, background: T.white, width: 115 }} />
                      </td>
                      <td style={{ padding: "5px 7px", borderBottom: `1px solid ${T.border}` }}>
                        <button onClick={() => removeVisitor(i)} style={{ background: "none", border: "none", color: "#E53935", cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Row to add new visitor */}
                  <tr style={{ background: "#FAFBFF" }}>
                    <td style={{ padding: "5px 7px", color: T.muted, fontSize: 11 }}>{(formData.visitors || []).length + 1}</td>
                    <td style={{ padding: "3px 5px" }}>
                      <select value={newVisitor.title} onChange={e => setNewVisitor(p => ({ ...p, title: e.target.value }))}
                        style={{ padding: "3px 5px", border: `1px dashed ${T.border}`, borderRadius: 4, fontSize: 11, background: "#F8FAFF", width: 60 }}>
                        {TITLES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "3px 5px", position: "relative", minWidth: 120 }}>
                      <input
                        value={newVisitor.name}
                        onChange={e => handleNameChange(e.target.value)}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                        onKeyDown={e => e.key === 'Enter' && addVisitor()}
                        placeholder="Visitor Name *"
                        style={{ ...inputRow }}
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div style={{
                          position: "absolute", top: "100%", left: 0, zIndex: 100,
                          background: "white", border: `1px solid ${T.navy}`, borderRadius: 6,
                          boxShadow: "0 6px 16px rgba(0,0,0,0.18)", maxHeight: 210, overflowY: "auto",
                          marginTop: 2, minWidth: 280
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
                                cursor: "pointer", fontSize: 11, background: "white"
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#F5F3FF"}
                              onMouseLeave={e => e.currentTarget.style.background = "white"}
                            >
                              <div style={{ fontWeight: 600, color: T.text }}>
                                {s.title || 'Mr'} {s.name} <span style={{ fontWeight: 400, color: T.muted }}>({s.designation || 'N/A'})</span>
                              </div>
                              <div style={{ fontSize: 10, color: T.muted, marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                                <span>🏢 {s.company}</span>
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
                        placeholder="Designation *"
                        style={{ ...inputRow }} />
                    </td>
                    <td style={{ padding: "3px 5px" }}>
                      <input value={newVisitor.company || formData.company || ''} onChange={e => setNewVisitor(p => ({ ...p, company: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addVisitor()}
                        placeholder="Company *"
                        style={{ ...inputRow }} />
                    </td>
                    <td style={{ padding: "3px 5px" }}>
                      <input value={newVisitor.dept} onChange={e => setNewVisitor(p => ({ ...p, dept: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addVisitor()}
                        placeholder="Dept"
                        style={{ ...inputRow }} />
                    </td>
                    <td colSpan={3} style={{ padding: "3px 7px", whiteSpace: "nowrap" }}>
                      <button onClick={addVisitor}
                        style={{ background: T.accent, color: "white", border: "none", borderRadius: 4, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                        + Add Visitor
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Section ⑥: Visit Purpose Matrix */}
          <SectionCard num="⑥" title="Visit Purpose Matrix">
            <VisitPurposeMatrix matrix={formData.matrix || {}} setMatrix={m => upd('matrix', typeof m === 'function' ? m(formData.matrix || {}) : m)} />
          </SectionCard>

          {/* Section ⑦: TIEI Top Attendees */}
          <SectionCard num="⑦" title="TIEI Top Attendees — Meeting Schedule">
            <AttendeesGrid
              visitDate={formData.visitDate}
              attendees={formData.topAttendees || []}
              setAttendees={a => upd('topAttendees', typeof a === 'function' ? a(formData.topAttendees || []) : a)}
            />
          </SectionCard>
        </div>

        {/* ════════════ RIGHT COLUMN ════════════ */}
        <div>
          {/* Section ⑧: Rehearsals */}
          <SectionCard num="⑧" title="Rehearsals">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
              {[['mdSan', 'MD San'], ['gmdSan', 'GMD San'], ['svp', 'SVP'], ['vp', 'VP'], ['avp', 'AVP'], ['hdd', 'HDD']].map(([key, lbl]) => (
                <Checkbox
                  key={key}
                  checked={!!(formData.rehearsals || {})[key]}
                  label={lbl}
                  onChange={e => upd('rehearsals', { ...(formData.rehearsals || {}), [key]: e.target.checked })}
                />
              ))}
            </div>
            <Label>No. of Rehearsals</Label>
            <TInput
              type="number"
              value={(formData.rehearsals || {}).count || 3}
              onChange={e => upd('rehearsals', { ...(formData.rehearsals || {}), count: e.target.value })}
              style={{ width: 70 }}
            />
          </SectionCard>

          {/* Section ⑨: Lunch at TIEI with Toggle */}
          <SectionCard num="⑨" title="Lunch at TIEI">
            <Label>Required?</Label>
            <div style={{ marginBottom: formData.lunch?.required ? 10 : 0 }}>
              <ToggleSwitch
                checked={!!formData.lunch?.required}
                onChange={() => upd('lunch', { ...formData.lunch, required: !formData.lunch?.required, date: formData.visitDate || '' })}
              />
            </div>
            
            {formData.lunch?.required ? (
              <div>
                <Label required>Date</Label>
                <TInput
                  type="date"
                  value={formData.lunch?.date || formData.visitDate || ''}
                  onChange={e => upd('lunch', { ...formData.lunch, date: e.target.value })}
                  style={{ marginBottom: 8 }}
                />
                <Label required>Type</Label>
                <TSelect
                  value={formData.lunch?.type || 'Special'}
                  onChange={e => upd('lunch', { ...formData.lunch, type: e.target.value })}
                  style={{ marginBottom: 8 }}
                >
                  {['Special', 'Regular', 'Japanese', 'Buffet'].map(t => <option key={t}>{t}</option>)}
                </TSelect>
                <Label required>Venue</Label>
                <TSelect
                  value={formData.lunch?.venue || 'VIP'}
                  onChange={e => upd('lunch', { ...formData.lunch, venue: e.target.value })}
                >
                  {['VIP', 'Main Hall', 'Conference Room', 'Cafeteria'].map(v => <option key={v}>{v}</option>)}
                </TSelect>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: T.muted, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4, border: `1px dashed ${T.border}` }}>
                ℹ️ No Lunch Arrangement Required
              </div>
            )}
          </SectionCard>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <button
              onClick={handleNext}
              style={{
                background: "#7C3AED", color: "white", border: "none", borderRadius: 7,
                padding: "12px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 2px 6px rgba(124,58,237,0.3)"
              }}
            >
              Next: Build Agenda →
            </button>
            <button
              onClick={onBack}
              style={{
                background: "white", color: T.muted, border: `1px solid ${T.border}`,
                borderRadius: 7, padding: "9px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer"
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
