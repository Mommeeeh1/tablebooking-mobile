export interface User {
  id: string
  email: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Booking {
  id: string
  userId: string
  date: string
  time: string
  numberOfPeople: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}

export interface CreateBookingData {
  date: string
  time: string
  numberOfPeople: number
}

export interface Notification {
  id: string
  userId: string
  bookingId: string | null
  type: 'BOOKING_APPROVED' | 'BOOKING_REJECTED'
  message: string
  read: boolean
  createdAt: string
}

export interface CanCancelResponse {
  canCancel: boolean
  reason?: string
}
