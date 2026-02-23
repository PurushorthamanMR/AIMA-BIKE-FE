import { apiGet, ApiResponse } from './api'

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
  status = true
): Promise<CategoryDto[]> {
  const res: ApiResponse<CategoryPageResponse> = await apiGet<CategoryPageResponse>(
    `/category/getAllPage?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${status}`
  )
  if (res.status && res.responseDto?.content) {
    return res.responseDto.content
  }
  return []
}
