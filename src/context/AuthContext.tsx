import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { User, UserRole } from '@/types'
import { login as apiLogin } from '@/lib/authApi'
import { getUserByEmail } from '@/lib/userApi'
import { getToken, setToken } from '@/lib/api'
import { decodeJwtPayload } from '@/lib/jwt'

const STORAGE_KEY = 'aima_pos_user'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function loadStoredUser(): User | null {
  try {
    const token = getToken()
    if (!token) return null
    const payload = decodeJwtPayload(token)
    if (!payload?.sub) return null
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User
        if (parsed.id && parsed.username && parsed.role) return parsed
      } catch {
        // fall through to build from token
      }
    }
    const displayName = [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim()
    return {
      id: String(payload.userId ?? ''),
      username: payload.sub,
      role: (payload.role?.toLowerCase() ?? 'staff') as UserRole,
      name: displayName || payload.sub,
    }
  } catch {
    return null
  }
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser)

  useEffect(() => {
    saveUser(user)
  }, [user])

  // Fetch user name when we have user but name is email (e.g. from old token/stored)
  useEffect(() => {
    if (!user?.username || !user.username.includes('@')) return
    if (user.name && !user.name.includes('@')) return // already have proper name
    getUserByEmail(user.username)
      .then((profile) => {
        if (profile?.firstName || profile?.lastName) {
          const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
          if (displayName) {
            setUser((prev) => (prev ? { ...prev, name: displayName } : null))
          }
        }
      })
      .catch(() => {})
  }, [user?.username, user?.name])

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password)
    if (!result.success) return false

    const token = getToken()
    if (!token) return false

    const payload = decodeJwtPayload(token)
    const emailFromToken = payload?.sub ?? email
    let displayName = ''
    try {
      const userProfile = await getUserByEmail(emailFromToken)
      if (userProfile?.firstName || userProfile?.lastName) {
        displayName = [userProfile.firstName, userProfile.lastName].filter(Boolean).join(' ').trim()
      }
    } catch {
      // fallback to email if fetch fails
    }
    const userData: User = {
      id: String(payload?.userId ?? ''),
      username: payload?.sub ?? email,
      role: (payload?.role?.toLowerCase() ?? 'staff') as UserRole,
      name: displayName || emailFromToken,
    }
    setUser(userData)
    return true
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
