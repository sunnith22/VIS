import { useState } from 'react';

// ── Color Theme ──────────────────────────────────────────────────────────────
const C = {
  sidebarBg: '#0A1931',
  sidebarActive: '#10B981',
  bg: '#F1F5F9',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  subtle: '#94A3B8',
  green: '#10B981',
  greenLight: '#D1FAE5',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  red: '#EF4444',
  redLight: '#FEE2E2',
  blue: '#3B82F6',
  blueLight: '#DBEAFE',
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
};

export default function SafetyDashboard({ onBackToHoshin }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* ── Left Sidebar Navigation ────────────────────────────────────────────── */}
      <aside style={{ width: 220, background: C.sidebarBg, color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#fff' }}>
            🛡️
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.5 }}>Safety KPI</div>
            <div style={{ fontSize: 9, color: '#94A3B8', letterSpacing: 0.3 }}>TTE India Plant Safety</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <button
            onClick={onBackToHoshin}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
              border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', textAlign: 'left'
            }}>
            <span>←</span> Back to Main Hoshin
          </button>

          <div style={{ margin: '12px 0 6px 10px', fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Safety Sections
          </div>

          {[
            { label: 'Safety Overview', icon: '🛡️', active: true },
            { label: 'LTIFR & Incidents', icon: '📈' },
            { label: 'Dept Risk Matrix', icon: '⚙️' },
            { label: 'Training & Audits', icon: '🎓' },
            { label: 'CAPA Tracking', icon: '✅' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
                background: item.active ? C.sidebarActive : 'transparent', color: item.active ? '#fff' : '#94A3B8',
                fontWeight: item.active ? 700 : 500, fontSize: 13
              }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 10, color: '#94A3B8' }}>
          <div style={{ fontWeight: 800, color: C.green }}>ZERO HARM GOAL</div>
          <div>Target: 0 Lost Time Injuries</div>
        </div>
      </aside>

      {/* ── Safety Workspace Content ───────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        
        {/* Header Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={onBackToHoshin}
                style={{
                  background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px',
                  fontSize: 12, fontWeight: 700, color: C.blue, cursor: 'pointer'
                }}>
                ← Main Summary
              </button>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: -0.5 }}>
                SAFETY KPI DASHBOARD – DETAILED ANALYSIS
              </h1>
            </div>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              Real-time Safety Indicators, Incident Metrics, LTIFR Trends, and Departmental Compliance
            </p>
          </div>

          <div style={{
            background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ fontSize: 16 }}>📅</span>
            <div>
              <div style={{ fontSize: 9, color: C.muted, fontWeight: 700 }}>DATA AS ON</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>30 June 2026</div>
            </div>
          </div>
        </header>

        {/* ── TOP SECTION: Safety Indicator Gauge & Safety Related KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.8fr', gap: 16, marginBottom: 20 }}>
          
          {/* Main Safety Speedometer Indicator */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              OVERALL SAFETY INDICATOR
            </div>

            {/* Gauge Graphic */}
            <div style={{ position: 'relative', width: 170, height: 95, margin: '0 auto' }}>
              <svg viewBox="0 0 100 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <path d="M 10 50 A 40 40 0 1 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 30 22" fill="none" stroke={C.red} strokeWidth="12" strokeLinecap="round" />
                <path d="M 30 22 A 40 40 0 0 1 70 22" fill="none" stroke={C.amber} strokeWidth="12" />
                <path d="M 70 22 A 40 40 0 0 1 90 50" fill="none" stroke={C.green} strokeWidth="12" strokeLinecap="round" />

                {/* Needle pointing to 86% */}
                <circle cx="50" cy="50" r="5" fill="#0F172A" />
                <line x1="50" y1="50" x2="78" y2="28" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>

            <div style={{ fontSize: 28, fontWeight: 900, color: C.green, marginTop: 4 }}>86%</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>EXCELLENT (Target Exceeded)</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Zero Major Lost Time Injuries in 2026</div>
          </div>

          {/* 4 Safety KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Days Without LTI', val: '420 Days', sub: 'Target: 365+ Days', icon: '🏆', color: C.green, bg: C.greenLight },
              { label: 'Near Miss Reports', val: '28 Closed', sub: '28 Reported / 28 Resolved', icon: '⚡', color: C.blue, bg: C.blueLight },
              { label: 'Safety Audit Score', val: '94.5%', sub: 'Target: 90% Minimum', icon: '📋', color: C.purple, bg: C.purpleLight },
              { label: 'Open Hazards (CAPA)', val: '05 Open', sub: '42 Closed this month', icon: '⚠️', color: C.amber, bg: C.amberLight },
            ].map((kpi, idx) => (
              <div key={idx} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>{kpi.icon}</span>
                  <span style={{ background: kpi.bg, color: kpi.color, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                    Active
                  </span>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.text, marginTop: 2 }}>
                    {kpi.val}
                  </div>
                  <div style={{ fontSize: 10, color: C.subtle, marginTop: 2 }}>
                    {kpi.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── MIDDLE SECTION: 3 MAIN SAFETY KPI GRAPHS ──────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 4, height: 16, background: C.green, borderRadius: 2 }} />
            MAIN SAFETY KPI GRAPHS (3 Core Metrics)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            
            {/* Main Graph 1: LTIFR Line Trend */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 2 }}>
                1. LTIFR 12-Month Trend (Target vs Actual)
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>Lost Time Injury Frequency Rate</div>

              <div style={{ height: 140, position: 'relative', display: 'flex', alignItems: 'flex-end', borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
                <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="200" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="80" x2="200" y2="80" stroke="#F1F5F9" strokeWidth="1" />

                  {/* Target Line (Red Dashed) */}
                  <line x1="0" y1="30" x2="200" y2="30" stroke={C.red} strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Actual LTIFR Trend Line (Green) */}
                  <path
                    d="M 10 75 L 40 65 L 70 55 L 100 45 L 130 35 L 160 25 L 190 20"
                    fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round"
                  />
                  {/* Points */}
                  {[[10,75],[40,65],[70,55],[100,45],[130,35],[160,25],[190,20]].map(([x,y], i) => (
                    <circle key={i} cx={x} cy={y} r="4" fill={C.green} />
                  ))}
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.muted, marginTop: 8, fontWeight: 700 }}>
                <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
              </div>
            </div>

            {/* Main Graph 2: Monthly Incidents & Near Misses Stacked Bar */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 2 }}>
                2. Monthly Incidents & Near Misses Volume
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>Incidents (Red) vs Near Misses (Blue)</div>

              <div style={{ height: 140, display: 'flex', alignItems: 'flex-end', gap: 12, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                {[
                  { m: 'Jan', inc: 2, nm: 8 },
                  { m: 'Feb', inc: 1, nm: 12 },
                  { m: 'Mar', inc: 0, nm: 15 },
                  { m: 'Apr', inc: 1, nm: 10 },
                  { m: 'May', inc: 0, nm: 14 },
                  { m: 'Jun', inc: 0, nm: 18 },
                ].map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '80%', maxWidth: 24, display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: d.inc * 12, background: C.red }} />
                      <div style={{ height: d.nm * 5, background: C.blue }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginTop: 6 }}>{d.m}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 10, fontWeight: 700, marginTop: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: C.red, borderRadius: 2 }} /> Incidents</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: C.blue, borderRadius: 2 }} /> Near Misses</span>
              </div>
            </div>

            {/* Main Graph 3: Departmental Safety Risk Score */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 2 }}>
                3. Departmental Safety Risk & Audit Score
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 12 }}>Horizontal Bar Chart (Risk Ratings)</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { dept: 'Machining Line', score: 96, color: C.green },
                  { dept: 'Engine Assembly', score: 92, color: C.green },
                  { dept: 'TNGA Cylinder Block', score: 88, color: C.blue },
                  { dept: 'Press & Stamping', score: 78, color: C.amber },
                  { dept: 'Maintenance & Utility', score: 84, color: C.blue },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                      <span>{item.dept}</span>
                      <span>{item.score}%</span>
                    </div>
                    <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${item.score}%`, height: '100%', background: item.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── LOWER SECTION: 4 SUB SAFETY KPI GRAPHS ───────────────────────── */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 4, height: 16, background: C.blue, borderRadius: 2 }} />
            SUB SAFETY KPI GRAPHS (4 Detailed Metrics)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            
            {/* Sub Graph 1: Safety Training Completion */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.text, marginBottom: 10 }}>
                1. Safety Training Completion Rate
              </div>
              <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#E2E8F0" strokeWidth="14" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke={C.green} strokeWidth="14" strokeDasharray="219 238" />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: C.text }}>
                  92%
                </div>
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 8, fontWeight: 700 }}>460 / 500 Employees Trained</div>
            </div>

            {/* Sub Graph 2: CAPA Closure Rate */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.text, marginBottom: 10 }}>
                2. CAPA Closure Rate
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: C.text }}>
                    <span>Closed Actions</span>
                    <span>88%</span>
                  </div>
                  <div style={{ height: 10, background: '#F1F5F9', borderRadius: 5, marginTop: 4 }}>
                    <div style={{ width: '88%', height: '100%', background: C.green, borderRadius: 5 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: C.text }}>
                    <span>In-Progress CAPA</span>
                    <span>12%</span>
                  </div>
                  <div style={{ height: 10, background: '#F1F5F9', borderRadius: 5, marginTop: 4 }}>
                    <div style={{ width: '12%', height: '100%', background: C.amber, borderRadius: 5 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub Graph 3: PPE Compliance by Shift */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.text, marginBottom: 10 }}>
                3. PPE Compliance by Shift
              </div>
              <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', gap: 10, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
                {[
                  { shift: 'Shift A', val: 98 },
                  { shift: 'Shift B', val: 95 },
                  { shift: 'Shift C', val: 91 },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '70%', height: s.val * 0.6, background: C.blue, borderRadius: '4px 4px 0 0' }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: C.muted, marginTop: 4 }}>{s.shift}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub Graph 4: Emergency Fire & Audit Score */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.text, marginBottom: 10 }}>
                4. Fire Safety Audit Score
              </div>
              <div style={{ height: 75, position: 'relative' }}>
                <svg viewBox="0 0 100 50" style={{ width: '100%', height: '100%' }}>
                  <path d="M 0 45 L 30 35 L 60 25 L 100 15 L 100 50 L 0 50 Z" fill={C.purpleLight} />
                  <path d="M 0 45 L 30 35 L 60 25 L 100 15" fill="none" stroke={C.purple} strokeWidth="2.5" />
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.muted, fontWeight: 700, marginTop: 4 }}>
                <span>Q1: 85%</span><span>Q2: 91%</span><span>Q3: 96%</span>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
