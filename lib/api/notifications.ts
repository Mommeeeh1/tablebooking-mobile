import { apiClient } from './client'
import { Notification } from '../../types'

export const notificationsApi = {
  getAll: async (token: string): Promise<Notification[]> => {
    return apiClient.get<Notification[]>('/notifications', token)
  },

  markAsRead: async (notificationId: string, token: string): Promise<Notification> => {
    return apiClient.patch<Notification>(`/notifications/${notificationId}/read`, {}, token)
  },
}
