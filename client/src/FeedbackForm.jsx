// Visitor-facing feedback form — served at /feedback
// Matches the actual TIEI feedback sheet format:
// company, date/time, visit purpose, visitor details, free-text feedback rows
import { useState, useEffect } from 'react';

const T = { navy:'#7C3AED', accent:'#7C3AED', green:'#059669', greenLt:'#DCFCE7', border:'#CBD5E1', bg:'#F0F4FA', muted:'#64748B', text:'#1E293B' };

const inputStyle = { width:'100%', padding:'8px 11px', border:`1.5px solid #CBD5E1`, borderRadius:6, fontSize:13, color:'#1E293B', background:'white', boxSizing:'border-box', fontFamily:"'Segoe UI',Arial,sans-serif", outline:'none' };
const labelStyle = { fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4, display:'block' };

export default function FeedbackForm() {
  // Pre-fill from URL params if staff shares a visit-specific link
  const params = new URLSearchParams(window.location.search);

  const [form, setForm] = useState({
    company:      params.get('company') || '',
    visit_date:   params.get('date')    || '',
    visit_time:   params.get('time')    || '',
    visit_purpose: params.get('purpose') || '',
  });

  const [visitors, setVisitors] = useState([
    { name:'', designation:'', company:'', dept:'', visited_before:'No', prev_date:'' },
  ]);

  const [feedbackRows, setFeedbackRows] = useState(
    Array.from({ length: 5 }, () => ({ feedback:'', from:'' }))
  );

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const updForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const updVisitor = (i, k, v) => setVisitors(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const addVisitor = () => setVisitors(p => [...p, { name:'', designation:'', company:'', dept:'', visited_before:'No', prev_date:'' }]);
  const removeVisitor = (i) => setVisitors(p => p.filter((_, idx) => idx !== i));

  const updFeedback = (i, k, v) => setFeedbackRows(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const addFeedbackRow = () => setFeedbackRows(p => [...p, { feedback:'', from:'' }]);

  const handleSubmit = async () => {
    if (!form.company.trim()) { setError('Please enter the company name.'); return; }
    const filledRows = feedbackRows.filter(r => r.feedback.trim());
    if (filledRows.length === 0) { setError('Please enter at least one feedback item.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, visitors, feedback_rows: filledRows }),
      });
      if (!res.ok) throw new Error('Submit failed');
      setSubmitted(true);
    } catch (e) { setError('Failed to submit. Please try again.'); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Segoe UI',Arial,sans-serif" }}>
      <div style={{ background:'white', border:`1px solid ${T.border}`, borderRadius:16, padding:'48px 40px', textAlign:'center', maxWidth:400, boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize:52, marginBottom:14 }}>🙏</div>
        <div style={{ fontSize:22, fontWeight:800, color:T.navy, marginBottom:8 }}>Thank You!</div>
        <div style={{ fontSize:13, color:T.muted, lineHeight:1.6 }}>Your feedback has been submitted successfully. It will be reviewed by the TIEI team.</div>
        <div style={{ marginTop:16, fontSize:11, color:T.muted }}>You may now close this page.</div>
      </div>
    </div>
  );

  const Section = ({ num, title, children }) => (
    <div style={{ marginBottom:20 }}>
      <div style={{ background:T.navy, color:'white', padding:'8px 14px', borderRadius:'8px 8px 0 0', fontWeight:700, fontSize:12, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ background:'rgba(255,255,255,0.2)', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800 }}>{num}</span>
        {title}
      </div>
      <div style={{ background:'white', border:`1px solid ${T.border}`, borderTop:'none', borderRadius:'0 0 8px 8px', padding:'14px 16px' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:"'Segoe UI',Arial,sans-serif", padding:'16px' }}>
      <div style={{ maxWidth:820, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ background:T.navy, color:'white', borderRadius:'12px 12px 0 0', padding:'20px 24px', marginBottom:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:11, opacity:0.5, textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>Toyota Industries Engine India Ltd.</div>
            <div style={{ fontSize:18, fontWeight:800 }}>Visitor Feedback Sheet</div>
          </div>
          <div style={{ fontSize:32 }}>🏭</div>
        </div>

        {/* 1. Visit Info */}
        <Section num="1" title="Visit Information">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
            <div style={{ gridColumn:'1 / -1' }}>
              <label style={labelStyle}>Visitor From (Name of Company) <span style={{color:'#DC2626'}}>*</span></label>
              <input value={form.company} onChange={e => updForm('company', e.target.value)} placeholder="e.g. Toyota Kirloskar Motor" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Visit Date</label>
              <input type="date" value={form.visit_date} onChange={e => updForm('visit_date', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Visit Time</label>
              <input value={form.visit_time} onChange={e => updForm('visit_time', e.target.value)} placeholder="e.g. 09:00 ~ 17:00" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Visit Purpose in Detail</label>
            <textarea value={form.visit_purpose} onChange={e => updForm('visit_purpose', e.target.value)}
              placeholder="e.g. TIEI Plant seeing (TNGA FFV PJT Progress check)"
              rows={2} style={{ ...inputStyle, resize:'vertical' }} />
          </div>
        </Section>

        {/* 2. Visitor Details */}
        <Section num="2" title="Visitor Details">
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:T.bg }}>
                  {['S.No','Name (Full Name)','Designation','Company','Dept./Division','Visited Before?','Prev. Visit Date',''].map(h => (
                    <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:T.muted, fontWeight:700, fontSize:10, textTransform:'uppercase', borderBottom:`1px solid ${T.border}`, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visitors.map((v, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : T.bg }}>
                    <td style={{ padding:'5px 8px', color:T.muted, borderBottom:`1px solid ${T.border}`, fontWeight:700 }}>{i+1}</td>
                    <td style={{ padding:'3px 5px', borderBottom:`1px solid ${T.border}` }}>
                      <input value={v.name} onChange={e => updVisitor(i,'name',e.target.value)} placeholder="Full name" style={{ ...inputStyle, padding:'5px 8px' }} />
                    </td>
                    <td style={{ padding:'3px 5px', borderBottom:`1px solid ${T.border}` }}>
                      <input value={v.designation} onChange={e => updVisitor(i,'designation',e.target.value)} placeholder="DGM / Mgr…" style={{ ...inputStyle, padding:'5px 8px' }} />
                    </td>
                    <td style={{ padding:'3px 5px', borderBottom:`1px solid ${T.border}` }}>
                      <input value={v.company} onChange={e => updVisitor(i,'company',e.target.value)} placeholder="TMC / TKM…" style={{ ...inputStyle, padding:'5px 8px' }} />
                    </td>
                    <td style={{ padding:'3px 5px', borderBottom:`1px solid ${T.border}` }}>
                      <input value={v.dept} onChange={e => updVisitor(i,'dept',e.target.value)} placeholder="PTZ / ICE…" style={{ ...inputStyle, padding:'5px 8px' }} />
                    </td>
                    <td style={{ padding:'3px 5px', borderBottom:`1px solid ${T.border}`, textAlign:'center' }}>
                      <select value={v.visited_before} onChange={e => updVisitor(i,'visited_before',e.target.value)}
                        style={{ ...inputStyle, width:70, padding:'5px 6px' }}>
                        <option>No</option>
                        <option>Yes</option>
                      </select>
                    </td>
                    <td style={{ padding:'3px 5px', borderBottom:`1px solid ${T.border}` }}>
                      <input type="date" value={v.prev_date} onChange={e => updVisitor(i,'prev_date',e.target.value)}
                        disabled={v.visited_before !== 'Yes'}
                        style={{ ...inputStyle, padding:'5px 8px', opacity: v.visited_before === 'Yes' ? 1 : 0.35 }} />
                    </td>
                    <td style={{ padding:'3px 8px', borderBottom:`1px solid ${T.border}` }}>
                      {visitors.length > 1 && (
                        <button onClick={() => removeVisitor(i)} style={{ background:'none', border:'none', color:'#E53935', cursor:'pointer', fontSize:16, padding:0 }}>×</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addVisitor} style={{ background:'none', border:'none', color:T.accent, cursor:'pointer', fontSize:12, fontWeight:700, padding:'8px 0 0', display:'block' }}>
            + Add Visitor
          </button>
        </Section>

        {/* 3. Feedback */}
        <Section num="3" title="Visitor Feedback">
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:T.bg }}>
                  <th style={{ padding:'6px 8px', textAlign:'left', color:T.muted, fontWeight:700, fontSize:10, textTransform:'uppercase', borderBottom:`1px solid ${T.border}`, width:40 }}>Sl No</th>
                  <th style={{ padding:'6px 8px', textAlign:'left', color:T.muted, fontWeight:700, fontSize:10, textTransform:'uppercase', borderBottom:`1px solid ${T.border}` }}>Feedback / Suggestion / Advice</th>
                  <th style={{ padding:'6px 8px', textAlign:'left', color:T.muted, fontWeight:700, fontSize:10, textTransform:'uppercase', borderBottom:`1px solid ${T.border}`, width:180 }}>From (Visitor Name)</th>
                </tr>
              </thead>
              <tbody>
                {feedbackRows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : T.bg }}>
                    <td style={{ padding:'5px 8px', borderBottom:`1px solid ${T.border}`, color:T.muted, fontWeight:700, textAlign:'center' }}>{i+1}</td>
                    <td style={{ padding:'3px 5px', borderBottom:`1px solid ${T.border}` }}>
                      <textarea value={row.feedback} onChange={e => updFeedback(i,'feedback',e.target.value)}
                        placeholder="Enter feedback, suggestion or advice…"
                        rows={2} style={{ ...inputStyle, resize:'vertical', padding:'6px 8px' }} />
                    </td>
                    <td style={{ padding:'3px 5px', borderBottom:`1px solid ${T.border}` }}>
                      <input value={row.from} onChange={e => updFeedback(i,'from',e.target.value)}
                        placeholder="Visitor name" style={{ ...inputStyle, padding:'6px 8px' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addFeedbackRow} style={{ background:'none', border:'none', color:T.accent, cursor:'pointer', fontSize:12, fontWeight:700, padding:'8px 0 0', display:'block' }}>
            + Add Row
          </button>
        </Section>

        {error && (
          <div style={{ color:'#DC2626', fontSize:13, marginBottom:12, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:6, padding:'8px 12px' }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width:'100%', background:T.navy, color:'white', border:'none', borderRadius:8, padding:'13px', fontSize:14, fontWeight:800, cursor:loading?'not-allowed':'pointer', opacity:loading?0.6:1, marginBottom:24 }}>
          {loading ? 'Submitting…' : 'Submit Feedback →'}
        </button>

      </div>
    </div>
  );
}
