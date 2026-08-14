const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function http(method, url, body) {
  const res = await fetch(BASE + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getAreas:              ()                               => http('GET',  '/areas'),
  createVisit:           (header, visitors, topAttendees) => http('POST', '/visits', { header, visitors, topAttendees }),
  updateVisit:           (id, header, visitors, topAttendees) => http('PUT', `/visits/${id}`, { header, visitors, topAttendees }),
  finalizeVisit:         (payload)                        => http('POST', '/visits/finalize', payload),
  getVisit:              (id)                             => http('GET',  `/visits/${id}`),
  getVisits:             ()                               => http('GET',  '/visits'),
  generateAgenda:        (id, rows, startTime)            => http('POST', `/visits/${id}/agenda`, { rows, startTime }),
  sendAgendaEmail:       (id, recipients)                 => http('POST', `/visits/${id}/send-email`, { recipients }),
  getFullVisit:          (id)                             => http('GET',  `/visits/${id}/full`),
  searchVisitors:        (field = 'all', q = '')          => http('GET',  `/visitors/search?field=${field}&q=${encodeURIComponent(q || '')}`),
  getVisitorSuggestions: (q)                              => http('GET',  `/visitors/suggestions?q=${encodeURIComponent(q || '')}`),
  lookupVisitor:         (name)                           => http('GET',  `/visitors/lookup?name=${encodeURIComponent(name || '')}`),
  completeVisit:         (id, reviewPoints, photos, status = 'Completed') => 
    http('PUT', `/visits/${id}/complete`, { reviewPoints, photos, status }),
  submitFeedback:        (data)                           => http('POST', '/feedback', data),
  getFeedback:           ()                               => http('GET',  '/feedback'),
  getDashboard:          ()                               => http('GET',  '/dashboard/stats'),
};
