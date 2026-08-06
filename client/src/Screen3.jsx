import { useRef } from 'react';

const T = { navy:'#7C3AED', accent:'#7C3AED', bg:'#F8FAFC', border:'#E2E8F0', text:'#0F172A', muted:'#64748B', green:'#16A34A', greenLt:'#DCFCE7' };

function genRefId(visitId) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `TIEI-VIS-${ymd}-${String(visitId||0).padStart(4,'0')}`;
}

export default function Screen3({ formData, agenda, visitId, onBack, onStartOver }) {
  const printRef = useRef();
  const refId = genRefId(visitId);
  const totalMin = (agenda||[]).reduce((s,r)=>s+(r.duration_min||r.durationMin||0),0);
  const hrs = Math.floor(totalMin/60), mins = totalMin%60;


  const handlePrint = () => {
    const win = window.open('','_blank');
    win.document.write(`<html><head><title>VIS — ${refId}</title><style>
      body{font-family:Arial;font-size:12px;margin:24px;color:#1E293B}
      h1{font-size:18px;margin:0 0 4px} h2{font-size:13px;color:#1B2E4B;margin:18px 0 8px;border-bottom:2px solid #1B2E4B;padding-bottom:4px}
      table{border-collapse:collapse;width:100%;margin-bottom:10px}
      th{background:#1B2E4B;color:white;padding:6px 8px;text-align:left;font-size:11px}
      td{border:1px solid #ccc;padding:5px 8px;font-size:11px}
      tr:nth-child(even) td{background:#f5f8ff}
    </style></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div style={{flex:1, background:T.bg, fontFamily:"'Segoe UI',Arial,sans-serif", padding:24}}>
      <div style={{maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 280px', gap:16, alignItems:'start'}}>
        <div style={{background:'white', border:`1px solid ${T.border}`, borderRadius:8, padding:'20px'}} ref={printRef}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
            <div>
              <h1 style={{color:T.navy, margin:0, fontSize:20}}>Visitor Instruction Sheet</h1>
              <div style={{fontSize:12, color:T.muted, margin:'4px 0 0'}}>Reference: <strong>{refId}</strong></div>
            </div>
          </div>
          <div style={{display:'flex', flexWrap:'wrap', gap:'6px 28px', fontSize:13, marginBottom:16, background:T.bg, padding:'12px 14px', borderRadius:6}}>
            <div><strong>Company:</strong> {formData.company||'—'}</div>
            <div><strong>Date:</strong> {formData.visitDate}</div>
            <div><strong>Time:</strong> {formData.visitStart} – {formData.visitEnd}</div>
            <div><strong>Advisor:</strong> {formData.visitAdvisor||'—'}</div>
            <div><strong>Visit No.:</strong> {formData.visitNo||'—'}</div>
            <div><strong>Visitors:</strong> {formData.visitors.length}</div>
          </div>
          {formData.visitPurpose && <div style={{marginBottom:16, fontSize:13}}><strong>Purpose:</strong> {formData.visitPurpose}</div>}

          <h2 style={{fontSize:13, color:T.navy, borderBottom:`2px solid ${T.navy}`, paddingBottom:4, marginBottom:8}}>Visitor List</h2>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:12, marginBottom:18}}>
            <thead><tr style={{background:T.navy}}>{['#','Title','Name','Designation','Company','Dept'].map(h=><th key={h} style={{color:'white',padding:'6px 8px',textAlign:'left',fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{formData.visitors.map((v,i)=><tr key={i} style={{background:i%2===0?'white':T.bg}}><td style={{border:`1px solid ${T.border}`,padding:'5px 8px'}}>{i+1}</td><td style={{border:`1px solid ${T.border}`,padding:'5px 8px'}}>{v.title}</td><td style={{border:`1px solid ${T.border}`,padding:'5px 8px',fontWeight:600}}>{v.name}</td><td style={{border:`1px solid ${T.border}`,padding:'5px 8px'}}>{v.designation}</td><td style={{border:`1px solid ${T.border}`,padding:'5px 8px'}}>{v.company}</td><td style={{border:`1px solid ${T.border}`,padding:'5px 8px'}}>{v.dept}</td></tr>)}</tbody>
          </table>

          <h2 style={{fontSize:13, color:T.navy, borderBottom:`2px solid ${T.navy}`, paddingBottom:4, marginBottom:8}}>
            Plant Tour Agenda <span style={{fontWeight:400, color:T.muted, fontSize:11}}>(Total: {hrs}h {mins}m)</span>
          </h2>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:12}}>
            <thead><tr style={{background:T.navy}}>{['#','Time','Duration','Area','Activity','Presenter'].map(h=><th key={h} style={{color:'white',padding:'6px 8px',textAlign:'left',fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>{(agenda||[]).map((r,i)=><tr key={i} style={{background:i%2===0?'white':T.bg}}><td style={{border:`1px solid ${T.border}`,padding:'5px 8px'}}>{i+1}</td><td style={{border:`1px solid ${T.border}`,padding:'5px 8px',fontWeight:600}}>{r.from_time||r.from} – {r.to_time||r.to}</td><td style={{border:`1px solid ${T.border}`,padding:'5px 8px'}}>{r.duration_min||r.durationMin} min</td><td style={{border:`1px solid ${T.border}`,padding:'5px 8px'}}>{r.area}</td><td style={{border:`1px solid ${T.border}`,padding:'5px 8px'}}>{r.activity_name||r.activity}</td><td style={{border:`1px solid ${T.border}`,padding:'5px 8px'}}>{r.pic}</td></tr>)}</tbody>
          </table>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <button onClick={handlePrint} style={{background:T.navy,color:'white',border:'none',borderRadius:7,padding:'11px',fontSize:13,fontWeight:700,cursor:'pointer'}}>🖨 Print / Save as PDF</button>
          <button onClick={onBack} style={{background:'white',color:T.navy,border:`1.5px solid ${T.border}`,borderRadius:7,padding:'9px',fontSize:12,fontWeight:600,cursor:'pointer'}}>← Back to Agenda</button>
          <button onClick={onStartOver} style={{background:'white',color:T.accent,border:`1.5px solid ${T.accent}`,borderRadius:7,padding:'9px',fontSize:12,fontWeight:600,cursor:'pointer'}}>+ New VIS Sheet</button>
          <button onClick={()=>window.location.href='/feedback'} style={{background:'white',color:'#059669',border:`1.5px solid #059669`,borderRadius:7,padding:'9px',fontSize:12,fontWeight:600,cursor:'pointer'}}>💬 Share Feedback Form</button>
        </div>
      </div>
    </div>
  );
}
