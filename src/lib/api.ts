/**
 * API client for AIMA Bike Backend
 * Base URL: VITE_API_URL or http://localhost:8081
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081'

export interface ApiResponse<T> {
  status: boolean
  errorCode: number
  errorDescription: string | null
  responseDto: T | null
}

export function getToken(): string | null {
  return localStorage.getItem('aima_pos_token')
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('aima_pos_token', token)
  else localStorage.removeItem('aima_pos_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers })
  const data: ApiResponse<T> = await res.json().catch(() => ({
    status: false,
    errorCode: res.status,
    errorDescription: res.statusText || 'Request failed',
    responseDto: null,
  }))

  if (!res.ok && !data.errorDescription) {
    data.errorDescription = data.errorDescription || `HTTP ${res.status}`
    data.status = false
  }
  return data
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'GET' })
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export async function apiPut<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined })
}
