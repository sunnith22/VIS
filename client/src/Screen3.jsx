import { useRef, useState, useEffect } from 'react';
import { api } from './api.js';

const T = { 
  navy: '#7C3AED', 
  accent: '#7C3AED', 
  bg: '#F8FAFC', 
  border: '#E2E8F0', 
  text: '#0F172A', 
  muted: '#64748B', 
  green: '#16A34A', 
  greenLt: '#DCFCE7',
  blue: '#2563EB',
  blueLt: '#EFF6FF'
};

function genRefId(visitId, visitDate) {
  const ymd = (visitDate || '').replace(/-/g, '') || new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const idStr = String(visitId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || 'DRAFT';
  return `TIEI-VIS-${ymd}-${idStr.padStart(4, '0')}`;
}

export default function Screen3({ formData = {}, agenda = [], visitId, onBack, onStartOver }) {
  const printRef = useRef();
  const form = formData || {};
  const visitorsList = Array.isArray(form.visitors) ? form.visitors : [];
  const agendaRows = Array.isArray(agenda) ? agenda : (agenda?.agenda || []);
  const topAttendees = Array.isArray(form.topAttendees) ? form.topAttendees : [];
  
  const attendeeEmails = topAttendees.map(a => a.email?.trim()).filter(e => e && e.includes('@'));

  const [savedVisitId, setSavedVisitId] = useState(visitId || null);
  const [isSaved, setIsSaved] = useState(Boolean(visitId));
  const [isFinalizing, setIsFinalizing] = useState(false);

  const refId = genRefId(savedVisitId, form.visitDate);
  const totalMin = agendaRows.reduce((s, r) => s + (Number(r.duration_min || r.durationMin) || 0), 0);
  const hrs = Math.floor(totalMin / 60), mins = totalMin % 60;

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [customEmail, setCustomEmail] = useState('');
  const [showEmailBox, setShowEmailBox] = useState(false);

  // ── "FINISH" Action: Saves Visit to MongoDB and Automatically Dispatches Email ──
  const handleFinish = async () => {
    setIsFinalizing(true);
    setEmailStatus(null);
    try {
      const res = await api.finalizeVisit({
        visitId: savedVisitId,
        header: {
          company: form.company,
          visitDate: form.visitDate,
          visitStart: form.visitStart,
          visitEnd: form.visitEnd,
          visitAdvisor: form.visitAdvisor,
          visitNo: form.visitNo,
          visitPurpose: form.visitPurpose
        },
        visitors: visitorsList,
        topAttendees: topAttendees,
        agenda: agendaRows,
        startTime: form.visitStart || '09:00'
      });

      if (res && res.success) {
        const newId = res.visitId || res.visit?._id || res.visit?.id;
        setSavedVisitId(newId);
        setIsSaved(true);

        const sentRecipients = res.emailResult?.recipients || attendeeEmails;
        if (sentRecipients && sentRecipients.length > 0) {
          setEmailStatus({
            type: 'success',
            msg: `🎉 Visit saved in Database & Agenda email successfully dispatched to: ${sentRecipients.join(', ')}`
          });
        } else {
          setEmailStatus({
            type: 'success',
            msg: '🎉 Visit successfully saved to Database! (No attendee emails were provided for dispatch).'
          });
        }
      } else {
        setEmailStatus({
          type: 'error',
          msg: res?.error || 'Failed to save visit to database.'
        });
      }
    } catch (e) {
      setEmailStatus({
        type: 'error',
        msg: `❌ Error finalizing visit: ${e.message || 'Server error'}`
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>VIS — ${refId}</title><style>
      body{font-family:Arial;font-size:12px;margin:24px;color:#1E293B}
      h1{font-size:18px;margin:0 0 4px} h2{font-size:13px;color:#7C3AED;margin:18px 0 8px;border-bottom:2px solid #7C3AED;padding-bottom:4px}
      table{border-collapse:collapse;width:100%;margin-bottom:10px}
      th{background:#7C3AED;color:white;padding:6px 8px;text-align:left;font-size:11px}
      td{border:1px solid #ccc;padding:5px 8px;font-size:11px}
      tr:nth-child(even) td{background:#f5f8ff}
    </style></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  const handleSendEmail = async (overrideRecipients = null) => {
    if (!savedVisitId) {
      setEmailStatus({
        type: 'warning',
        msg: '⚠️ Please click "Finish & Save Visit" first to create the visit in the database.'
      });
      return;
    }
    
    let recipients = null;
    if (overrideRecipients && Array.isArray(overrideRecipients)) {
      recipients = overrideRecipients;
    } else if (customEmail.trim()) {
      recipients = customEmail.split(',').map(e => e.trim()).filter(e => e && e.includes('@'));
    }

    if (!recipients && attendeeEmails.length === 0) {
      setEmailStatus({
        type: 'warning',
        msg: '⚠️ Please enter at least one valid email address to send the agenda.'
      });
      setShowEmailBox(true);
      return;
    }

    setSendingEmail(true);
    try {
      const res = await api.sendAgendaEmail(savedVisitId, recipients);
      if (res && res.success) {
        setEmailStatus({
          type: 'success',
          msg: `✅ Agenda email successfully dispatched to: ${(res.recipients || []).join(', ')}`
        });
        setCustomEmail('');
        setShowEmailBox(false);
      } else {
        setEmailStatus({
          type: 'warning',
          msg: res?.message || '⚠️ Could not send email. Please check the entered email addresses.'
        });
      }
    } catch (e) {
      setEmailStatus({
        type: 'error',
        msg: `❌ Email error: ${e.message || 'Failed to dispatch email.'}`
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div style={{ flex: 1, background: T.bg, fontFamily: "'Segoe UI',Arial,sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        
        {/* Left Side: Full VIS Printable Document */}
        <div style={{ background: 'white', border: `1px solid ${T.border}`, borderRadius: 8, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} ref={printRef}>
          
          {/* Draft Notification if not saved yet */}
          {!isSaved && (
            <div style={{
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FCD34D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <span>📝 <strong>Draft Review:</strong> Review all details below. Click <strong>"Finish & Save Visit"</strong> on the right to store in the database and automatically send agenda emails.</span>
            </div>
          )}

          {/* Email Status Alert */}
          {emailStatus && (
            <div style={{
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              background: emailStatus.type === 'success' ? '#F0FDF4' : (emailStatus.type === 'error' ? '#FEF2F2' : (emailStatus.type === 'warning' ? '#FFFBEB' : '#EFF6FF')),
              color: emailStatus.type === 'success' ? '#166534' : (emailStatus.type === 'error' ? '#991B1B' : (emailStatus.type === 'warning' ? '#92400E' : '#1E40AF')),
              border: `1px solid ${emailStatus.type === 'success' ? '#BBF7D0' : (emailStatus.type === 'error' ? '#FECACA' : (emailStatus.type === 'warning' ? '#FDE68A' : '#BFDBFE'))}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10
            }}>
              <span>{emailStatus.msg}</span>
              <button onClick={() => setEmailStatus(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', fontWeight: 700 }}>×</button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h1 style={{ color: T.navy, margin: 0, fontSize: 22 }}>Visitor Instruction Sheet</h1>
              <div style={{ fontSize: 12, color: T.muted, margin: '4px 0 0' }}>
                Reference: <strong>{refId}</strong> {isSaved ? <span style={{ color: '#059669', fontWeight: 700 }}>• Saved in Database</span> : <span style={{ color: '#D97706', fontWeight: 700 }}>• Draft (Unsaved)</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 28px', fontSize: 13, marginBottom: 16, background: T.bg, padding: '12px 14px', borderRadius: 6 }}>
            <div><strong>Company:</strong> {form.company || '—'}</div>
            <div><strong>Date:</strong> {form.visitDate || '—'}</div>
            <div><strong>Time:</strong> {form.visitStart || '09:00'} – {form.visitEnd || '17:00'}</div>
            <div><strong>Advisor:</strong> {form.visitAdvisor || '—'}</div>
            <div><strong>Visit No.:</strong> {form.visitNo || '—'}</div>
            <div><strong>Visitors:</strong> {visitorsList.length}</div>
          </div>

          {form.visitPurpose && <div style={{ marginBottom: 16, fontSize: 13 }}><strong>Purpose:</strong> {form.visitPurpose}</div>}

          <h2 style={{ fontSize: 13, color: T.navy, borderBottom: `2px solid ${T.navy}`, paddingBottom: 4, marginBottom: 8 }}>Visitor List</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 18 }}>
            <thead>
              <tr style={{ background: T.navy }}>
                {['#', 'Title', 'Name', 'Designation', 'Company', 'Dept'].map(h => (
                  <th key={h} style={{ color: 'white', padding: '6px 8px', textAlign: 'left', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visitorsList.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '8px', textAlign: 'center', color: T.muted }}>No visitors added</td></tr>
              ) : (
                visitorsList.map((v, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : T.bg }}>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px' }}>{i + 1}</td>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px' }}>{v.title || 'Mr'}</td>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px', fontWeight: 600 }}>{v.name}</td>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px' }}>{v.designation}</td>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px' }}>{v.company}</td>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px' }}>{v.dept}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h2 style={{ fontSize: 13, color: T.navy, borderBottom: `2px solid ${T.navy}`, paddingBottom: 4, marginBottom: 8 }}>
            Plant Tour Agenda <span style={{ fontWeight: 400, color: T.muted, fontSize: 11 }}>(Total: {hrs}h {mins}m)</span>
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: T.navy }}>
                {['#', 'Time', 'Duration', 'Area', 'Activity', 'PIC / Presenter', 'Support / Attendees'].map(h => (
                  <th key={h} style={{ color: 'white', padding: '6px 8px', textAlign: 'left', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agendaRows.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '8px', textAlign: 'center', color: T.muted }}>No agenda items found</td></tr>
              ) : (
                agendaRows.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : T.bg }}>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px' }}>{i + 1}</td>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px', fontWeight: 600, color: T.navy }}>{r.from_time || r.from} – {r.to_time || r.to}</td>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px' }}>{r.duration_min || r.durationMin} min</td>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px' }}>{r.area}</td>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px' }}>{r.activity_name || r.activity}</td>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px' }}>{r.pic || '—'}</td>
                    <td style={{ border: `1px solid ${T.border}`, padding: '5px 8px', color: '#475569' }}>{r.support_attendees || r.supportAttendees || r.support || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right Side: Actions & Finish Workflow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          
          {/* PRIMARY ACTION: FINISH BUTTON */}
          {!isSaved ? (
            <div style={{ background: 'white', border: `2px solid #059669`, borderRadius: 10, padding: 16, boxShadow: '0 4px 12px rgba(5,150,105,0.15)' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#065F46', marginBottom: 4 }}>
                Ready to Finalize?
              </div>
              <p style={{ fontSize: 11, color: T.muted, margin: '0 0 12px', lineHeight: 1.4 }}>
                Clicking Finish will save this visit permanently to the database and automatically send agenda emails to all attendees.
              </p>
              <button
                onClick={handleFinish}
                disabled={isFinalizing}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '14px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 2px 6px rgba(5,150,105,0.3)',
                  opacity: isFinalizing ? 0.7 : 1
                }}
              >
                {isFinalizing ? '⏳ Saving & Dispatching Emails…' : '🏁 Finish & Save Visit'}
              </button>
            </div>
          ) : (
            <div style={{ background: '#ECFDF5', border: `1px solid #A7F3D0`, borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>✅ Visit Saved in Database</div>
              <div style={{ fontSize: 11, color: '#047857', marginTop: 2 }}>Emails have been dispatched to attendees.</div>
            </div>
          )}

          {/* Print Action */}
          <button onClick={handlePrint} style={{ background: T.navy, color: 'white', border: 'none', borderRadius: 7, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(124,58,237,0.25)' }}>
            🖨 Print / Save as PDF
          </button>

          {/* Email Tools Card */}
          <div style={{ background: 'white', border: `1px solid ${T.border}`, borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>✉️ Email Agenda</span>
            </div>
            <p style={{ fontSize: 11, color: T.muted, margin: '0 0 10px', lineHeight: 1.4 }}>
              Send or resend the complete agenda directly to any email address.
            </p>

            {showEmailBox ? (
              <div style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  placeholder="Enter email(s) separated by commas"
                  style={{ width: '100%', padding: '7px 9px', border: `1px solid ${T.border}`, borderRadius: 5, fontSize: 11, boxSizing: 'border-box', marginBottom: 6 }}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleSendEmail()}
                    disabled={sendingEmail}
                    style={{ flex: 1, background: '#7C3AED', color: 'white', border: 'none', borderRadius: 5, padding: '7px', fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: sendingEmail ? 0.7 : 1 }}
                  >
                    {sendingEmail ? 'Sending…' : '📧 Send Now'}
                  </button>
                  <button
                    onClick={() => setShowEmailBox(false)}
                    style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 5, padding: '7px 10px', fontSize: 11, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {attendeeEmails.length > 0 && (
                  <button
                    onClick={() => handleSendEmail(attendeeEmails)}
                    disabled={sendingEmail}
                    style={{ background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE', borderRadius: 6, padding: '8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {sendingEmail ? '⏳ Sending Email…' : `📧 Resend to Attendees (${attendeeEmails.length})`}
                  </button>
                )}
                <button
                  onClick={() => setShowEmailBox(true)}
                  style={{ background: 'white', color: T.navy, border: `1px solid ${T.border}`, borderRadius: 6, padding: '7px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                >
                  + Send to Custom Email Address
                </button>
              </div>
            )}
          </div>

          <button onClick={onBack} style={{ background: 'white', color: T.navy, border: `1.5px solid ${T.border}`, borderRadius: 7, padding: '9px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            ← Back to Agenda Builder (Step 2)
          </button>
          
          <button onClick={onStartOver} style={{ background: 'white', color: T.accent, border: `1.5px solid ${T.accent}`, borderRadius: 7, padding: '9px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            + New VIS Sheet
          </button>

          <button onClick={() => window.location.href = '/feedback'} style={{ background: 'white', color: '#059669', border: `1.5px solid #059669`, borderRadius: 7, padding: '9px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            💬 Share Feedback Form
          </button>

        </div>
      </div>
    </div>
  );
}
