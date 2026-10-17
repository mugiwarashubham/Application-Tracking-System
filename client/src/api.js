async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  list: (params) => request('/candidates?' + new URLSearchParams(params)),
  meta: () => request('/candidates/meta'),
  create: (body) => request('/candidates', { method: 'POST', body }),
  update: (id, body) => request(`/candidates/${id}`, { method: 'PUT', body }),
  move: (id, stage) => request(`/candidates/${id}/stage`, { method: 'PATCH', body: { stage } }),
  remove: (id) => request(`/candidates/${id}`, { method: 'DELETE' }),
  dashboard: () => request('/dashboard'),
};
