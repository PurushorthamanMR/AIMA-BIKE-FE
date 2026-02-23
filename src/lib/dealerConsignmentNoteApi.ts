import { apiGet, apiPost } from './api'

export interface DealerConsignmentNoteItemDto {
  id?: number
  noteId?: number
  modelId: number
  stockId?: number
  itemCode?: string
  chassisNumber?: string
  motorNumber?: string
  color?: string
  quantity?: number
  modelDto?: { id: number; name: string; categoryDto?: { id: number; name: string } }
}

export interface DealerConsignmentNoteDto {
  id: number
  dealerCode: string
  dealerName: string
  address?: string
  consignmentNoteNo: string
  date?: string
  deliveryMode?: string
  vehicleNo?: string
  references?: string
  contactPerson?: string
  isActive?: boolean
  items?: DealerConsignmentNoteItemDto[]
}

export interface DealerConsignmentNotePageResponse {
  content: DealerConsignmentNoteDto[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

export async function saveDealerConsignmentNote(data: {
  dealerCode: string
  dealerName: string
  address?: string
  consignmentNoteNo: string
  date?: string
  deliveryMode?: string
  vehicleNo?: string
  references?: string
  contactPerson?: string
  items: Array<{
    modelId: number
    stockId?: number
    itemCode?: string
    chassisNumber?: string
    motorNumber?: string
    color?: string
    quantity?: number
  }>
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<DealerConsignmentNoteDto>('/dealerConsignmentNote/save', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to save dealer consignment note' }
}

export async function getDealerConsignmentNotesPage(
  pageNumber = 1,
  pageSize = 50,
  status = true,
  searchParams?: { dealerCode?: string; dealerName?: string; consignmentNoteNo?: string }
): Promise<DealerConsignmentNotePageResponse | null> {
  let url = `/dealerConsignmentNote/getAllPage?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${status}`
  if (searchParams?.dealerCode) url += `&dealerCode=${encodeURIComponent(searchParams.dealerCode)}`
  if (searchParams?.dealerName) url += `&dealerName=${encodeURIComponent(searchParams.dealerName)}`
  if (searchParams?.consignmentNoteNo) url += `&consignmentNoteNo=${encodeURIComponent(searchParams.consignmentNoteNo)}`
  const res = await apiGet<DealerConsignmentNotePageResponse>(url)
  if (res.status && res.responseDto) return res.responseDto
  return null
}
