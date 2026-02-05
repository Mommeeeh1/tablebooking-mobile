import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuth } from '../lib/context/AuthContext'
import { useToast } from '../lib/context/ToastContext'
import { notificationsApi } from '../lib/api/notifications'
import { Notification } from '../types'
import { useNavigation, CommonActions } from '@react-navigation/native'

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { token, logout } = useAuth()
  const { showToast } = useToast()
  const navigation = useNavigation()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    if (!token) return

    try {
      const data = await notificationsApi.getAll(token)
      setNotifications(data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        logout()
      } else {
        showToast('Failed to load notifications', 'error')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadNotifications()
  }

  const markAsRead = async (notificationId: string) => {
    if (!token) return

    try {
      await notificationsApi.markAsRead(notificationId, token)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      showToast('Failed to mark notification as read', 'error')
    }
  }

  // Tap marks as read + navigates to the related booking if one exists
  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    if (notification.bookingId) {
      navigation.dispatch(
        CommonActions.navigate({ name: 'BookingDetails', params: { bookingId: notification.bookingId } })
      )
    }
  }

  const renderNotification = ({ item }: { item: Notification }) => {
    const date = new Date(item.createdAt)
    const isUnread = !item.read

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.notificationCard,
          isUnread ? styles.notificationUnread : styles.notificationRead
        ]}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationBody}>
            {isUnread && (
              <View style={styles.unreadBadgeContainer}>
                <View style={styles.unreadDot} />
                <Text style={styles.unreadLabel}>NEW</Text>
              </View>
            )}
            <Text style={[styles.notificationMessage, isUnread && styles.notificationMessageUnread]}>
              {item.message}
            </Text>
            <Text style={styles.notificationDate}>
              {date.toLocaleDateString('sv-SE')} {date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

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
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Text style={styles.unreadCount}>
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </Text>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
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
  unreadCount: {
    fontSize: 14,
    color: '#4F46E5',
    marginTop: 4,
  },
  notificationCard: {
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  notificationUnread: {
    backgroundColor: '#EEF2FF',
    borderLeftColor: '#4F46E5',
  },
  notificationRead: {
    backgroundColor: '#ffffff',
    borderLeftColor: '#E5E7EB',
  },
  notificationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationBody: {
    flex: 1,
  },
  unreadBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 4,
    marginRight: 8,
  },
  unreadLabel: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 16,
    color: '#111827',
  },
  notificationMessageUnread: {
    fontWeight: '600',
  },
  notificationDate: {
    fontSize: 12,
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
})

