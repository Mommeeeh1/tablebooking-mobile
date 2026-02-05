import { apiClient } from './client'
import { Booking, CreateBookingData, CanCancelResponse } from '../../types'

export const bookingsApi = {
  getAll: async (token: string): Promise<Booking[]> => {
    return apiClient.get<Booking[]>('/bookings', token)
  },

  getById: async (bookingId: string, token: string): Promise<Booking> => {
    return apiClient.get<Booking>(`/bookings/${bookingId}`, token)
  },

  create: async (data: CreateBookingData, token: string): Promise<Booking> => {
    return apiClient.post<Booking>('/bookings', data, token)
  },

  cancel: async (bookingId: string, token: string): Promise<Booking> => {
    return apiClient.delete<Booking>(`/bookings/${bookingId}`, token)
  },

  canCancel: async (bookingId: string, token: string): Promise<CanCancelResponse> => {
    return apiClient.get<CanCancelResponse>(`/bookings/${bookingId}/can-cancel`, token)
  },
}
