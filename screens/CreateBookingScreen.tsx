import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useAuth } from '../lib/context/AuthContext'
import { useToast } from '../lib/context/ToastContext'
import { bookingsApi } from '../lib/api/bookings'
import { useNavigation } from '@react-navigation/native'

export default function CreateBookingScreen() {
  // Default to tomorrow to avoid past-date validation errors
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const [date, setDate] = useState(tomorrow)
  const [dateString, setDateString] = useState(tomorrow.toISOString().split('T')[0])
  const [time, setTime] = useState('18:00')
  const [numberOfPeople, setNumberOfPeople] = useState('2')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()
  const { showToast } = useToast()
  const navigation = useNavigation()

  const handleCreate = async () => {
    if (!time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      showToast('Please enter a valid time (HH:mm format)', 'error')
      return
    }

    const people = parseInt(numberOfPeople)
    if (isNaN(people) || people < 1) {
      showToast('Number of people must be at least 1', 'error')
      return
    }

    if (date < new Date()) {
      showToast('Booking date must be in the future', 'error')
      return
    }

    try {
      setLoading(true)
      await bookingsApi.create(
        {
          date: date.toISOString(),
          time,
          numberOfPeople: people,
        },
        token!
      )
      showToast('Booking created successfully!', 'success')
      navigation.goBack()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to create booking', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Booking</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.input}>
              {/* @ts-ignore - React Native Web supports HTML elements */}
              <input
                type="date"
                value={dateString}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e: any) => {
                  const value = e.target.value
                  setDateString(value)
                  const selectedDate = new Date(value)
                  if (!isNaN(selectedDate.getTime())) {
                    setDate(selectedDate)
                  }
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: 16,
                  color: '#111827',
                  backgroundColor: 'transparent',
                }}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.input}
              >
                <Text style={styles.inputText}>
                  {date.toLocaleDateString('sv-SE')}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false)
                    if (selectedDate) {
                      setDate(selectedDate)
                      setDateString(selectedDate.toISOString().split('T')[0])
                    }
                  }}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time (HH:mm)</Text>
          <TextInput
            style={styles.input}
            placeholder="18:00"
            value={time}
            onChangeText={setTime}
            keyboardType="default"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of People</Text>
          <TextInput
            style={styles.input}
            placeholder="2"
            value={numberOfPeople}
            onChangeText={setNumberOfPeople}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading}
          style={[styles.button, loading && styles.buttonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Create Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#111827',
  },
  inputText: {
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 18,
  },
})

