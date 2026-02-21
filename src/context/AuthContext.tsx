import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { User, UserRole } from '@/types'
import { validateCredentials } from '@/data/mockCredentials'

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
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as User
      if (parsed.id && parsed.username && parsed.role) return parsed
    }
  } catch {
    // ignore
  }
  return null
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

  const login = useCallback(async (email: string, password: string) => {
    const mockUser = validateCredentials(email, password)
    if (!mockUser) return false

    const userData: User = {
      id: mockUser.id,
      username: mockUser.email,
      role: mockUser.role as UserRole,
      name: mockUser.name,
    }
    setUser(userData)
    return true
  }, [])

  const logout = useCallback(() => {
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
