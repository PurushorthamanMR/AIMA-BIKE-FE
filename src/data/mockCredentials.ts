/**
 * Mock Login Credentials - AIMA Showroom POS
 * Role-based: Admin, Manager, Staff
 * Store locally for development - Replace with API later
 */

import type { UserRole } from '@/types'

export interface MockUser {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
}

export const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    email: 'admin@aimashowroom.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'manager@aimashowroom.com',
    password: 'manager123',
    name: 'Manager User',
    role: 'manager',
  },
  {
    id: '3',
    email: 'staff@aimashowroom.com',
    password: 'staff123',
    name: 'Staff User',
    role: 'staff',
  },
]

export const validateCredentials = (email: string, password: string): MockUser | null => {
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedPassword = password.trim()
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword
  )
  return user ?? null
}
