import { apiGet, apiPost } from './api'

export interface StockDto {
  id: number
  modelId: number
  name: string
  color: string
  sellingAmount?: number
  quantity?: number
  imageUrl?: string
  isActive?: boolean
}

export interface StockPageResponse {
  content: StockDto[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

export async function getStocksByModel(modelId: number): Promise<StockDto[]> {
  const res = await apiGet<StockDto[] | StockPageResponse>(
    `/stock/getByModel?modelId=${modelId}`
  )
  if (res.status && res.responseDto) {
    const data = res.responseDto as StockDto[] | StockPageResponse
    return Array.isArray(data) ? data : ((data as StockPageResponse)?.content ?? [])
  }
  return []
}

export async function getStocksPage(
  pageNumber = 1,
  pageSize = 100,
  status = true,
  modelId?: number
): Promise<StockDto[]> {
  let url = `/stock/getAllPage?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${status}`
  if (modelId != null) url += `&modelId=${modelId}`
  const res = await apiGet<StockDto[] | StockPageResponse>(url)
  if (res.status && res.responseDto) {
    const data = res.responseDto as StockPageResponse
    return data?.content ?? []
  }
  return []
}

export async function saveStock(data: {
  modelId: number
  name: string
  color: string
  itemCode?: string
  sellingAmount?: number
  quantity?: number
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<StockDto>('/stock/save', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to save stock' }
}

export async function updateStock(data: {
  id: number
  modelId?: number
  name?: string
  color?: string
  itemCode?: string
  sellingAmount?: number
  quantity?: number
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<StockDto>('/stock/update', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to update stock' }
}
