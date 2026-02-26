import { apiGet, apiPost, apiPut, ApiResponse } from './api'

export interface UserRoleDto {
  id: number
  userRole: string
  isActive?: boolean
}

export interface UserDto {
  id: number
  firstName?: string
  lastName?: string
  emailAddress?: string
  address?: string
  mobileNumber?: string
  isActive?: boolean
  createdDate?: string
  modifiedDate?: string
  userRoleId?: number
  userRoleDto?: UserRoleDto | { id?: number; userRole?: string; isActive?: boolean }
}

export interface UserPageResponse {
  content: UserDto[]
  totalElements: number
  totalPages: number
  pageNumber: number
  pageSize: number
}

export async function getUsersPage(
  pageNumber = 1,
  pageSize = 10,
  params?: { isActive?: boolean; firstName?: string; lastName?: string; emailAddress?: string }
): Promise<UserPageResponse> {
  let url = `/user/getAllPage?pageNumber=${pageNumber}&pageSize=${pageSize}`
  if (params?.isActive !== undefined) url += `&status=${params.isActive}`
  if (params?.firstName) url += `&firstName=${encodeURIComponent(params.firstName)}`
  if (params?.lastName) url += `&lastName=${encodeURIComponent(params.lastName)}`
  if (params?.emailAddress) url += `&emailAddress=${encodeURIComponent(params.emailAddress)}`
  const res = await apiGet<UserPageResponse>(url)
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

export async function getUserById(id: number): Promise<UserDto | null> {
  const res = await apiGet<UserDto[]>(`/user/getById?id=${id}`)
  if (res.status && res.responseDto && Array.isArray(res.responseDto) && res.responseDto.length > 0) {
    return res.responseDto[0]
  }
  return null
}

export async function registerUser(body: {
  firstName: string
  lastName: string
  emailAddress: string
  password: string
  address?: string
  mobileNumber?: string
  isActive?: boolean
  userRoleId?: number
  userRoleDto?: { id: number }
  emailVerificationToken?: string
}): Promise<{ success: boolean; data?: UserDto; error?: string }> {
  const res = await apiPost<UserDto>('/user/register', body)
  if (res.status && res.responseDto) return { success: true, data: res.responseDto }
  return { success: false, error: res.errorDescription ?? 'Failed to register user' }
}

export async function updateUser(body: {
  id: number
  firstName?: string
  lastName?: string
  emailAddress?: string
  address?: string
  mobileNumber?: string
  userRoleId?: number
  userRoleDto?: { id: number }
  emailVerificationToken?: string
}): Promise<{ success: boolean; data?: UserDto; error?: string }> {
  const res = await apiPost<UserDto>('/user/update', body)
  if (res.status && res.responseDto) return { success: true, data: res.responseDto }
  return { success: false, error: res.errorDescription ?? 'Failed to update user' }
}

export async function updateUserStatus(userId: number, status: boolean): Promise<{ success: boolean; error?: string }> {
  const res = await apiPut<UserDto>(`/user/updateStatus?userId=${userId}&status=${status}`)
  if (res.status) return { success: true }
  return { success: false, error: res.errorDescription ?? 'Failed to update status' }
}

export async function getUserRoles(): Promise<UserRoleDto[]> {
  const res = await apiGet<UserRoleDto[]>('/userRole/getAll')
  if (res.status && res.responseDto) return Array.isArray(res.responseDto) ? res.responseDto : []
  return []
}

export async function getUserByEmail(emailAddress: string): Promise<UserDto | null> {
  const res: ApiResponse<UserDto[]> = await apiGet<UserDto[]>(
    `/user/getByEmailAddress?emailAddress=${encodeURIComponent(emailAddress)}`
  )
  const users = res.responseDto
  if (users && Array.isArray(users) && users.length > 0) {
    return users[0]
  }
  return null
}
