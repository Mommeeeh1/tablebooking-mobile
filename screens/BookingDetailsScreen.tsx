import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { useAuth } from '../lib/context/AuthContext'
import { useToast } from '../lib/context/ToastContext'
import { bookingsApi } from '../lib/api/bookings'
import { Booking, CanCancelResponse } from '../types'
import { StatusBadge } from '../components/StatusBadge'
import { useRoute, useNavigation } from '@react-navigation/native'

export default function BookingDetailsScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const params = route.params as { booking?: Booking; bookingId?: string }
  const [booking, setBooking] = useState<Booking | null>(params.booking || null)
  const [canCancel, setCanCancel] = useState<CanCancelResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingCancel, setCheckingCancel] = useState(true)
  const [fetching, setFetching] = useState(!params.booking)
  const { token } = useAuth()
  const { showToast, confirm } = useToast()

  // Screen can be opened with a full booking object (from list) or just an ID (from notification)
  useEffect(() => {
    if (params.bookingId && !params.booking) {
      fetchBooking()
    } else if (booking) {
      checkCanCancelForBooking(booking)
    }
  }, [])

  const fetchBooking = async () => {
    if (!token || !params.bookingId) return

    try {
      setFetching(true)
      const fetchedBooking = await bookingsApi.getById(params.bookingId, token)
      setBooking(fetchedBooking)
      if (fetchedBooking) {
        await checkCanCancelForBooking(fetchedBooking)
      }
    } catch (error) {
      showToast('Failed to load booking details', 'error')
      navigation.goBack()
    } finally {
      setFetching(false)
    }
  }

  const checkCanCancelForBooking = async (bookingToCheck: Booking) => {
    if (!token) return

    try {
      const result = await bookingsApi.canCancel(bookingToCheck.id, token)
      setCanCancel(result)
    } catch {
      // Silently fail — cancel check is non-critical
    } finally {
      setCheckingCancel(false)
    }
  }

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking?',
      confirmText: 'Yes, Cancel',
      cancelText: 'Keep Booking',
    })
    if (confirmed) {
      performCancel()
    }
  }

  const performCancel = async () => {
    if (!token || !booking) return

    try {
      setLoading(true)
      const cancelled = await bookingsApi.cancel(booking.id, token)
      setBooking(cancelled)
      await checkCanCancelForBooking(cancelled)
      showToast('Booking cancelled successfully', 'success')
      navigation.goBack()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to cancel booking', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching || !booking) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }

  const date = new Date(booking.date)

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-6">
        <View className="bg-white rounded-lg p-6 border border-gray-200 mb-4">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-2">Booking Details</Text>
              <Text className="text-sm text-gray-500">ID: {booking.id.slice(0, 8)}</Text>
            </View>
            <StatusBadge status={booking.status} />
          </View>

          <View className="gap-4">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-500 mb-1">Date</Text>
              <Text className="text-lg text-gray-900">{date.toLocaleDateString('sv-SE')}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-500 mb-1">Time</Text>
              <Text className="text-lg text-gray-900">{booking.time}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-500 mb-1">Number of People</Text>
              <Text className="text-lg text-gray-900">{booking.numberOfPeople}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-500 mb-1">Status</Text>
              <Text className="text-lg text-gray-900">{booking.status}</Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-500 mb-1">Created</Text>
              <Text className="text-lg text-gray-900">
                {new Date(booking.createdAt).toLocaleString('sv-SE')}
              </Text>
            </View>
          </View>
        </View>

        {checkingCancel ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color="#4F46E5" />
          </View>
        ) : (
          <>
            {booking.status === 'CANCELLED' ? (
              <View className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4">
                <Text className="text-gray-900 text-base font-semibold mb-2">
                  This booking has been cancelled
                </Text>
                <Text className="text-gray-500 text-sm">
                  This booking is no longer active.
                </Text>
              </View>
            ) : canCancel?.canCancel ? (
              <TouchableOpacity
                onPress={handleCancel}
                disabled={loading}
                className={`bg-red-600 rounded-lg py-4 items-center ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-lg">Cancel Booking</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4">
                <Text className="text-gray-900 text-base font-semibold mb-2">
                  Cannot Cancel This Booking
                </Text>
                {canCancel?.reason && (
                  <Text className="text-gray-500 text-sm mb-3">{canCancel.reason}</Text>
                )}
                <View className="mt-2 pt-3 border-t border-gray-300">
                  <Text className="text-gray-700 text-sm font-semibold mb-2">Cancellation Rules:</Text>
                  <Text className="text-gray-500 text-xs pl-2 mb-1">• Booking must be PENDING or APPROVED</Text>
                  <Text className="text-gray-500 text-xs pl-2">• More than 24 hours must remain before the booking start time</Text>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  )
}
