const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://100.78.107.25:3001/api';

export function getToken() {
  return localStorage.getItem('bma_token');
}

export function setToken(token: string) {
  localStorage.setItem('bma_token', token);
}

export function clearToken() {
  localStorage.removeItem('bma_token');
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

export async function login(email: string, password: string) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data?.data;
}
