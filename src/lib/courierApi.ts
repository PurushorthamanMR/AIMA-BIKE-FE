import { apiGet, apiPost } from './api'

export interface CourierDto {
  id: number
  categoryId: number
  customerId: number
  name: string
  contactNumber?: number
  address: string
  sentDate?: string
  receivedDate?: string
  receivername?: string
  nic?: string
  isActive?: boolean
  categoryDto?: { id: number; name: string; isActive?: boolean }
  customerDto?: {
    id: number
    name: string
    address?: string
    modelId?: number
    paymentId?: number
    modelDto?: { id: number; name: string }
    paymentDto?: { id: number; name: string }
  }
}

export async function saveCourier(data: {
  categoryId: number
  customerId: number
  name: string
  contactNumber?: number
  address: string
  sentDate?: string
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<CourierDto>('/courier/save', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to save courier' }
}

/** Get courier by ID */
export async function getCourierById(id: number): Promise<CourierDto | null> {
  const res = await apiGet<CourierDto>(`/courier/getById?id=${id}`)
  if (res.status && res.responseDto) return res.responseDto
  return null
}

/** Update courier - POST /courier/update */
export async function updateCourier(data: {
  id: number
  name?: string
  address?: string
  categoryId?: number
  customerId?: number
  contactNumber?: number
  sentDate?: string
  receivedDate?: string
  receivername?: string
  nic?: string
  isActive?: boolean
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<CourierDto>('/courier/update', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to update courier' }
}

/** Mark courier as received - POST /courier/received */
export async function markCourierReceived(data: {
  courierId: number
  receivedDate?: string
  receivername?: string
  nic?: string
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<CourierDto>('/courier/received', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to mark courier as received' }
}

/** Get all couriers - uses getByName with empty to fetch all */
export async function getCouriers(): Promise<CourierDto[]> {
  const res = await apiGet<CourierDto[]>(`/courier/getByName?name=`)
  if (res.status && res.responseDto) {
    const data = res.responseDto
    return Array.isArray(data) ? data : []
  }
  return []
}

export async function getCouriersByCategoryId(categoryId: number): Promise<CourierDto[]> {
  const res = await apiGet<CourierDto[]>(`/courier/getByCategoryId?categoryId=${categoryId}`)
  if (res.status && res.responseDto) {
    const data = res.responseDto
    return Array.isArray(data) ? data : []
  }
  return []
}

export async function getCouriersByCustomerId(customerId: number): Promise<CourierDto[]> {
  const res = await apiGet<CourierDto[]>(`/courier/getByCustomerId?customerId=${customerId}`)
  if (res.status && res.responseDto) {
    const data = res.responseDto
    return Array.isArray(data) ? data : []
  }
  return []
}
