import { useState, useEffect, useRef } from 'react';
import { api } from './api.js';

const T = {
  navy:"#7C3AED", navyMid:"#6D28D9", accent:"#7C3AED",
  bg:"#F8FAFC", border:"#E2E8F0", text:"#0F172A", muted:"#64748B",
};

const FALLBACK_COLOR = { bg:"#F5F3FF", border:"#7C3AED", badge:"#6D28D9" };

function colorSet(hex) {
  if (!hex) return FALLBACK_COLOR;
  return { bg: hex + "1A", border: hex, badge: hex };
}

function toMin(t){ const [h,m]=(t||'09:00').split(':').map(Number); return h*60+m; }
function toTime(m){ const hh=String(Math.floor(m/60)%24).padStart(2,'0'); const mm=String(m%60).padStart(2,'0'); return `${hh}:${mm}`; }

export default function Screen2({ formData, visitId, onBack, onNext }) {
  const [areas, setAreas] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [transit, setTransit] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selAreaId, setSelAreaId] = useState('');
  const [selSubId, setSelSubId] = useState('');
  const [selTransitId, setSelTransitId] = useState('');
  const [customPic, setCustomPic] = useState('');
  const [customMin, setCustomMin] = useState('');

  const [rows, setRows] = useState([]); // {rowId, area, activity, pic, durationMin}
  const [nextRowId, setNextRowId] = useState(1);

  const [view, setView] = useState('builder'); // builder | preview
  const [generated, setGenerated] = useState([]);
  const [genError, setGenError] = useState('');
  const printRef = useRef();

  const startTime = formData.visitStart || '09:00';

  useEffect(() => {
    api.getAreas().then(data => {
      setAreas(data.areas);
      setSubAreas(data.subAreas);
      setTransit(data.transit);
      setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  const subsForArea = (areaId) => subAreas.filter(s => String(s.area_id) === String(areaId));

  const onAreaChange = (val) => {
    setSelAreaId(val);
    setSelSubId('');
    setSelTransitId('');
    const subs = subsForArea(val);
    if (subs.length) { setCustomPic(subs[0].default_pic || ''); setCustomMin(String(subs[0].default_duration_min || '')); }
    else { setCustomPic(''); setCustomMin(''); }
  };
  const onSubChange = (val) => {
    setSelSubId(val);
    const s = subAreas.find(x => String(x.id) === String(val));
    if (s) { setCustomPic(s.default_pic || ''); setCustomMin(String(s.default_duration_min || '')); }
  };
  const onTransitChange = (val) => {
    setSelTransitId(val);
    setSelAreaId(''); setSelSubId('');
    const t = transit.find(x => String(x.id) === String(val));
    if (t) { setCustomPic(t.default_pic || ''); setCustomMin(String(t.default_duration_min || '')); }
  };

  const selectedArea = areas.find(a => String(a.id) === String(selAreaId));

  const addRow = () => {
    let areaName, activity, pic, dur;
    if (selTransitId && !selAreaId) {
      const t = transit.find(x => String(x.id) === String(selTransitId));
      if (!t) return;
      areaName = "Transit"; activity = t.label; pic = customPic || t.default_pic; dur = parseInt(customMin) || t.default_duration_min;
    } else {
      if (!selAreaId || !selSubId) return;
      const s = subAreas.find(x => String(x.id) === String(selSubId));
      if (!s) return;
      areaName = selectedArea?.area_name; activity = s.activity_name; pic = customPic || s.default_pic; dur = parseInt(customMin) || s.default_duration_min;
    }
    setRows(p => [...p, { rowId: nextRowId, area: areaName, activity, pic, durationMin: Math.max(1, dur || 1) }]);
    setNextRowId(n => n+1);
    setSelAreaId(''); setSelSubId(''); setSelTransitId(''); setCustomPic(''); setCustomMin('');
  };

  const removeRow = (rowId) => setRows(p => p.filter(r => r.rowId !== rowId));
  const moveRow = (idx, dir) => setRows(p => { const a=[...p]; const t=a[idx]; a[idx]=a[idx+dir]; a[idx+dir]=t; return a; });
  const updateDur = (rowId, val) => setRows(p => p.map(r => r.rowId===rowId ? {...r, durationMin: Math.max(1, parseInt(val)||1)} : r));

  // Live cascading schedule (client-side preview)
  const schedule = (() => {
    let cursor = toMin(startTime);
    return rows.map(r => { const from=toTime(cursor); cursor+=r.durationMin; return {...r, from, to: toTime(cursor)}; });
  })();
  const totalMin = rows.reduce((s,r)=>s+r.durationMin, 0);

  const generate = async () => {
    setGenError('');
    try {
      const saved = await api.generateAgenda(
        visitId,
        rows.map(r => ({ area: r.area, activity: r.activity, pic: r.pic, durationMin: r.durationMin })),
        startTime
      );
      setGenerated(saved);
      setView('preview');
    } catch (e) {
      setGenError(e.message || 'Failed to generate agenda.');
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Visitor Agenda</title><style>
      body{font-family:Arial;font-size:11px;margin:20px}
      table{border-collapse:collapse;width:100%}
      th{background:#1B2E4B;color:white;padding:6px 8px;text-align:left}
      td{border:1px solid #ccc;padding:5px 8px;vertical-align:top}
      tr:nth-child(even) td{background:#f5f8ff}
    </style></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close(); win.print();
  };

  const selStyle = { padding:"7px 10px", border:`1.5px solid ${T.border}`, borderRadius:6, fontSize:13, color:T.text, background:"white", cursor:"pointer", outline:"none" };

  if (loading) return <div style={{padding:40, fontFamily:"'Segoe UI',Arial,sans-serif"}}>Loading areas…</div>;

  return (
    <div style={{minHeight:"100vh", background:T.bg, fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      <div style={{background:T.navy, color:"white", padding:"0 16px", height:50, display:"flex", alignItems:"center", gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.15)", color:"white", border:"none", borderRadius:4, padding:"4px 12px", cursor:"pointer", fontSize:12}}>← Back</button>
        <span style={{fontWeight:700, fontSize:15}}>Agenda Builder</span>
        <span style={{fontSize:12, opacity:0.7, marginLeft:4}}>{formData.company} · {formData.visitDate} · Visit #{formData.visitNo} · ID #{visitId}</span>
        <div style={{marginLeft:"auto", display:"flex", gap:6}}>
          <button onClick={()=>setView('builder')} style={{background:view==='builder'?"#7C3AED":"rgba(255,255,255,0.15)", color:"white", border:"none", borderRadius:4, padding:"5px 14px", cursor:"pointer", fontSize:12, fontWeight:view==='builder'?700:400}}>🏗 Builder</button>
          <button onClick={()=>view==='preview' || generated.length ? setView('preview') : null} style={{background:view==='preview'?"#7C3AED":"rgba(255,255,255,0.15)", color:"white", border:"none", borderRadius:4, padding:"5px 14px", cursor:"pointer", fontSize:12, fontWeight:view==='preview'?700:400}}>📄 Preview</button>
          {onNext && generated.length > 0 && (
            <button onClick={() => onNext(generated)} style={{background:"#059669", color:"white", border:"none", borderRadius:4, padding:"5px 14px", cursor:"pointer", fontSize:12, fontWeight:700}}>Continue: Summary →</button>
          )}
        </div>
      </div>

      <div style={{maxWidth:1060, margin:"0 auto", padding:"20px 16px"}}>

        {view==='builder' && (
        <div style={{display:"grid", gridTemplateColumns:"360px 1fr", gap:16, alignItems:"start"}}>

          {/* LEFT PANEL */}
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            <div style={{background:"white", border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={{background:T.navy, color:"white", padding:"10px 14px", fontWeight:700, fontSize:13}}>🗺️ Add Area to Agenda</div>
              <div style={{padding:"14px"}}>

                <div style={{fontSize:11, fontWeight:700, color:T.navy, marginBottom:6, textTransform:"uppercase", letterSpacing:0.4}}>Step 1 — Select Area</div>
                <select value={selAreaId} onChange={e=>onAreaChange(e.target.value)} style={{...selStyle, width:"100%"}}>
                  <option value="">— Choose an Area —</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.icon} {a.area_name}</option>)}
                </select>

                <div style={{display:"flex", alignItems:"center", gap:8, margin:"10px 0", color:T.muted, fontSize:11}}>
                  <div style={{flex:1, height:1, background:T.border}}/>OR add transit<div style={{flex:1, height:1, background:T.border}}/>
                </div>

                <select value={selTransitId} onChange={e=>onTransitChange(e.target.value)} style={{...selStyle, width:"100%", borderColor:selTransitId?"#3949AB":T.border}}>
                  <option value="">— Transit / Break —</option>
                  {transit.map(t => <option key={t.id} value={t.id}>🚌 {t.label}</option>)}
                </select>

                {selAreaId && selectedArea && (
                  <div style={{marginTop:12}}>
                    <div style={{fontSize:11, fontWeight:700, color:selectedArea.color_hex, marginBottom:6, textTransform:"uppercase", letterSpacing:0.4}}>
                      Step 2 — Select Activity in {selectedArea.area_name}
                    </div>
                    <div style={{background:colorSet(selectedArea.color_hex).bg, border:`1.5px solid ${selectedArea.color_hex}`, borderRadius:6, padding:"6px 10px", marginBottom:8, display:"flex", alignItems:"center", gap:8}}>
                      <span style={{fontSize:20}}>{selectedArea.icon}</span>
                      <span style={{fontWeight:700, color:selectedArea.color_hex, fontSize:13}}>{selectedArea.area_name}</span>
                      <span style={{fontSize:11, color:selectedArea.color_hex, opacity:0.7}}>{subsForArea(selAreaId).length} activities</span>
                    </div>
                    <select value={selSubId} onChange={e=>onSubChange(e.target.value)} style={{...selStyle, width:"100%", borderColor:selSubId?selectedArea.color_hex:T.border}}>
                      <option value="">— Choose Activity —</option>
                      {subsForArea(selAreaId).map(s => <option key={s.id} value={s.id}>{s.activity_name} ({s.default_duration_min} min)</option>)}
                    </select>
                  </div>
                )}

                {(selSubId || selTransitId) && (
                  <div style={{marginTop:12}}>
                    <div style={{fontSize:11, fontWeight:700, color:T.navy, marginBottom:6, textTransform:"uppercase", letterSpacing:0.4}}>Step 3 — Customise</div>
                    <div style={{display:"grid", gridTemplateColumns:"1fr auto", gap:8, marginBottom:8}}>
                      <div>
                        <div style={{fontSize:10, color:T.muted, marginBottom:3}}>PIC / Presenter</div>
                        <input value={customPic} onChange={e=>setCustomPic(e.target.value)} placeholder="Person in charge"
                          style={{width:"100%", padding:"6px 9px", border:`1px solid ${T.border}`, borderRadius:5, fontSize:12, boxSizing:"border-box"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:10, color:T.muted, marginBottom:3}}>Minutes</div>
                        <div style={{display:"flex", alignItems:"center"}}>
                          <button onClick={()=>setCustomMin(m=>String(Math.max(1,(parseInt(m)||1)-1)))} style={{width:26, height:32, background:T.navy, color:"white", border:"none", borderRadius:"5px 0 0 5px", cursor:"pointer", fontSize:16, fontWeight:700}}>−</button>
                          <input type="number" min="1" value={customMin} onChange={e=>setCustomMin(e.target.value)}
                            style={{width:50, height:32, textAlign:"center", border:`1px solid ${T.border}`, borderLeft:"none", borderRight:"none", fontSize:14, fontWeight:700, color:T.navy}}/>
                          <button onClick={()=>setCustomMin(m=>String((parseInt(m)||1)+1))} style={{width:26, height:32, background:T.navy, color:"white", border:"none", borderRadius:"0 5px 5px 0", cursor:"pointer", fontSize:16, fontWeight:700}}>+</button>
                        </div>
                      </div>
                    </div>
                    <button onClick={addRow}
                      style={{width:"100%", background:selAreaId?selectedArea?.color_hex||T.accent:"#3949AB", color:"white", border:"none", borderRadius:6, padding:"9px", fontSize:13, fontWeight:700, cursor:"pointer"}}>
                      + Add to Agenda
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{background:"white", border:`1px solid ${T.border}`, borderRadius:8, padding:"12px 14px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:11, fontWeight:700, color:T.navy, marginBottom:8, textTransform:"uppercase", letterSpacing:0.4}}>📍 Plant Areas Reference</div>
              {areas.map(a => (
                <div key={a.id} onClick={()=>onAreaChange(String(a.id))}
                  style={{display:"flex", alignItems:"center", gap:8, padding:"6px 8px", borderRadius:5, marginBottom:4, cursor:"pointer",
                    background: String(selAreaId)===String(a.id) ? colorSet(a.color_hex).bg : "#F8FAFC",
                    border:`1px solid ${String(selAreaId)===String(a.id) ? a.color_hex : T.border}`}}>
                  <span style={{fontSize:16}}>{a.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12, fontWeight:600, color:a.color_hex}}>{a.area_name}</div>
                    <div style={{fontSize:10, color:T.muted}}>{subsForArea(a.id).length} activities</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:8}}>
              <div>
                <div style={{fontSize:16, fontWeight:800, color:T.navy}}>Agenda Sequence</div>
                <div style={{fontSize:12, color:T.muted, marginTop:2}}>Reorder · edit minutes · times cascade automatically</div>
              </div>
              <div style={{background:"white", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 16px", textAlign:"center", minWidth:130}}>
                <div style={{fontSize:10, color:T.muted, fontWeight:600, textTransform:"uppercase"}}>Total Duration</div>
                <div style={{fontSize:28, fontWeight:800, color:T.navy, lineHeight:1}}>{totalMin}</div>
                <div style={{fontSize:10, color:T.muted}}>minutes</div>
                <div style={{fontSize:11, color:T.accent, marginTop:2, fontWeight:600}}>{startTime} → {schedule.length?schedule[schedule.length-1].to:startTime}</div>
              </div>
            </div>

            {rows.length>0 && (
              <div style={{background:"white", border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 12px", marginBottom:12}}>
                <div style={{fontSize:10, color:T.muted, fontWeight:600, marginBottom:5, textTransform:"uppercase"}}>Live Timeline</div>
                <div style={{display:"flex", gap:2, height:22, borderRadius:4, overflow:"hidden"}}>
                  {schedule.map(r => {
                    const area = areas.find(a=>a.area_name===r.area);
                    const c = colorSet(area?.color_hex);
                    const pct = (r.durationMin/totalMin*100).toFixed(1);
                    return <div key={r.rowId} title={`${r.activity} — ${r.area} (${r.durationMin}m)`}
                      style={{background:c.border, flex:`0 0 ${pct}%`, minWidth:3, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden"}}>
                      {r.durationMin>=10 && <span style={{color:"white", fontSize:8, fontWeight:700}}>{r.durationMin}m</span>}
                    </div>;
                  })}
                </div>
                <div style={{display:"flex", justifyContent:"space-between", fontSize:10, color:T.muted, marginTop:3}}>
                  <span>{startTime}</span><span>{schedule.length?schedule[schedule.length-1].to:""}</span>
                </div>
              </div>
            )}

            {rows.length===0 && (
              <div style={{background:"white", border:`2px dashed ${T.border}`, borderRadius:8, padding:"40px 20px", textAlign:"center", color:T.muted}}>
                <div style={{fontSize:36, marginBottom:8}}>📋</div>
                <div style={{fontSize:14, fontWeight:600, marginBottom:4}}>No agenda items yet</div>
                <div style={{fontSize:12}}>Select an area from the left panel and click "Add to Agenda"</div>
              </div>
            )}

            <div style={{display:"flex", flexDirection:"column", gap:7}}>
              {schedule.map((row, idx) => {
                const area = areas.find(a=>a.area_name===row.area);
                const c = colorSet(area?.color_hex);
                return (
                  <div key={row.rowId} style={{background:c.bg, border:`2px solid ${c.border}`, borderRadius:8, padding:"10px 12px", display:"flex", alignItems:"center", gap:10}}>
                    <div style={{width:26, height:26, borderRadius:"50%", background:c.border, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0}}>{idx+1}</div>
                    <div style={{flexShrink:0, textAlign:"center", minWidth:70}}>
                      <div style={{fontSize:18}}>{area?.icon || "🚌"}</div>
                      <div style={{fontSize:9, fontWeight:700, color:c.badge, background:c.bg, border:`1px solid ${c.border}`, borderRadius:3, padding:"0 4px", marginTop:1, whiteSpace:"nowrap"}}>{row.area}</div>
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontWeight:700, color:T.navy, fontSize:13, marginBottom:2}}>{row.activity}</div>
                      <div style={{display:"flex", gap:10, fontSize:11, color:T.muted, flexWrap:"wrap"}}>
                        <span>👤 {row.pic || "—"}</span>
                        <span style={{fontWeight:600, color:c.badge}}>🕐 {row.from} → {row.to}</span>
                      </div>
                    </div>
                    <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0}}>
                      <div style={{fontSize:9, color:T.muted, fontWeight:600, textTransform:"uppercase"}}>Min</div>
                      <div style={{display:"flex", alignItems:"center"}}>
                        <button onClick={()=>updateDur(row.rowId, row.durationMin-1)} style={{width:22, height:26, background:c.border, color:"white", border:"none", borderRadius:"4px 0 0 4px", cursor:"pointer", fontSize:14, fontWeight:700}}>−</button>
                        <input type="number" min="1" value={row.durationMin} onChange={e=>updateDur(row.rowId, e.target.value)}
                          style={{width:44, height:26, textAlign:"center", border:`1px solid ${c.border}`, borderLeft:"none", borderRight:"none", fontSize:13, fontWeight:700, color:T.navy, background:"white"}}/>
                        <button onClick={()=>updateDur(row.rowId, row.durationMin+1)} style={{width:22, height:26, background:c.border, color:"white", border:"none", borderRadius:"0 4px 4px 0", cursor:"pointer", fontSize:14, fontWeight:700}}>+</button>
                      </div>
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:2, flexShrink:0}}>
                      <button disabled={idx===0} onClick={()=>moveRow(idx,-1)} style={{width:22, height:22, background:idx===0?"#F1F5F9":T.navy, color:"white", border:"none", borderRadius:3, cursor:idx===0?"not-allowed":"pointer", fontSize:12}}>↑</button>
                      <button disabled={idx===rows.length-1} onClick={()=>moveRow(idx,1)} style={{width:22, height:22, background:idx===rows.length-1?"#F1F5F9":T.navy, color:"white", border:"none", borderRadius:3, cursor:idx===rows.length-1?"not-allowed":"pointer", fontSize:12}}>↓</button>
                    </div>
                    <button onClick={()=>removeRow(row.rowId)} style={{width:26, height:26, background:"#FEE2E2", color:"#DC2626", border:"1px solid #FECACA", borderRadius:4, cursor:"pointer", fontSize:14, fontWeight:700, flexShrink:0}}>×</button>
                  </div>
                );
              })}
            </div>

            {genError && <div style={{color:"#DC2626", fontSize:13, marginTop:10}}>{genError}</div>}

            {rows.length>0 && (
              <button onClick={generate} style={{marginTop:16, background:T.navy, color:"white", border:"none", borderRadius:8, padding:"11px 24px", fontSize:14, fontWeight:700, cursor:"pointer", width:"100%"}}>
                Generate Agenda Table → (saves to database)
              </button>
            )}
          </div>
        </div>
        )}

        {view==='preview' && (
          <div>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:'wrap', gap:10}}>
              <div><h2 style={{color:T.navy, margin:0, fontSize:18}}>Visitor Agenda</h2><p style={{color:T.muted, margin:"4px 0 0", fontSize:13}}>Saved to database · ready to print</p></div>
              <div style={{display:"flex", gap:8, flexWrap:'wrap'}}>
                <button onClick={()=>setView('builder')} style={{background:"white", color:T.navy, border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 16px", cursor:"pointer", fontSize:13, fontWeight:600}}>← Edit</button>
                <button onClick={handlePrint} style={{background:T.navy, color:"white", border:"none", borderRadius:8, padding:"8px 18px", cursor:"pointer", fontWeight:700, fontSize:13}}>🖨 Print / PDF</button>
                {onNext && generated.length > 0 && (
                  <button onClick={() => onNext(generated)} style={{background:'#059669', color:"white", border:"none", borderRadius:8, padding:"8px 18px", cursor:"pointer", fontWeight:700, fontSize:13}}>
                    Continue: Summary →
                  </button>
                )}
              </div>
            </div>
            <div ref={printRef}>
              <div style={{background:T.navy, color:"white", borderRadius:"8px 8px 0 0", padding:"14px 18px", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10}}>
                <div>
                  <div style={{fontSize:10, opacity:0.6, marginBottom:2}}>VISITOR PRESENTATION AGENDA</div>
                  <div style={{fontSize:15, fontWeight:700, marginBottom:4}}>{formData.company || "Visitor"}</div>
                  {formData.visitors.map((v,i)=><div key={i} style={{fontSize:12, opacity:0.85}}>• {v.title ? v.title + ' ' : ''}{v.name}{v.designation?`, ${v.designation}`:""}</div>)}
                </div>
                <div style={{textAlign:"right", fontSize:12}}>
                  <div><b>Date:</b> {formData.visitDate}</div>
                  <div><b>Time:</b> {startTime} – {generated.length?generated[generated.length-1].to_time:""}</div>
                  <div><b>Advisor:</b> {formData.visitAdvisor}</div>
                  <div><b>Visit No:</b> {formData.visitNo}</div>
                </div>
              </div>
              <div style={{overflowX:"auto", border:`1px solid ${T.border}`, borderTop:"none", borderRadius:"0 0 8px 8px"}}>
                <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
                  <thead>
                    <tr style={{background:T.navyMid}}>
                      {["Sl.","Date","From","To","Area","Activity / Agenda","Min","PIC / Presenter"].map(h=>(
                        <th key={h} style={{color:"white", padding:"8px 10px", textAlign:"left", fontWeight:600, fontSize:11, whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generated.map((row, idx) => {
                      const area = areas.find(a=>a.area_name===row.area);
                      const c = colorSet(area?.color_hex);
                      return (
                        <tr key={row.id} style={{background:idx%2===0?"white":"#F5F8FF"}}>
                          <td style={{padding:"7px 10px", borderBottom:"1px solid #E2E8F0", fontWeight:700, color:T.navy}}>{idx+1}</td>
                          <td style={{padding:"7px 10px", borderBottom:"1px solid #E2E8F0", color:T.muted, fontSize:11}}>{idx===0?formData.visitDate:""}</td>
                          <td style={{padding:"7px 10px", borderBottom:"1px solid #E2E8F0", fontWeight:700}}>{row.from_time}</td>
                          <td style={{padding:"7px 10px", borderBottom:"1px solid #E2E8F0", fontWeight:700}}>{row.to_time}</td>
                          <td style={{padding:"7px 10px", borderBottom:"1px solid #E2E8F0"}}>
                            <span style={{background:c.bg, border:`1px solid ${c.border}`, color:c.badge, borderRadius:4, padding:"2px 7px", fontSize:10, fontWeight:700, display:"inline-flex", alignItems:"center", gap:3, whiteSpace:"nowrap"}}>
                              {area?.icon || "🚌"} {row.area}
                            </span>
                          </td>
                          <td style={{padding:"7px 10px", borderBottom:"1px solid #E2E8F0", fontWeight:600, color:T.text}}>{row.activity_name}</td>
                          <td style={{padding:"7px 10px", borderBottom:"1px solid #E2E8F0", textAlign:"center", fontWeight:700, color:T.accent}}>{row.duration_min}</td>
                          <td style={{padding:"7px 10px", borderBottom:"1px solid #E2E8F0", color:T.muted, fontSize:11}}>{row.pic}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{background:"#EEF2FF"}}>
                      <td colSpan={6} style={{padding:"8px 10px", fontWeight:700, textAlign:"right", color:T.navy}}>Total Duration</td>
                      <td style={{padding:"8px 10px", fontWeight:800, color:T.accent, textAlign:"center", fontSize:14}}>{generated.reduce((s,r)=>s+r.duration_min,0)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
