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
  getAreas:        ()                      => http('GET',  '/areas'),
  createVisit:     (header, visitors)      => http('POST', '/visits', { header, visitors }),
  updateVisit:     (id, header, visitors)  => http('PUT',  `/visits/${id}`, { header, visitors }),
  getVisit:        (id)                    => http('GET',  `/visits/${id}`),
  generateAgenda:  (id, rows, startTime)   => http('POST', `/visits/${id}/agenda`, { rows, startTime }),
  getFullVisit:    (id)                    => http('GET',  `/visits/${id}/full`),
  searchVisitors:        (field, q)              => http('GET',  `/visitors/search?field=${field}&q=${encodeURIComponent(q)}`),
  getVisitorSuggestions: (q)                     => http('GET',  `/visitors/suggestions?q=${encodeURIComponent(q)}`),
  lookupVisitor:         (name)                  => http('GET',  `/visitors/lookup?name=${encodeURIComponent(name)}`),
  completeVisit:         (id, reviewPoints, photos, status = 'Completed') => 
    http('PUT', `/visits/${id}/complete`, { reviewPoints, photos, status }),
  submitFeedback:        (data)                  => http('POST', '/feedback', data),
  getFeedback:     ()                      => http('GET',  '/feedback'),
  getDashboard:    ()                      => http('GET',  '/dashboard/stats'),
};

