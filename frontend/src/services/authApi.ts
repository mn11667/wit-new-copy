import api from './apiClient';

let accessToken: string | null = null;

function setAuthHeader(token: string | null) {
  accessToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function getAccessToken() {
  return accessToken;
}

function persistAccessToken(token: string | null) {
  try {
    if (!token) {
      localStorage.removeItem('accessToken');
    } else {
      localStorage.setItem('accessToken', token);
    }
  } catch {
    // ignore storage errors (e.g., SSR or disabled storage)
  }
}

export function loadStoredAccessToken() {
  try {
    const stored = localStorage.getItem('accessToken');
    if (stored) {
      setAuthHeader(stored);
      return stored;
    }
  } catch {
    // ignore
  }
  return null;
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
  isActive?: boolean;
  subscription?: {
    status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE';
    startDate?: string | null;
    endDate: string | null;
    plan?: {
      id?: string;
      tier: 'FREE' | 'BASIC' | 'PREMIUM';
    } | null;
  } | null;
  lastLoginDate?: string | null;
  phone?: string | null;
  school?: string | null;
  preparingFor?: string | null;
  avatarUrl?: string | null;
};

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  school?: string;
  preparingFor?: string;
  avatarUrl?: string;
}) {
  const res = await api.post<{ user: User; tokens?: { accessToken: string; refreshToken: string } }>(
    '/api/auth/register',
    payload,
  );
  if (res.data.tokens?.accessToken) {
    setAuthHeader(res.data.tokens.accessToken);
    persistAccessToken(res.data.tokens.accessToken);
  }
  return res.data.user;
}

export async function login(payload: { email: string; password: string }) {
  const res = await api.post<{ user: User; tokens?: { accessToken: string; refreshToken: string } }>(
    '/api/auth/login',
    payload,
  );
  if (res.data.tokens?.accessToken) {
    setAuthHeader(res.data.tokens.accessToken);
    persistAccessToken(res.data.tokens.accessToken);
  }
  return res.data.user;
}

export async function logout() {
  await api.post('/api/auth/logout');
  setAuthHeader(null);
  persistAccessToken(null);
}

export async function refresh() {
  const res = await api.post<{ user: User; tokens?: { accessToken: string; refreshToken: string } }>('/api/auth/refresh');
  if (res.data.tokens?.accessToken) {
    setAuthHeader(res.data.tokens.accessToken);
    persistAccessToken(res.data.tokens.accessToken);
  }
  return res.data.user;
}

export async function me() {
  const res = await api.get<{ user: User }>('/api/auth/me');
  return res.data.user;
}

export async function forgotPassword(email: string) {
  const res = await api.post('/api/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(payload: { token: string; newPassword: string }) {
  const res = await api.post('/api/auth/reset-password', payload);
  return res.data;
}

export async function changePassword(payload: { oldPassword: string; newPassword: string }) {
  const res = await api.post('/api/auth/change-password', payload);
  return res.data;
}

export async function loginWithGoogle(token: string) {
  const res = await api.post<{ user: User; tokens?: { accessToken: string; refreshToken: string } }>(
    '/api/auth/google',
    { token },
  );
  if (res.data.tokens?.accessToken) {
    setAuthHeader(res.data.tokens.accessToken);
    persistAccessToken(res.data.tokens.accessToken);
  }
  return res.data.user;
}
