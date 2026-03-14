const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}
export function setToken(token: string): void {
  localStorage.setItem('auth_token', token)
}
export function removeToken(): void {
  localStorage.removeItem('auth_token')
}

export interface User {
  id: string
  username: string
  fullName?: string
  email: string
  avatarUrl?: string
  trustLevel?: string
  badgeLevel?: string
  trustScore?: number
  totalReviews?: number
  helpfulVotes?: number
  followersCount?: number
  followingCount?: number
  createdAt?: string
  role?: string
}

async function req(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API}/api${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Hata olustu' }))
    throw new ApiError(res.status, err.message ?? 'Hata olustu')
  }
  return res.json()
}

export const auth = {
  me: () => req('/users/me'),
  login: (body: { identifier: string; password: string }) =>
    req('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: { email: string; username: string; password: string; fullName?: string }) =>
    req('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
}
