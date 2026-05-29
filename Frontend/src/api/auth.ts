import type { UserProfile } from '@/types/workspace'

const TOKEN_KEY = 'govdoc.token'
const USERNAME_KEY = 'govdoc.username'

const getApiBase = () => {
  return import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8000/api/v1'
}

function getAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function loginApi(username: string, password: string): Promise<string> {
  const response = await fetch(`${getApiBase()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Login failed')
  }

  const data = (await response.json()) as { access_token: string; username: string }
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(USERNAME_KEY, data.username)
  return data.username
}

export async function registerApi(username: string, password: string): Promise<string> {
  const response = await fetch(`${getApiBase()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Registration failed')
  }

  const data = (await response.json()) as { access_token: string; username: string }
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(USERNAME_KEY, data.username)
  return data.username
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem('govdoc.uploadedPdf')
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await fetch(`${getApiBase()}/auth/me`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error(`Failed to fetch profile (${response.status})`)
  return (await response.json()) as UserProfile
}

export async function updateUserProfile(
  data: Partial<Pick<UserProfile, 'full_name' | 'email' | 'bio' | 'avatar_color'>>,
): Promise<UserProfile> {
  const response = await fetch(`${getApiBase()}/auth/me`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`Failed to update profile (${response.status})`)
  return (await response.json()) as UserProfile
}
