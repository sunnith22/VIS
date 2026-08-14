import { useState, useEffect } from 'react';
import { api } from './api.js';
import VisitDetailModal from './VisitDetailModal.jsx';

const T = {
  navy: '#7C3AED', accent: '#7C3AED', bg: '#F0F4FA',
  border: '#CBD5E1', text: '#1E293B', muted: '#64748B',
  blue: '#2563EB', blueLt: '#EFF6FF',
  green: '#059669', greenLt: '#ECFDF5',
  amber: '#D97706', amberLt: '#FFFBEB',
};

function StatusBadge({ status }) {
  const isCompleted = status === 'Completed';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: isCompleted ? T.blueLt : T.greenLt,
      color: isCompleted ? T.blue : T.green,
      border: `1px solid ${isCompleted ? '#BFDBFE' : '#A7F3D0'}`,
      borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isCompleted ? T.blue : T.green }} />
      {status || 'Generated'}
    </span>
  );
}

export default function PreviousVisitors() {
  const [query, setQuery]       = useState('');
  const [field, setField]       = useState('all');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [allVisits, setAllVisits] = useState([]);
  const [visitorRecords, setVisitorRecords] = useState([]);
  const [viewMode, setViewMode] = useState('visits'); // 'visits' | 'visitors'
  const [selectedModalId, setSelectedModalId] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [resVisits, resSearch] = await Promise.all([
        api.getVisits().catch(() => []),
        api.searchVisitors(field, query.trim()).catch(() => [])
      ]);
      setAllVisits(Array.isArray(resVisits) ? resVisits : []);
      setVisitorRecords(Array.isArray(resSearch) ? resSearch : []);
    } catch (e) {
      setError(e.message || 'Failed to load past visits');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  // Filter visits client-side
  const filteredVisits = allVisits.filter(v => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    const companyMatch = (v.company_name || '').toLowerCase().includes(q);
    const advisorMatch = (v.visit_advisor || '').toLowerCase().includes(q);
    const noMatch = (v.visit_no || '').toLowerCase().includes(q);
    const visitorMatch = (v.visitors || []).some(vis => 
      (vis.name || '').toLowerCase().includes(q) || 
      (vis.company || '').toLowerCase().includes(q) ||
      (vis.designation || '').toLowerCase().includes(q)
    );
    return companyMatch || advisorMatch || noMatch || visitorMatch;
  });

  // Filter visitor records client-side
  const filteredVisitorRecords = visitorRecords.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const handleSearch = () => {
    loadData();
  };

  const selStyle = { padding: '9px 12px', border: `1.5px solid ${T.border}`, borderRadius: 7, fontSize: 13, color: T.text, background: 'white', outline: 'none' };

  return (
    <div style={{ flex: 1, background: T.bg, fontFamily: "'Segoe UI', Arial, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>

        {/* Top Header & View Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Past Visit Records</h1>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
              Browse and search all past visits, attendees, review points, and site photos
            </div>
          </div>

          <div style={{ display: 'flex', background: '#E2E8F0', padding: 3, borderRadius: 8, gap: 2 }}>
            <button
              onClick={() => setViewMode('visits')}
              style={{
                background: viewMode === 'visits' ? 'white' : 'transparent',
                color: viewMode === 'visits' ? T.navy : T.muted,
                border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: viewMode === 'visits' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🏢 By Visit ({filteredVisits.length})
            </button>
            <button
              onClick={() => setViewMode('visitors')}
              style={{
                background: viewMode === 'visitors' ? 'white' : 'transparent',
                color: viewMode === 'visitors' ? T.navy : T.muted,
                border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: viewMode === 'visitors' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              👤 By Individual Visitor
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ background: 'white', border: `1px solid ${T.border}`, borderRadius: 10, padding: '18px 22px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={field} onChange={e => setField(e.target.value)} style={{ ...selStyle, width: 140 }}>
              <option value="all">All Fields</option>
              <option value="name">Visitor Name</option>
              <option value="company">Company</option>
              <option value="designation">Designation</option>
            </select>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search company, visitor name, advisor, or visit no…"
              style={{ ...selStyle, flex: 1, minWidth: 220 }}
            />
            <button onClick={handleSearch} disabled={loading}
              style={{ background: T.navy, color: 'white', border: 'none', borderRadius: 7, padding: '9px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Searching…' : '🔍 Search'}
            </button>
          </div>

          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>Filter Status:</span>
            {['ALL', 'Generated', 'Completed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? (st === 'Completed' ? T.blueLt : st === 'Generated' ? T.greenLt : T.navy) : '#F1F5F9',
                  color: statusFilter === st ? (st === 'Completed' ? T.blue : st === 'Generated' ? T.green : 'white') : T.muted,
                  border: `1px solid ${statusFilter === st ? (st === 'Completed' ? '#BFDBFE' : st === 'Generated' ? '#A7F3D0' : T.navy) : T.border}`,
                  borderRadius: 16, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                }}
              >
                {st === 'ALL' ? 'All Visits' : st}
              </button>
            ))}
          </div>

          {error && <div style={{ color: '#DC2626', fontSize: 13, marginTop: 10 }}>⚠️ {error}</div>}
        </div>

        {/* View Mode 1: BY VISIT */}
        {viewMode === 'visits' && (
          <div style={{ background: 'white', border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '12px 16px', background: T.bg, borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.muted, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Showing {filteredVisits.length} past visit record{filteredVisits.length !== 1 ? 's' : ''}</span>
              <span style={{ fontSize: 11, color: T.muted }}>Click any row to open full visit details, review & photos</span>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading past visits…</div>
            ) : filteredVisits.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.muted, fontSize: 14 }}>
                No past visits found matching your filter criteria.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: T.navy }}>
                    {['Company', 'Visit Date', 'Visitors', 'Advisor / Purpose', 'Photos & Review', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'white', fontSize: 11, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredVisits.map((v, i) => {
                    const photosArr = (() => { try { return typeof v.photos === 'string' ? JSON.parse(v.photos) : (v.photos || []); } catch { return []; } })();
                    const visitorNames = (v.visitors || []).map(vis => vis.name).filter(Boolean);
                    const firstVisitor = visitorNames[0] || 'Attendee';
                    const remainingCount = visitorNames.length > 1 ? ` +${visitorNames.length - 1} more` : '';

                    return (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedModalId(v.id)}
                        style={{
                          background: i % 2 === 0 ? 'white' : T.bg,
                          borderTop: `1px solid ${T.border}`,
                          cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F3FF'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : T.bg}
                      >
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: T.text }}>
                          {v.company_name || 'Visitor Record'}
                          {v.visit_no && <div style={{ fontSize: 11, color: T.navy, fontWeight: 600 }}>🏷️ {v.visit_no}</div>}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: T.text, fontWeight: 600 }}>
                          📅 {v.visit_date || 'N/A'}
                          <div style={{ fontSize: 11, color: T.muted }}>⏰ {v.visit_start || '09:00'} - {v.visit_end || '17:00'}</div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: T.muted }}>
                          <div style={{ fontWeight: 600, color: T.text }}>👤 {firstVisitor}{remainingCount}</div>
                          <div style={{ fontSize: 11, color: T.muted }}>Total: {(v.visitors || []).length} visitor(s)</div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: T.muted }}>
                          <div>👤 Advisor: {v.visit_advisor || '—'}</div>
                          {v.visit_purpose && <div style={{ fontSize: 11, color: T.subtle, fontStyle: 'italic' }}>{v.visit_purpose.slice(0, 35)}{v.visit_purpose.length > 35 ? '…' : ''}</div>}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 11 }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            {photosArr.length > 0 && (
                              <span style={{ background: '#F1F5F9', color: T.text, border: `1px solid ${T.border}`, borderRadius: 12, padding: '2px 8px', fontWeight: 700 }}>
                                📸 {photosArr.length} photo{photosArr.length > 1 ? 's' : ''}
                              </span>
                            )}
                            {v.review_points ? (
                              <span style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', borderRadius: 12, padding: '2px 8px', fontWeight: 700 }}>
                                📝 Reviewed
                              </span>
                            ) : (
                              <span style={{ color: T.subtle }}>No review yet</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px' }}><StatusBadge status={v.status} /></td>
                        <td style={{ padding: '12px 14px' }}>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedModalId(v.id); }}
                            style={{ background: T.navy, color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                            View Details & Photos →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* View Mode 2: BY INDIVIDUAL VISITOR */}
        {viewMode === 'visitors' && (
          <div style={{ background: 'white', border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '12px 16px', background: T.bg, borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.muted, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Showing {filteredVisitorRecords.length} individual visitor record{filteredVisitorRecords.length !== 1 ? 's' : ''}</span>
              <span style={{ fontSize: 11, color: T.muted }}>Click any record to open visit details</span>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.muted }}>Loading visitor records…</div>
            ) : filteredVisitorRecords.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.muted, fontSize: 14 }}>
                No individual visitor records found.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: T.navy }}>
                    {['Visitor Name', 'Designation', 'Company', 'Visit Date', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'white', fontSize: 11, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitorRecords.map((r, i) => (
                    <tr
                      key={i}
                      onClick={() => setSelectedModalId(r.visit_id)}
                      style={{
                        background: i % 2 === 0 ? 'white' : T.bg,
                        borderTop: `1px solid ${T.border}`,
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F5F3FF'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : T.bg}
                    >
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: T.text }}>{r.title} {r.name}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: T.muted }}>{r.designation || '—'}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: T.text, fontWeight: 600 }}>{r.visitor_company || r.company_name || '—'}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12 }}>📅 {r.visit_date}</td>
                      <td style={{ padding: '10px 14px' }}><StatusBadge status={r.status} /></td>
                      <td style={{ padding: '10px 14px' }}>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedModalId(r.visit_id); }}
                          style={{ background: T.navy, color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          View Details & Photos →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Modal for Visit Details, Review & Photos */}
        {selectedModalId && (
          <VisitDetailModal
            visitId={selectedModalId}
            onClose={() => setSelectedModalId(null)}
            onUpdated={loadData}
          />
        )}
      </div>
    </div>
  );
}


