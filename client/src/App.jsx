import { useState } from 'react';
import { LOGO_B64 } from './logo_b64.js';
import Dashboard from './Dashboard.jsx';
import Screen1 from './Screen1.jsx';
import Screen2 from './Screen2.jsx';
import Screen3 from './Screen3.jsx';
import PreviousVisitors from './PreviousVisitors.jsx';
import FeedbackResults from './FeedbackResults.jsx';

/* ── Veris design tokens ───────────────────────────────────────────────────── */
const V = {
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
};

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: ${V.bg}; color: ${V.text};
    -webkit-font-smoothing: antialiased;
  }
  input, select, textarea, button { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #F1F5F9; }
  ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
`;

export const initForm = () => ({
  company: '', 
  visitDate: new Date().toISOString().slice(0, 10),
  visitStart: '09:00', 
  visitEnd: '17:00',
  visitAdvisor: '', 
  visitNo: '1st', 
  visitPurpose: '', 
  visitors: [],
  topAttendees: [
    { id: 1, name: 'MD San', role: 'MD', email: '', schedule: {} },
    { id: 2, name: 'GMD San', role: 'GMD', email: '', schedule: {} },
  ],
  hotel: { required: false, detail: '' },
  taxi: { required: false, rows: [{ id: 1, date: '', time: '', from: '', to: '' }] },
  lunch: { required: false, date: '', type: 'Special', venue: 'VIP' },
  plantTour: 'Bus',
  matrix: {},
  rehearsals: { mdSan: true, gmdSan: true, svp: false, vp: false, avp: false, hdd: false, count: 3 },
  prevVisitDate: '',
  visitedBefore: 'No'
});

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'vis1',      label: 'New VIS' },
  { id: 'previous',  label: 'Past Visits' },
  { id: 'feedback',  label: 'Feedback' },
];

/* ── Top horizontal nav ───────────────────────────────────────────────────── */
function TopNav({ active, onNav, screen }) {
  const isVis = ['vis1', 'vis2', 'vis3'].includes(screen);
  const step = screen === 'vis1' ? '1/3' : screen === 'vis2' ? '2/3' : screen === 'vis3' ? '3/3' : null;

  return (
    <header style={{
      height: 56, background: V.card, borderBottom: `1px solid ${V.border}`,
      display: 'flex', alignItems: 'center', padding: '0 28px', gap: 8,
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 28, flexShrink: 0 }}>
        <img src={LOGO_B64} alt="TIEI" style={{ height: 28, display: 'block' }} />
        <div style={{ borderLeft: `1px solid ${V.border}`, paddingLeft: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: V.text, lineHeight: 1.2 }}>Visitor System</div>
          <div style={{ fontSize: 10, color: V.subtle, letterSpacing: 0.3 }}>TIEI · Internal</div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        {NAV.map(item => {
          const isActive = active === item.id || (item.id === 'vis1' && isVis);
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                position: 'relative',
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? V.purple : V.muted,
                borderRadius: 6,
                transition: 'color 0.12s, background 0.12s',
              }}
              onMouseEnter={e => {
                if (!isActive) { e.currentTarget.style.color = V.text; e.currentTarget.style.background = '#F1F5F9'; }
              }}
              onMouseLeave={e => {
                if (!isActive) { e.currentTarget.style.color = V.muted; e.currentTarget.style.background = 'transparent'; }
              }}
            >
              {item.label}
              {item.id === 'vis1' && isVis && step && (
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 700,
                  background: V.purple, color: 'white',
                  borderRadius: 10, padding: '1px 7px',
                }}>{step}</span>
              )}
              {isActive && (
                <span style={{
                  position: 'absolute', bottom: -14, left: 12, right: 12, height: 2.5,
                  background: V.purple, borderRadius: 2,
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

/* ── Page shell ────────────────────────────────────────────────────────────── */
function Shell({ screen, goHome, navigate, children, title, showBack, onBackClick }) {
  return (
    <div style={{ minHeight: '100vh', background: V.bg, display: 'flex', flexDirection: 'column' }}>
      <TopNav active={screen} onNav={navigate} screen={screen} />
      {(title || showBack) && (
        <div style={{
          background: V.card, borderBottom: `1px solid ${V.border}`,
          padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {showBack && (
            <button onClick={onBackClick || goHome} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: V.purpleLt, border: `1px solid ${V.purpleMid}`,
              borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
              fontSize: 12, color: V.purple, fontWeight: 600,
            }}>
              ← Back
            </button>
          )}
          {title && <h1 style={{ fontSize: 15, fontWeight: 600, color: V.text }}>{title}</h1>}
        </div>
      )}
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

/* ── Root App ──────────────────────────────────────────────────────────────── */
export default function App() {
  const [screen, setScreen]     = useState('dashboard');
  const [visitId, setVisitId]   = useState(null);
  const [agenda, setAgenda]     = useState([]);
  const [formData, setFormData] = useState(initForm());

  const goHome = () => {
    setScreen('dashboard');
    setVisitId(null);
    setAgenda([]);
    setFormData(initForm());
  };

  const navigate = (id) => {
    if (id === 'dashboard') { goHome(); return; }
    if (id === 'vis1') {
      setScreen('vis1');
      return;
    }
    setScreen(id);
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {screen === 'dashboard' && (
        <Shell screen="dashboard" goHome={goHome} navigate={navigate}>
          <Dashboard
            onNewVIS={() => { setVisitId(null); setAgenda([]); setFormData(initForm()); setScreen('vis1'); }}
            onPrevVisitors={() => setScreen('previous')}
            onFeedback={() => setScreen('feedback')}
          />
        </Shell>
      )}

      {screen === 'previous' && (
        <Shell screen="previous" goHome={goHome} navigate={navigate} title="Past Visitor Records" showBack onBackClick={goHome}>
          <PreviousVisitors />
        </Shell>
      )}

      {screen === 'feedback' && (
        <Shell screen="feedback" goHome={goHome} navigate={navigate} title="Visitor Feedback" showBack onBackClick={goHome}>
          <FeedbackResults />
        </Shell>
      )}

      {screen === 'vis1' && (
        <Shell screen="vis1" goHome={goHome} navigate={navigate} title="New VIS Sheet — Step 1 of 3" showBack onBackClick={goHome}>
          <Screen1
            formData={formData}
            setFormData={setFormData}
            onBack={goHome}
            onNext={() => setScreen('vis2')}
          />
        </Shell>
      )}

      {screen === 'vis2' && (
        <Shell screen="vis2" goHome={goHome} navigate={navigate} title="Agenda Builder — Step 2 of 3" showBack onBackClick={() => setScreen('vis1')}>
          <Screen2
            formData={formData}
            setFormData={setFormData}
            visitId={visitId}
            setVisitId={setVisitId}
            onBack={() => setScreen('vis1')}
            onNext={(rows, savedId) => { 
              setAgenda(rows); 
              if (savedId) setVisitId(savedId);
              setScreen('vis3'); 
            }}
          />
        </Shell>
      )}

      {screen === 'vis3' && (
        <Shell screen="vis3" goHome={goHome} navigate={navigate} title="Summary & Confirmation — Step 3 of 3" showBack onBackClick={() => setScreen('vis2')}>
          <Screen3
            formData={formData}
            agenda={agenda}
            visitId={visitId}
            onBack={() => setScreen('vis2')}
            onStartOver={goHome}
          />
        </Shell>
      )}
    </>
  );
}
