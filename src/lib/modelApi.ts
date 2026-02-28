import { apiGet, apiPost, apiPut, ApiResponse } from './api'

export interface ModelDto {
  id: number
  name: string
  categoryId: number
  imageUrl?: string
  isActive?: boolean
}

export interface ModelPageResponse {
  content: ModelDto[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

/** Get models with pagination (returns full page response) */
export async function getModelsPage(
  pageNumber = 1,
  pageSize = 10,
  status?: boolean,
  categoryId?: number,
  name?: string
): Promise<ModelPageResponse> {
  let url = `/model/getAllPage?pageNumber=${pageNumber}&pageSize=${pageSize}`
  if (status !== undefined && status !== null) url += `&status=${status}`
  if (categoryId != null) url += `&categoryId=${categoryId}`
  if (name != null && name.trim() !== '') url += `&name=${encodeURIComponent(name.trim())}`
  const res: ApiResponse<ModelPageResponse> = await apiGet<ModelPageResponse>(url)
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

export async function getModelsByName(name: string): Promise<ModelDto[]> {
  const trimmed = (name ?? '').trim()
  const params = new URLSearchParams()
  if (trimmed) params.set('name', trimmed)
  const res: ApiResponse<ModelDto[]> = await apiGet<ModelDto[]>(`/model/getByName?${params.toString()}`)
  if (res.status && Array.isArray(res.responseDto)) return res.responseDto
  return []
}

export async function getModelsByCategory(categoryId: number): Promise<ModelDto[]> {
  const res = await apiGet<ModelDto[]>(
    `/model/getByCategory?categoryId=${categoryId}`
  )
  if (res.status && res.responseDto) {
    const data = res.responseDto
    return Array.isArray(data) ? data : []
  }
  return []
}

export async function saveModel(data: {
  categoryId: number
  name: string
  imageUrl?: string
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<ModelDto>('/model/save', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to save model' }
}

export async function updateModel(data: {
  id: number
  categoryId?: number
  name?: string
  imageUrl?: string
  isActive?: boolean
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<ModelDto>('/model/update', data)
  if (res.status && res.responseDto) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to update model' }
}

export async function updateModelStatus(modelId: number, status: boolean): Promise<{ success: boolean; error?: string }> {
  const res = await apiPut<ModelDto>(`/model/updateStatus?modelId=${modelId}&status=${status}`)
  if (res.status) return { success: true }
  return { success: false, error: res.errorDescription || 'Failed to update status' }
}
