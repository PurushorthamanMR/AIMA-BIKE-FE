import { apiGet, apiPost } from './api'

export interface StockDto {
  id: number
  noteId?: number
  modelId: number
  itemCode?: string
  chassisNumber?: string
  motorNumber?: string
  color?: string
  quantity?: number
  sellingAmount?: number
  modelDto?: { id: number; name: string; imageUrl?: string; categoryDto?: { id: number; name: string } }
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

export async function getStockById(id: number): Promise<StockDto | null> {
  const result = await getStocksPage(1, 500)
  return result.content.find((s) => s.id === id) ?? null
}

export async function getStocksPage(
  pageNumber = 1,
  pageSize = 100,
  searchParams?: { noteId?: number; modelId?: number; color?: string; itemCode?: string }
): Promise<StockPageResponse> {
  let url = `/stock/getAllPage?pageNumber=${pageNumber}&pageSize=${pageSize}`
  if (searchParams?.noteId != null) url += `&noteId=${searchParams.noteId}`
  if (searchParams?.modelId != null) url += `&modelId=${searchParams.modelId}`
  if (searchParams?.color) url += `&color=${encodeURIComponent(searchParams.color)}`
  if (searchParams?.itemCode) url += `&itemCode=${encodeURIComponent(searchParams.itemCode)}`
  const res = await apiGet<StockPageResponse>(url)
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

export async function saveStock(data: {
  noteId: number
  modelId: number
  itemCode?: string
  chassisNumber?: string
  motorNumber?: string
  color?: string
  quantity?: number
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<StockDto>('/stock/save', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to save stock' }
}

export async function updateStock(data: {
  id: number
  noteId?: number
  modelId?: number
  itemCode?: string
  chassisNumber?: string
  motorNumber?: string
  color?: string
  quantity?: number
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<StockDto>('/stock/update', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to update stock' }
}
