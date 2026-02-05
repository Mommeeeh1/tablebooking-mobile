import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuth } from '../lib/context/AuthContext'
import { useToast } from '../lib/context/ToastContext'
import { bookingsApi } from '../lib/api/bookings'
import { Booking } from '../types'
import { useNavigation, CommonActions, useFocusEffect } from '@react-navigation/native'
import { StatusBadge } from '../components/StatusBadge'

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { token, logout } = useAuth()
  const { showToast } = useToast()
  const navigation = useNavigation()

  // Reload bookings every time screen comes into focus (e.g. after creating a booking)
  useFocusEffect(
    React.useCallback(() => {
      loadBookings()
    }, [token])
  )

  const loadBookings = async () => {
    if (!token) return

    try {
      const data = await bookingsApi.getAll(token)
      setBookings(data)
    } catch (error) {
      // 401 means token expired — force logout so user re-authenticates
      if (error instanceof Error && error.message.includes('401')) {
        logout()
      } else {
        showToast('Failed to load bookings', 'error')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadBookings()
  }

  const handleLogout = async () => {
    await logout()
  }

  const renderBooking = ({ item }: { item: Booking }) => {
    const date = new Date(item.date)
    
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.dispatch(
            CommonActions.navigate({ name: 'BookingDetails', params: { booking: item } })
          )
        }}
        style={styles.bookingCard}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingDate}>
              {date.toLocaleDateString('sv-SE')} at {item.time}
            </Text>
            <Text style={styles.bookingPeople}>
              {item.numberOfPeople} {item.numberOfPeople === 1 ? 'person' : 'people'}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings yet</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate({ name: 'CreateBooking' })
                )
              }}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Create Booking</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        onPress={() => {
          navigation.dispatch(
            CommonActions.navigate({ name: 'CreateBooking' })
          )
        }}
        style={styles.fab}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  bookingPeople: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 18,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4F46E5',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
})

