import { useEffect, useState } from 'react';

const T = { navy:'#7C3AED', accent:'#7C3AED', green:'#059669', bg:'#F0F4FA', border:'#CBD5E1', text:'#1E293B', muted:'#64748B' };

const FEEDBACK_URL = `${window.location.origin}/feedback`;


function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: copied ? T.green : T.accent, color:'white', border:'none', borderRadius:5, padding:'5px 14px', fontSize:12, cursor:'pointer', fontWeight:600, transition:'background 0.2s' }}>
      {copied ? '✓ Copied!' : 'Copy Link'}
    </button>
  );
}

function FeedbackCard({ fb }) {
  const [open, setOpen] = useState(false);
  const rows = (() => { try { return JSON.parse(fb.feedback_rows_json || '[]'); } catch { return []; } })();
  const visitors = (() => { try { return JSON.parse(fb.visitors_json || '[]'); } catch { return []; } })();

  return (
    <div style={{ background:'white', border:`1px solid ${T.border}`, borderRadius:8, marginBottom:10, overflow:'hidden' }}>
      {/* Header row */}
      <div onClick={() => setOpen(p => !p)} style={{ padding:'12px 16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', background: open ? T.bg : 'white' }}>
        <div>
          <span style={{ fontWeight:700, fontSize:13, color:T.navy }}>{fb.company}</span>
          <span style={{ fontSize:12, color:T.muted, marginLeft:12 }}>{fb.visit_date} {fb.visit_time && `| ${fb.visit_time}`}</span>
          {fb.visit_purpose && <span style={{ fontSize:11, color:T.muted, marginLeft:12 }}>| {fb.visit_purpose.slice(0,60)}{fb.visit_purpose.length > 60 ? '…' : ''}</span>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ background:'#EEF4FF', color:T.accent, border:`1px solid #BFDBFE`, borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:700 }}>
            {rows.length} feedback item{rows.length !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize:14, color:T.muted }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div style={{ padding:'14px 16px', borderTop:`1px solid ${T.border}` }}>
          {/* Visitors */}
          {visitors.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Visitors ({visitors.length})</div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr style={{ background:T.bg }}>
                    {['#','Name','Designation','Company','Dept','Visited Before'].map(h => (
                      <th key={h} style={{ padding:'4px 8px', textAlign:'left', color:T.muted, fontWeight:600, borderBottom:`1px solid ${T.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((v, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'white' : T.bg }}>
                      <td style={{ padding:'4px 8px', borderBottom:`1px solid ${T.border}`, color:T.muted }}>{i+1}</td>
                      <td style={{ padding:'4px 8px', borderBottom:`1px solid ${T.border}`, fontWeight:600 }}>{v.name}</td>
                      <td style={{ padding:'4px 8px', borderBottom:`1px solid ${T.border}` }}>{v.designation}</td>
                      <td style={{ padding:'4px 8px', borderBottom:`1px solid ${T.border}` }}>{v.company}</td>
                      <td style={{ padding:'4px 8px', borderBottom:`1px solid ${T.border}` }}>{v.dept}</td>
                      <td style={{ padding:'4px 8px', borderBottom:`1px solid ${T.border}`, color: v.visited_before === 'Yes' ? T.green : T.muted, fontWeight: v.visited_before === 'Yes' ? 700 : 400 }}>
                        {v.visited_before}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Feedback rows */}
          <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>Feedback / Suggestions</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ background:T.navy }}>
                <th style={{ padding:'6px 10px', color:'white', textAlign:'left', fontSize:10, fontWeight:700, width:40 }}>Sl No</th>
                <th style={{ padding:'6px 10px', color:'white', textAlign:'left', fontSize:10, fontWeight:700 }}>Feedback / Suggestion / Advice</th>
                <th style={{ padding:'6px 10px', color:'white', textAlign:'left', fontSize:10, fontWeight:700, width:160 }}>From</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : T.bg }}>
                  <td style={{ padding:'7px 10px', borderBottom:`1px solid ${T.border}`, color:T.muted, fontWeight:700, textAlign:'center' }}>{i+1}</td>
                  <td style={{ padding:'7px 10px', borderBottom:`1px solid ${T.border}`, lineHeight:1.5 }}>{r.feedback}</td>
                  <td style={{ padding:'7px 10px', borderBottom:`1px solid ${T.border}`, color:T.muted, fontStyle:'italic' }}>{r.from || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontSize:10, color:T.muted, marginTop:8 }}>
            Submitted: {fb.submitted_at ? new Date(fb.submitted_at).toLocaleString('en-IN') : '—'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedbackResults() {
  const [tab, setTab]           = useState('responses');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/feedback').then(r => r.json()).then(data => {
      setResponses(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      background: tab === id ? T.navy : 'white', color: tab === id ? 'white' : T.muted,
      border: `1.5px solid ${tab === id ? T.navy : T.border}`, borderRadius:6,
      padding:'7px 18px', fontSize:13, fontWeight:700, cursor:'pointer',
    }}>{label}</button>
  );

  return (
    <div style={{ flex:1, background:T.bg, fontFamily:"'Segoe UI',Arial,sans-serif", padding:24 }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>

        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          <TabBtn id="responses" label={`📋 Responses (${responses.length})`} />
          <TabBtn id="share" label="🔗 Share Feedback Form" />
        </div>

        {/* SHARE TAB */}
        {tab === 'share' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14, maxWidth:600, margin:'0 auto' }}>
            <div style={{ background:'white', border:`1px solid ${T.border}`, borderRadius:10, padding:'20px 24px' }}>
              <div style={{ fontSize:14, fontWeight:700, color:T.navy, marginBottom:4 }}>🔗 Share Link</div>
              <div style={{ fontSize:12, color:T.muted, marginBottom:10 }}>Send via email or WhatsApp before/after the visit</div>
              <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:6, padding:'10px 14px', fontSize:13, fontFamily:'monospace', wordBreak:'break-all', marginBottom:12 }}>
                {FEEDBACK_URL}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <CopyBtn text={FEEDBACK_URL} />
                <button onClick={() => window.open(FEEDBACK_URL, '_blank')}
                  style={{ background:'white', color:T.accent, border:`1.5px solid ${T.accent}`, borderRadius:5, padding:'5px 14px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                  Open Form ↗
                </button>
              </div>
            </div>

            <div style={{ background:'white', border:`1px solid ${T.border}`, borderRadius:10, padding:'20px 24px' }}>
              <div style={{ fontSize:14, fontWeight:700, color:T.navy, marginBottom:4 }}>🖥 Kiosk / Tablet Mode</div>
              <div style={{ fontSize:12, color:T.muted, marginBottom:10 }}>Keep a tablet at reception — visitors fill it before leaving</div>
              <button onClick={() => window.open(FEEDBACK_URL, '_blank')}
                style={{ background:T.green, color:'white', border:'none', borderRadius:6, padding:'8px 18px', fontSize:13, cursor:'pointer', fontWeight:700 }}>
                Open in Kiosk Mode
              </button>
            </div>

            <div style={{ background:'white', border:`1px solid ${T.border}`, borderRadius:10, padding:'20px 24px' }}>
              <div style={{ fontSize:14, fontWeight:700, color:T.navy, marginBottom:4 }}>💡 Tip</div>
              <div style={{ fontSize:12, color:T.muted, lineHeight:1.6 }}>
                You can also share a pre-filled link with company/date so visitors don't need to re-enter visit details:
                <br/><code style={{ fontSize:11, background:T.bg, padding:'3px 6px', borderRadius:4, marginTop:6, display:'inline-block' }}>/feedback?company=TMC&date=2025-03-23</code>
              </div>
            </div>
          </div>
        )}

        {/* RESPONSES TAB */}
        {tab === 'responses' && (
          loading ? (
            <div style={{ textAlign:'center', padding:40, color:T.muted }}>Loading responses…</div>
          ) : responses.length === 0 ? (
            <div style={{ background:'white', border:`1px solid ${T.border}`, borderRadius:10, padding:40, textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>💬</div>
              <div style={{ fontSize:14, fontWeight:600, color:T.navy }}>No feedback submitted yet</div>
              <div style={{ fontSize:13, color:T.muted, marginTop:6 }}>Share the feedback form with visitors using the "Share" tab above.</div>
            </div>
          ) : responses.map((fb, i) => <FeedbackCard key={i} fb={fb} />)
        )}
      </div>
    </div>
  );
}
