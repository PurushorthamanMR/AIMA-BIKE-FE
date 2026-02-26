import { apiGet, apiPost, apiPut, ApiResponse } from './api'

export interface SettingDto {
  id: number
  name: string
  isActiveAdmin?: boolean
  isActiveManager?: boolean
}

export interface SettingsPageResponse {
  content: SettingDto[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

/** Get settings with pagination */
export async function getSettingsAllPagination(
  pageNumber = 1,
  pageSize = 10,
  params?: { name?: string; isActiveAdmin?: boolean; isActiveManager?: boolean }
): Promise<SettingsPageResponse> {
  let url = `/settings/getAllPagination?pageNumber=${pageNumber}&pageSize=${pageSize}`
  if (params?.name) url += `&name=${encodeURIComponent(params.name)}`
  if (params?.isActiveAdmin !== undefined) url += `&isActiveAdmin=${params.isActiveAdmin}`
  if (params?.isActiveManager !== undefined) url += `&isActiveManager=${params.isActiveManager}`
  const res = await apiGet<SettingsPageResponse>(url)
  if (res.status && res.responseDto) {
    const d = res.responseDto
    return {
      content: d.content ?? [],
      totalElements: d.totalElements ?? 0,
      totalPages: d.totalPages ?? 0,
      pageNumber: d.pageNumber ?? pageNumber,
      pageSize: d.pageSize ?? pageSize,
    }
  }
  return { content: [], totalElements: 0, totalPages: 0, pageNumber, pageSize }
}

/** Get settings by name */
export async function getSettingsByName(name: string): Promise<SettingDto[]> {
  const res = await apiGet<SettingDto[]>(`/settings/getByName?name=${encodeURIComponent(name)}`)
  if (res.status && res.responseDto) {
    const data = res.responseDto
    return Array.isArray(data) ? data : []
  }
  return []
}

export async function saveSetting(body: {
  name: string
  isActiveAdmin?: boolean
  isActiveManager?: boolean
}): Promise<{ success: boolean; data?: SettingDto; error?: string }> {
  const res = await apiPost<SettingDto>('/settings/save', body)
  if (res.status && res.responseDto) return { success: true, data: res.responseDto }
  return { success: false, error: res.errorDescription ?? 'Failed to save setting' }
}

export async function updateSetting(body: {
  id: number
  name?: string
  isActiveAdmin?: boolean
  isActiveManager?: boolean
}): Promise<{ success: boolean; data?: SettingDto; error?: string }> {
  const res = await apiPost<SettingDto>('/settings/update', body)
  if (res.status && res.responseDto) return { success: true, data: res.responseDto }
  return { success: false, error: res.errorDescription ?? 'Failed to update setting' }
}

export async function updateAdminStatus(settingsId: number, status: boolean): Promise<{ success: boolean; error?: string }> {
  const res = await apiPut<SettingDto>(`/settings/updateAdminStatus?settingsId=${settingsId}&status=${status}`)
  if (res.status) return { success: true }
  return { success: false, error: res.errorDescription ?? 'Failed to update admin status' }
}

export async function updateManagerStatus(settingsId: number, status: boolean): Promise<{ success: boolean; error?: string }> {
  const res = await apiPut<SettingDto>(`/settings/updateManagerStatus?settingsId=${settingsId}&status=${status}`)
  if (res.status) return { success: true }
  return { success: false, error: res.errorDescription ?? 'Failed to update manager status' }
}
