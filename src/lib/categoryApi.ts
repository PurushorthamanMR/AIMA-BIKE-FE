import { apiGet, apiPost, apiPut, ApiResponse } from './api'

export interface CategoryDto {
  id: number
  name: string
  isActive?: boolean
}

export interface CategoryPageResponse {
  content: CategoryDto[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

export async function getCategoriesPage(
  pageNumber = 1,
  pageSize = 100,
  status?: boolean
): Promise<CategoryDto[]> {
  const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) })
  if (status !== undefined) params.set('status', String(status))
  const res: ApiResponse<CategoryPageResponse> = await apiGet<CategoryPageResponse>(
    `/category/getAllPage?${params.toString()}`
  )
  if (res.status && res.responseDto?.content) {
    return res.responseDto.content
  }
  return []
}

export async function getCategoriesByName(name: string): Promise<CategoryDto[]> {
  const trimmed = (name ?? '').trim()
  const params = new URLSearchParams()
  if (trimmed) params.set('name', trimmed)
  const res: ApiResponse<CategoryDto[]> = await apiGet<CategoryDto[]>(`/category/getByName?${params.toString()}`)
  if (res.status && Array.isArray(res.responseDto)) return res.responseDto
  return []
}

export async function saveCategory(body: { name: string; isActive?: boolean }): Promise<{ success: boolean; data?: CategoryDto; error?: string }> {
  const res = await apiPost<CategoryDto>('/category/save', body)
  if (res.status && res.responseDto) return { success: true, data: res.responseDto }
  return { success: false, error: res.errorDescription ?? 'Failed to save category' }
}

export async function updateCategory(body: { id: number; name?: string; isActive?: boolean }): Promise<{ success: boolean; data?: CategoryDto; error?: string }> {
  const res = await apiPost<CategoryDto>('/category/update', body)
  if (res.status && res.responseDto) return { success: true, data: res.responseDto }
  return { success: false, error: res.errorDescription ?? 'Failed to update category' }
}

export async function updateCategoryStatus(categoryId: number, status: boolean): Promise<{ success: boolean; error?: string }> {
  const res = await apiPut<CategoryDto>(`/category/updateStatus?categoryId=${categoryId}&status=${status}`)
  if (res.status) return { success: true }
  return { success: false, error: res.errorDescription ?? 'Failed to update status' }
}
