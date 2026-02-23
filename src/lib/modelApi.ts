import { apiGet, apiPost, ApiResponse } from './api'

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

export async function getModelsPage(
  pageNumber = 1,
  pageSize = 100,
  status = true,
  categoryId?: number
): Promise<ModelDto[]> {
  let url = `/model/getAllPage?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${status}`
  if (categoryId != null) url += `&categoryId=${categoryId}`
  const res: ApiResponse<ModelPageResponse> = await apiGet<ModelPageResponse>(url)
  if (res.status && res.responseDto?.content) {
    return res.responseDto.content
  }
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
