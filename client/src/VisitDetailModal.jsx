import { useState, useEffect } from 'react';
import { api } from './api.js';

const T = {
  purple: '#7C3AED',
  purpleDark: '#6D28D9',
  purpleLt: '#F5F3FF',
  purpleMid: '#EDE9FE',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  subtle: '#94A3B8',
  green: '#059669',
  greenLt: '#ECFDF5',
  blue: '#2563EB',
  blueLt: '#EFF6FF',
  amber: '#D97706',
  amberLt: '#FEF3C7',
};

function getLockInfo(visit) {
  if (!visit || visit.status !== 'Completed') {
    return { isLocked: false, label: null, diffHours: 0 };
  }
  const refTime = visit.completed_at || visit.created_at || visit.visit_date;
  if (!refTime) return { isLocked: false, label: null, diffHours: 0 };

  const refDate = new Date(refTime);
  if (isNaN(refDate.getTime())) return { isLocked: false, label: null, diffHours: 0 };

  const diffMs = Date.now() - refDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours >= 24) {
    return {
      isLocked: true,
      label: '🔒 Completed',
      diffHours
    };
  } else {
    const hoursLeft = Math.floor(24 - diffHours);
    const minsLeft = Math.floor(((24 - diffHours) % 1) * 60);
    return {
      isLocked: false,
      label: `⏱️ Completed (${hoursLeft}h ${minsLeft}m edit window)`,
      diffHours
    };
  }
}

function StatusBadge({ status, lockInfo }) {
  const isCompleted = status === 'Completed';
  if (isCompleted && lockInfo?.isLocked) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D',
        borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700
      }}>
        🔒 Completed (Read-Only)
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: isCompleted ? T.blueLt : T.greenLt,
      color: isCompleted ? T.blue : T.green,
      border: `1px solid ${isCompleted ? '#BFDBFE' : '#A7F3D0'}`,
      borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: isCompleted ? T.blue : T.green }} />
      {lockInfo?.label || status || 'Generated'}
    </span>
  );
}

