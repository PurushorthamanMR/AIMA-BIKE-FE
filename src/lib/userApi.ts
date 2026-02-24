import { apiGet, ApiResponse } from './api'

export interface UserDto {
  id: number
  firstName?: string
  lastName?: string
  emailAddress?: string
  address?: string
  mobileNumber?: string
  isActive?: boolean
  userRoleDto?: { userRole?: string }
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
