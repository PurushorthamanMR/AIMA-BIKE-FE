import { apiGet, apiPost } from './api'

export interface TransferDto {
  id: number
  stockId: number
  userId: number
  quantity?: number
  companyName: string
  contactNumber?: number
  address: string
  deliveryDetails: string
  isActive?: boolean
  stockDto?: {
    id: number
    modelId: number
    name: string
    color?: string
    quantity?: number
    modelDto?: { id: number; name: string; categoryDto?: { id: number; name: string } }
  }
  userDto?: { id: number; firstName?: string; lastName?: string; emailAddress?: string }
}

export async function saveTransfer(data: {
  stockId: number
  userId: number
  quantity?: number
  companyName: string
  contactNumber?: number
  address: string
  deliveryDetails: string
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<TransferDto>('/transfer/save', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to save transfer' }
}

/** Get all transfers - uses getByReceiverName with empty */
export async function getTransfers(): Promise<TransferDto[]> {
  const res = await apiGet<TransferDto[]>(`/transfer/getByReceiverName?receiverName=`)
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
