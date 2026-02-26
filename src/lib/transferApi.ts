import { apiGet, apiPost } from './api'

export interface TransferListLineDto {
  id?: number
  transferId?: number
  stockId: number
  quantity: number
  stockDto?: {
    id: number
    modelId: number
    name: string
    color?: string
    quantity?: number
    modelDto?: { id: number; name: string; categoryDto?: { id: number; name: string } }
  }
}

export interface TransferDto {
  id: number
  userId: number
  companyName: string
  contactNumber?: number
  address: string
  deliveryDetails: string
  nic?: string | null
  isActive?: boolean
  transferList?: TransferListLineDto[]
  userDto?: { id: number; firstName?: string; lastName?: string; emailAddress?: string }
}

export async function saveTransfer(data: {
  userId: number
  companyName: string
  address: string
  deliveryDetails: string
  nic?: string | null
  transferList: Array<{ stockId: number; quantity?: number }>
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<TransferDto>('/transfer/save', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to save transfer' }
}

export interface TransferPageResponse {
  content: TransferDto[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

/** Get transfers with pagination */
export async function getTransfersPage(
  pageNumber = 1,
  pageSize = 10,
  params?: { isActive?: boolean; companyName?: string; nic?: string }
): Promise<TransferPageResponse> {
  let url = `/transfer/getAllPage?pageNumber=${pageNumber}&pageSize=${pageSize}`
  if (params?.isActive !== undefined) url += `&isActive=${params.isActive}`
  if (params?.companyName) url += `&companyName=${encodeURIComponent(params.companyName)}`
  if (params?.nic) url += `&nic=${encodeURIComponent(params.nic)}`
  const res = await apiGet<TransferPageResponse>(url)
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

/** Update transfer - POST /transfer/update (header only: companyName, address, deliveryDetails, contactNumber, nic, userId) */
export async function updateTransfer(data: {
  id: number
  companyName?: string
  address?: string
  deliveryDetails?: string
  contactNumber?: number
  nic?: string | null
  userId?: number
  isActive?: boolean
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<TransferDto>('/transfer/update', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to update transfer' }
}

/** Get transfer by ID (transfer + transferList with stock, user) */
export async function getTransferById(id: number): Promise<TransferDto | null> {
  const res = await apiGet<TransferDto>(`/transfer/getById?id=${id}`)
  if (res.status && res.responseDto) return res.responseDto
  return null
}

/** Get all transfers - uses getByCompanyName with empty to fetch all */
export async function getTransfers(): Promise<TransferDto[]> {
  const res = await apiGet<TransferDto[]>(`/transfer/getByCompanyName?companyName=`)
  if (res.status && res.responseDto) {
    const data = res.responseDto
    return Array.isArray(data) ? data : []
  }
  return []
}

export async function getTransfersByUserId(userId: number): Promise<TransferDto[]> {
  const res = await apiGet<TransferDto[]>(`/transfer/getByUserId?userId=${userId}`)
  if (res.status && res.responseDto) {
    const data = res.responseDto
    return Array.isArray(data) ? data : []
  }
  return []
}

/** Get transfers by NIC (partial match) */
export async function getTransfersByNic(nic: string): Promise<TransferDto[]> {
  const res = await apiGet<TransferDto[]>(`/transfer/getByNic?nic=${encodeURIComponent(nic)}`)
  if (res.status && res.responseDto) {
    const data = res.responseDto
    return Array.isArray(data) ? data : []
  }
  return []
}
