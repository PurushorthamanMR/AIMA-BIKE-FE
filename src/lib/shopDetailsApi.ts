import { apiGet, apiPost, apiPut, ApiResponse } from './api'

export interface ShopDetailDto {
  id: number
  name: string
  logo?: string
  address?: string
  phoneNumber?: string
  isActive?: boolean
}

export async function getAllShopDetails(): Promise<ShopDetailDto[]> {
  const res: ApiResponse<ShopDetailDto[]> = await apiGet<ShopDetailDto[]>('/shopDetails/getAll')
  if (res.status && Array.isArray(res.responseDto)) return res.responseDto
  return []
}

export async function saveShopDetail(body: {
  name: string
  logo?: string
  address?: string
  phoneNumber?: string
  isActive?: boolean
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<ShopDetailDto>('/shopDetails/save', body)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription ?? 'Failed to save' }
}

export async function updateShopDetail(body: {
  id: number
  name?: string
  logo?: string
  address?: string
  phoneNumber?: string
  isActive?: boolean
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<ShopDetailDto>('/shopDetails/update', body)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription ?? 'Failed to update' }
}

export async function updateShopDetailStatus(shopId: number, status: boolean): Promise<{ success: boolean; error?: string }> {
  const res = await apiPut<ShopDetailDto>(`/shopDetails/updateStatus?shopId=${shopId}&status=${status}`)
  if (res.status) return { success: true }
  return { success: false, error: res.errorDescription ?? 'Failed to update status' }
}
