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

/** Forgot password - POST /auth/forgot-password with user emailAddress */
export async function forgotPassword(emailAddress: string): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<{ message?: string }>('/auth/forgot-password', { emailAddress })
  if (res.status) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to send reset code' }
}

/** Reset password - POST /auth/reset-password with token and newPassword */
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<{ message?: string }>('/auth/reset-password', { token, newPassword })
  if (res.status) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to reset password' }
}
