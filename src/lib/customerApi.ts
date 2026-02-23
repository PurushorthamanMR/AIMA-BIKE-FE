import { apiGet, apiPost, ApiResponse } from './api'

/**
 * Backend Customer model field names:
 * name, address, province, district, occupation, dateOfBirth, religion,
 * contactNumber, whatsappNumber, nic, modelId, chassisNumber, motorNumber,
 * colorOfVehicle, dateOfPurchase, loyalityCardNo, dateOfDelivery,
 * sellingAmount, registrationFees, advancePaymentAmount, advancePaymentDate,
 * balancePaymentAmount, balancePaymentDate, paymentId
 */

export interface SaveCustomerRequest {
  paymentOption: 'lease' | 'cash'
  name: string
  address: string
  province: string
  district: string
  occupation: string
  dateOfBirth?: string
  religion: string
  contactNumber?: string | number
  whatsappNumber?: string | number
  nic: string
  modelId: number
  chassisNumber: string
  motorNumber: string
  colorOfVehicle: string
  dateOfPurchase?: string
  loyalityCardNo?: string | number
  dateOfDelivery?: string
  sellingAmount?: number
  registrationFees?: number
  advancePaymentAmount?: number
  advancePaymentDate?: string
  balancePaymentAmount?: number
  balancePaymentDate?: string
  paymentId: number
  cashData?: {
    copyOfNic?: string
    photographOne?: string
    photographTwo?: string
    paymentReceipt?: string
    mta2?: string
    slip?: string
    chequeNumber?: string | number
  }
  leaseData?: {
    companyName?: string
    purchaseOrderNumber?: string | number
    copyOfNic?: string
    photographOne?: string
    photographTwo?: string
    paymentReceipt?: string
    mta2?: string
    mta3?: string
    chequeNumber?: string | number
  }
}

export interface SaveCustomerResponse {
  customerDto: { id: number; [key: string]: unknown }
  leaseDto?: unknown
  cashDto?: unknown
}

export async function saveCustomerWithPaymentOption(
  data: SaveCustomerRequest
): Promise<{ success: boolean; error?: string }> {
  const res: ApiResponse<SaveCustomerResponse> = await apiPost<SaveCustomerResponse>(
    '/customer/saveWithPaymentOption',
    data
  )
  if (res.status && res.responseDto) {
    return { success: true }
  }
  return { success: false, error: res.errorDescription || 'Failed to save customer' }
}

export interface CustomerDto {
  id: number
  name: string
  address?: string
  province?: string
  district?: string
  occupation?: string
  dateOfBirth?: string
  religion?: string
  chassisNumber?: string
  colorOfVehicle?: string
  contactNumber?: number
  whatsappNumber?: number
  nic?: string
  modelId?: number
  motorNumber?: string
  dateOfPurchase?: string
  dateOfDelivery?: string
  sellingAmount?: number
  registrationFees?: number
  advancePaymentAmount?: number
  advancePaymentDate?: string
  balancePaymentAmount?: number
  balancePaymentDate?: string
  paymentId?: number
  status?: string
  loyalityCardNo?: number
  modelDto?: { id: number; name: string }
  paymentDto?: { id: number; name: string; isActive?: boolean }
  cashData?: { copyOfNic?: string; photographOne?: string; photographTwo?: string; paymentReceipt?: string; mta2?: string; slip?: string; chequeNumber?: number }
  leaseData?: { companyName?: string; purchaseOrderNumber?: number; copyOfNic?: string; photographOne?: string; photographTwo?: string; paymentReceipt?: string; mta2?: string; mta3?: string; chequeNumber?: number }
}

export interface CustomerPageResponse {
  content: CustomerDto[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

export async function getCustomersPage(
  pageNumber = 1,
  pageSize = 100,
  status = true
): Promise<CustomerPageResponse | null> {
  const res: ApiResponse<CustomerPageResponse> = await apiGet<CustomerPageResponse>(
    `/customer/getAllPage?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${status}`
  )
  if (res.status && res.responseDto) return res.responseDto
  return null
}
