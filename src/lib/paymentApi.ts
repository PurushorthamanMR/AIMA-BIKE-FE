import { apiGet, ApiResponse } from './api'

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
