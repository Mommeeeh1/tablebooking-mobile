import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthResponse } from '../../types'
import { authApi } from '../api/auth'
import { authStorage } from '../auth/storage'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from AsyncStorage on app start
  useEffect(() => {
    loadStoredAuth()
  }, [])

  const loadStoredAuth = async () => {
    try {
      const storedToken = await authStorage.getToken()
      const storedUser = await authStorage.getUser()
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(storedUser)
      }
    } catch (error) {
      console.error('Error loading stored auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await authApi.login(email, password)
    await authStorage.setToken(response.token)
    await authStorage.setUser(response.user)
    setToken(response.token)
    setUser(response.user)
  }

  const register = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Calling register API...')
      const response: AuthResponse = await authApi.register(email, password)
      console.log('AuthContext: Register API response received:', response)
      await authStorage.setToken(response.token)
      await authStorage.setUser(response.user)
      setToken(response.token)
      setUser(response.user)
      console.log('AuthContext: Registration complete')
    } catch (error) {
      console.error('AuthContext: Register error:', error)
      throw error
    }
  }

  const logout = async () => {
    await authStorage.clear()
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user, // Drives auth-gated navigation in App.tsx
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
