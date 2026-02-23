import { apiPost, setToken, ApiResponse } from './api'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const res: ApiResponse<LoginResponse> = await apiPost<LoginResponse>('/user/login', {
    username,
    password,
  })
  if (res.status && res.responseDto?.accessToken) {
    setToken(res.responseDto.accessToken)
    return { success: true }
  }
  return { success: false, error: res.errorDescription || 'Login failed' }
}
