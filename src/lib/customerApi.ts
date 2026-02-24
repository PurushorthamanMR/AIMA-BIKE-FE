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
  cashData?: { id?: number; customerId?: number; copyOfNic?: string; photographOne?: string; photographTwo?: string; paymentReceipt?: string; mta2?: string; slip?: string; chequeNumber?: number }
  leaseData?: { id?: number; customerId?: number; companyName?: string; purchaseOrderNumber?: number; copyOfNic?: string; photographOne?: string; photographTwo?: string; paymentReceipt?: string; mta2?: string; mta3?: string; chequeNumber?: number }
}

export interface UpdateCustomerRequest {
  id: number
  name?: string
  address?: string
  province?: string
  district?: string
  occupation?: string
  religion?: string
  nic?: string
  chassisNumber?: string
  motorNumber?: string
  colorOfVehicle?: string
  modelId?: number
  paymentId?: number
  dateOfBirth?: string
  contactNumber?: number
  whatsappNumber?: number
  dateOfPurchase?: string
  loyalityCardNo?: number
  dateOfDelivery?: string
  sellingAmount?: number
  registrationFees?: number
  advancePaymentAmount?: number
  advancePaymentDate?: string
  balancePaymentAmount?: number
  balancePaymentDate?: string
  isActive?: boolean
}

export async function updateCustomer(data: UpdateCustomerRequest): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<CustomerDto>('/customer/update', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to update customer' }
}

export interface UpdateCashRequest {
  id: number
  customerId: number
  copyOfNic?: string
  photographOne?: string
  photographTwo?: string
  paymentReceipt?: string
  mta2?: string
  slip?: string
  chequeNumber?: number
  isActive?: boolean
}

export async function updateCash(data: UpdateCashRequest): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<unknown>('/cash/update', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to update cash' }
}

export interface UpdateLeaseRequest {
  id: number
  customerId: number
  companyName?: string
  purchaseOrderNumber?: number
  copyOfNic?: string
  photographOne?: string
  photographTwo?: string
  paymentReceipt?: string
  mta2?: string
  mta3?: string
  chequeNumber?: number
  isActive?: boolean
}

export async function updateLease(data: UpdateLeaseRequest): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<unknown>('/lease/update', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to update lease' }
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

/**
 * GET /customer/getByCustomerStatus?status=pending|complete|return&pageNumber=1&pageSize=10&isActive=true
 */
export interface CustomerStatusPageResponse {
  content: CustomerDto[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

export async function getCustomersByStatus(
  status: string,
  pageNumber = 1,
  pageSize = 10,
  isActive = true
): Promise<CustomerStatusPageResponse> {
  const params = new URLSearchParams({
    status,
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
    isActive: String(isActive),
  })
  const res = await apiGet<CustomerStatusPageResponse>(
    `/customer/getByCustomerStatus?${params.toString()}`
  )
  if (res.status && res.responseDto) {
    const data = res.responseDto as CustomerStatusPageResponse
    return {
      content: data.content ?? [],
      totalElements: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      pageNumber: data.pageNumber ?? pageNumber,
      pageSize: data.pageSize ?? pageSize,
    }
  }
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    pageNumber: 1,
    pageSize,
  }
}

/**
 * POST /customer/approved?customerId=1
 */
export async function approveCustomer(customerId: number): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<CustomerDto>(`/customer/approved?customerId=${customerId}`, {})
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to approve customer' }
}

/**
 * POST /customer/return?customerId=1
 */
export async function returnCustomer(customerId: number): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<CustomerDto>(`/customer/return?customerId=${customerId}`, {})
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to return customer' }
}