export default function VisitDetailModal({ visitId, onClose, onUpdated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [reviewPoints, setReviewPoints] = useState('');
  const [photos, setPhotos] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    if (!visitId) return;
    setLoading(true);
    api.getFullVisit(visitId)
      .then(res => {
        setData(res);
        setReviewPoints(res.visit?.review_points || '');
        let parsedPhotos = [];
        if (res.visit?.photos) {
          try {
            parsedPhotos = typeof res.visit.photos === 'string' ? JSON.parse(res.visit.photos) : res.visit.photos;
          } catch (_) {
            parsedPhotos = [];
          }
        }
        setPhotos(Array.isArray(parsedPhotos) ? parsedPhotos : []);
      })
      .catch(err => setError(err.message || 'Failed to load visit details'))
      .finally(() => setLoading(false));
  }, [visitId]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (evt) => {
        const img = new Image();
        img.src = evt.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          const max = 900;
          if (w > max || h > max) {
            if (w > h) { h = Math.round((h * max) / w); w = max; }
            else { w = Math.round((w * max) / h); h = max; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setPhotos(prev => [...prev, compressed]);
        };
      };
    });
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (markComplete = false) => {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const newStatus = markComplete ? 'Completed' : (data?.visit?.status || 'Generated');
      const res = await api.completeVisit(visitId, reviewPoints, photos, newStatus);
      if (res && res.visit) {
        setData(prev => ({ ...prev, visit: res.visit }));
      }
      setSuccessMsg(markComplete ? '🎉 Visit marked as Completed with review points & photos!' : '✅ Review saved successfully!');
      if (onUpdated) onUpdated();
      if (markComplete) {
        setTimeout(() => { onClose(); }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to update visit details.');
    } finally {
      setSaving(false);
    }
  };

  if (!visitId) return null;

  const visit = data?.visit || {};
  const visitors = data?.visitors || [];
  const agenda = data?.agenda || [];
  const lockInfo = getLockInfo(visit);
  const isLocked = lockInfo.isLocked;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: 'white', borderRadius: 14, width: '100%', maxWidth: 940,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: 'white', padding: '18px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: `1px solid ${T.border}`
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              VISIT DETAILS & REVIEW
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
              {visit.company_name || 'Visitor Record'}
              <StatusBadge status={visit.status} lockInfo={lockInfo} />
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            width: 32, height: 32, borderRadius: '50%', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>×</button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: T.bg }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading visit details…</div>
          ) : (
            <>
              {isLocked && (
                <div style={{
                  background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E',
                  padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span>🔒 <strong>Read-Only Mode:</strong> This visit was completed over 24 hours ago. Editing review points and uploading photos are locked.</span>
                </div>
              )}

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
                  ⚠️ {error}
                </div>
              )}
              {successMsg && (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
                  {successMsg}
                </div>
              )}

              {/* Grid: Overview Information */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20,
                background: 'white', border: `1px solid ${T.border}`, borderRadius: 10, padding: 14
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Visit Date</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginTop: 3 }}>📅 {visit.visit_date || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Time Slot</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginTop: 3 }}>⏰ {visit.visit_start || '09:00'} - {visit.visit_end || '17:00'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Visit Advisor</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginTop: 3 }}>👤 {visit.visit_advisor || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Visit No.</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.purple, marginTop: 3 }}>🏷️ {visit.visit_no || '—'}</div>
                </div>
                {visit.visit_purpose && (
                  <div style={{ gridColumn: 'span 4', paddingTop: 8, borderTop: `1px dashed ${T.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Visit Purpose</div>
                    <div style={{ fontSize: 12, color: T.text, marginTop: 2 }}>{visit.visit_purpose}</div>
                  </div>
                )}
              </div>

              {/* Visitors Section */}
              <div style={{ background: 'white', border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  👥 Visitor Attendees ({visitors.length})
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: T.bg }}>
                      {['#', 'Title', 'Name', 'Designation', 'Company', 'Dept/Division'].map(h => (
                        <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: T.muted, fontSize: 10, fontWeight: 700, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((v, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < visitors.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                        <td style={{ padding: '6px 8px', color: T.muted }}>{idx + 1}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{v.title}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 700, color: T.text }}>{v.name}</td>
                        <td style={{ padding: '6px 8px', color: T.muted }}>{v.designation}</td>
                        <td style={{ padding: '6px 8px' }}>{v.company}</td>
                        <td style={{ padding: '6px 8px', color: T.muted }}>{v.dept}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Agenda Section */}
              {agenda.length > 0 && (
                <div style={{ background: 'white', border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    🗓️ Visit Agenda Schedule
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: T.bg }}>
                        {['#', 'Time', 'Duration', 'Area', 'Activity', 'PIC'].map(h => (
                          <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: T.muted, fontSize: 10, fontWeight: 700, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {agenda.map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: idx < agenda.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                          <td style={{ padding: '6px 8px', color: T.muted }}>{idx + 1}</td>
                          <td style={{ padding: '6px 8px', fontWeight: 700, color: T.purple }}>{r.from_time} - {r.to_time}</td>
                          <td style={{ padding: '6px 8px', color: T.muted }}>{r.duration_min}m</td>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>{r.area}</td>
                          <td style={{ padding: '6px 8px' }}>{r.activity_name}</td>
                          <td style={{ padding: '6px 8px', color: T.muted }}>{r.pic || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 📝 REVIEW POINTS & OBSERVATIONS */}
              <div style={{ background: 'white', border: `1px solid ${isLocked ? T.border : T.purpleMid}`, borderRadius: 10, padding: 16, marginBottom: 20, boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isLocked ? T.text : T.purpleDark, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📝 Visit Review Points & Observations {isLocked && <span style={{ fontSize: 11, color: T.muted, fontWeight: 400 }}>(Locked)</span>}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>
                  {isLocked ? 'Recorded observations from this visit:' : 'Enter summary observations, executive review points, or action items from this visit:'}
                </div>
                <textarea
                  value={reviewPoints}
                  onChange={e => setReviewPoints(e.target.value)}
                  readOnly={isLocked}
                  rows={4}
                  placeholder={isLocked ? 'No review points were entered for this visit.' : 'e.g. 1. Executive team impressed by plant automation. 2. Follow-up meeting requested on kaizen activities...'}
                  style={{
                    width: '100%', padding: '10px 12px', border: `1px solid ${T.border}`,
                    borderRadius: 8, fontSize: 13, color: T.text, outline: 'none',
                    resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                    background: isLocked ? '#F8FAFC' : 'white',
                    cursor: isLocked ? 'not-allowed' : 'text'
                  }}
                />
              </div>

              {/* 📸 PHOTOS UPLOAD & GALLERY */}
              <div style={{ background: 'white', border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>📸 Visit Photos ({photos.length})</div>
                    <div style={{ fontSize: 11, color: T.muted }}>
                      {isLocked ? 'Photos uploaded from the visit:' : 'Upload site photos, group photos, or event pictures from the visit.'}
                    </div>
                  </div>
                  {!isLocked && (
                    <label style={{
                      background: T.purpleLt, color: T.purple, border: `1px solid ${T.purpleMid}`,
                      borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'all 0.15s'
                    }}>
                      📷 Upload Photos
                      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                {photos.length === 0 ? (
                  <div style={{
                    border: `2px dashed ${T.border}`, borderRadius: 8, padding: 24,
                    textAlign: 'center', color: T.muted, fontSize: 12, background: '#FAFAFA'
                  }}>
                    {isLocked ? 'No photos were uploaded for this visit.' : <>No photos uploaded yet. Click <strong>"📷 Upload Photos"</strong> to add pictures.</>}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                    {photos.map((src, idx) => (
                      <div key={idx} style={{
                        position: 'relative', height: 100, borderRadius: 8, overflow: 'hidden',
                        border: `1px solid ${T.border}`, background: '#000'
                      }}>
                        <img
                          src={src}
                          alt={`Visit photo ${idx + 1}`}
                          onClick={() => setPreviewPhoto(src)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                        />
                        {!isLocked && (
                          <button
                            onClick={() => removePhoto(idx)}
                            title="Remove photo"
                            style={{
                              position: 'absolute', top: 4, right: 4, background: 'rgba(220,38,38,0.85)',
                              color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22,
                              fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '14px 24px', background: 'white', borderTop: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
        }}>
          <button onClick={onClose} style={{
            background: 'white', color: T.muted, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>
            Close
          </button>

          {isLocked ? (
            <div style={{
              background: '#F1F5F9', border: `1px solid ${T.border}`, color: T.muted,
              borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              🔒 Read-Only Mode
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleSave(false)}
                disabled={saving || loading}
                style={{
                  background: T.purpleLt, color: T.purple, border: `1px solid ${T.purpleMid}`,
                  borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Saving…' : 'Save Draft Review'}
              </button>

              <button
                onClick={() => handleSave(true)}
                disabled={saving || loading}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white', border: 'none', borderRadius: 8, padding: '9px 22px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(5,150,105,0.3)', opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Completing…' : '✅ Mark as Complete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Preview */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 20
          }}
        >
          <img src={previewPhoto} alt="Full view" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
          <button style={{ position: 'absolute', top: 20, right: 20, background: 'white', color: 'black', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer', fontWeight: 800 }}>×</button>
        </div>
      )}
    </div>
  );
}

