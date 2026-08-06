import { useEffect, useState } from 'react';
import VisitDetailModal from './VisitDetailModal.jsx';

const C = {
  bg: '#F8FAFC', card: '#ffffff', border: '#E2E8F0',
  navy: '#0F172A', navyMid: '#1E293B',
  blue: '#2563EB', blueLt: '#EFF6FF',
  green: '#059669', greenLt: '#ECFDF5',
  amber: '#D97706', amberLt: '#FFFBEB',
  violet: '#7C3AED', violetLt: '#F5F3FF',
  red: '#DC2626', redLt: '#FEF2F2',
  text: '#0F172A', muted: '#64748B', subtle: '#94A3B8',
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, delta, accent, loading }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: accent, borderRadius: '3px 0 0 3px' }} />
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase',
        letterSpacing: 0.6, marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: C.text, lineHeight: 1, letterSpacing: -0.5 }}>
        {loading ? <span style={{ color: C.border }}>—</span> : value}
      </div>
      {delta !== undefined && (
        <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{delta}</div>
      )}
    </div>
  );
}

// ── Action tile ───────────────────────────────────────────────────────────────
function ActionTile({ label, description, accent, accentLt, onClick, icon }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? accent : C.card, border: `1px solid ${hov ? accent : C.border}`,
        borderRadius: 10, padding: '22px 24px', cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 10,
        boxShadow: hov ? `0 4px 20px ${accent}30` : '0 1px 3px rgba(0,0,0,0.04)',
      }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: hov ? 'rgba(255,255,255,0.2)' : accentLt, fontSize: 20 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: hov ? '#fff' : C.text, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 12, color: hov ? 'rgba(255,255,255,0.7)' : C.muted, lineHeight: 1.5 }}>{description}</div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: hov ? 'rgba(255,255,255,0.85)' : accent, marginTop: 'auto' }}>
        Open →
      </div>
    </button>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    'Completed': { bg: C.blueLt,   color: C.blue,   dot: C.blue   },
    'Generated': { bg: C.greenLt,  color: C.green,  dot: C.green  },
    'Draft':     { bg: C.amberLt,  color: C.amber,  dot: C.amber  },
  };
  const s = map[status] || map['Draft'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color, borderRadius: 4,
      padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status || 'Draft'}
    </span>
  );
}

export default function Dashboard({ onNewVIS, onPrevVisitors, onFeedback }) {
  const [stats, setStats]   = useState({});
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitId, setSelectedVisitId] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.json()).catch(() => ({})),
      fetch('/api/visits').then(r => r.json()).catch(() => []),
    ]).then(([s, v]) => {
      setStats(s);
      setRecent(Array.isArray(v) ? v.slice(0, 10) : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{today}</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>Dashboard</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Visits Today"      value={stats.today    ?? 0} accent={C.blue}   loading={loading} delta="scheduled for today" />
        <StatCard label="This Week"         value={stats.week     ?? 0} accent={C.violet} loading={loading} delta="last 7 days" />
        <StatCard label="This Month"        value={stats.month    ?? 0} accent={C.green}  loading={loading} delta="last 30 days" />
        <StatCard label="Feedback Received" value={stats.feedback ?? 0} accent={C.amber}  loading={loading} delta="total responses" />
      </div>

      {/* Actions */}
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase',
        letterSpacing: 0.6, marginBottom: 12 }}>Quick actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 32 }}>
        <ActionTile icon="📋" label="New VIS Sheet"
          description="Create a Visitor Instruction Sheet and build the plant tour agenda"
          accent={C.blue} accentLt={C.blueLt} onClick={onNewVIS} />
        <ActionTile icon="🔍" label="Past Visitor Records"
          description="Search previous visitors — auto-fetch visit history and last agenda"
          accent={C.violet} accentLt={C.violetLt} onClick={onPrevVisitors} />
        <ActionTile icon="💬" label="Visitor Feedback"
          description="View feedback responses and share the form link with visitors"
          accent={C.green} accentLt={C.greenLt} onClick={onFeedback} />
      </div>

      {/* Recent visits */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Recent visits</div>
          <div style={{ fontSize: 11, color: C.subtle, marginTop: 2 }}>Click any visit row below to view details, add review points, upload photos & complete visit</div>
        </div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: '#F8FAFC' }}>
              {['Company','Visit Date','Advisor','Visit No.','Status','Action'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11,
                  fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: 13 }}>Loading…</td></tr>
            ) : recent.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 13 }}>
                No visits yet. Create your first VIS sheet above.
              </td></tr>
            ) : recent.map((v, i) => (
              <tr key={v.id} 
                onClick={() => setSelectedVisitId(v.id)}
                style={{ 
                  borderBottom: i < recent.length-1 ? `1px solid ${C.border}` : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e=>e.currentTarget.style.background='#F5F3FF'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.text }}>{v.company_name || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: C.muted }}>{v.visit_date || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: C.muted }}>{v.visit_advisor || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: C.muted }}>{v.visit_no || '—'}</td>
                <td style={{ padding: '12px 16px' }}><Badge status={v.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedVisitId(v.id); }}
                    style={{
                      background: '#F5F3FF', color: '#7C3AED', border: '1px solid #EDE9FE',
                      borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                    }}>
                    {v.status === 'Completed' ? 'View Review →' : 'Review & Complete →'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Visit Details & Completion */}
      {selectedVisitId && (
        <VisitDetailModal
          visitId={selectedVisitId}
          onClose={() => setSelectedVisitId(null)}
          onUpdated={loadData}
        />
      )}
    </div>
  );
}

