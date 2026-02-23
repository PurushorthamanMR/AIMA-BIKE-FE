import { apiGet, apiPost, apiPut, ApiResponse } from './api'

export interface PaymentDto {
  id: number
  name: string
  isActive?: boolean
}

export async function getPaymentByName(name: string): Promise<PaymentDto | null> {
  const res: ApiResponse<PaymentDto | PaymentDto[]> = await apiGet<PaymentDto | PaymentDto[]>(
    `/payment/getByName?name=${encodeURIComponent(name)}`
  )
  if (res.status && res.responseDto) {
    const data = res.responseDto
    const list = Array.isArray(data) ? data : [data]
    return list.length > 0 ? list[0] : null
  }
  return null
}

/** Fetch all payments from backend (for dropdown) */
export async function getAllPayments(): Promise<PaymentDto[]> {
  const res = await apiGet<PaymentDto[]>(`/payment/getByName?name=`)
  if (res.status && res.responseDto) {
    const data = res.responseDto
    return Array.isArray(data) ? data : []
  }
  return []
}

export async function savePayment(body: { name: string; isActive?: boolean }): Promise<{ success: boolean; data?: PaymentDto; error?: string }> {
  const res = await apiPost<PaymentDto>('/payment/save', body)
  if (res.status && res.responseDto) return { success: true, data: res.responseDto }
  return { success: false, error: res.errorDescription ?? 'Failed to save payment' }
}

export async function updatePayment(body: { id: number; name?: string; isActive?: boolean }): Promise<{ success: boolean; data?: PaymentDto; error?: string }> {
  const res = await apiPost<PaymentDto>('/payment/update', body)
  if (res.status && res.responseDto) return { success: true, data: res.responseDto }
  return { success: false, error: res.errorDescription ?? 'Failed to update payment' }
}

export async function updatePaymentStatus(paymentId: number, status: boolean): Promise<{ success: boolean; error?: string }> {
  const res = await apiPut<PaymentDto>(`/payment/updateStatus?paymentId=${paymentId}&status=${status}`)
  if (res.status) return { success: true }
  return { success: false, error: res.errorDescription ?? 'Failed to update status' }
}

const PAYMENT_NAME_MAP: Record<string, string> = {
  cash: 'Cash',
  bank_draft: 'Bank Draft',
  cheque: 'Cheque',
  online: 'Online',
  credit_card: 'Credit Card',
}

export function getPaymentNameForType(type: string): string {
  return PAYMENT_NAME_MAP[type] || type
}
