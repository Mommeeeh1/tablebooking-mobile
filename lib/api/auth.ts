import { apiClient } from './client'
import { AuthResponse } from '../../types'

export const authApi = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('authApi.register: Calling /auth/register with:', { email, password: '***' })
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', { email, password })
      console.log('authApi.register: Success:', response)
      return response
    } catch (error) {
      console.error('authApi.register: Error:', error)
      throw error
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('authApi.login: Calling /auth/login with:', { email, password: '***' })
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', { email, password })
      console.log('authApi.login: Success:', response)
      return response
    } catch (error) {
      console.error('authApi.login: Error:', error)
      throw error
    }
  },
}
