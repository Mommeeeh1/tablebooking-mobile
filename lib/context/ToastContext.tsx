import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const TOAST_DURATION = 3500
const { width: SCREEN_WIDTH } = Dimensions.get('window')

const COLORS: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: '#F0FDF4', border: '#22C55E', text: '#166534', icon: '\u2713' },
  error:   { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', icon: '!' },
  warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', icon: '\u26A0' },
  info:    { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', icon: 'i' },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-40)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start()

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -40, duration: 250, useNativeDriver: true }),
      ]).start(() => onDismiss(toast.id))
    }, TOAST_DURATION)

    return () => clearTimeout(timer)
  }, [])

  const colors = COLORS[toast.type]

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.bg,
          borderLeftColor: colors.border,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.border }]}>
        <Text style={styles.iconText}>{colors.icon}</Text>
      </View>
      <Text style={[styles.toastText, { color: colors.text }]} numberOfLines={3}>
        {toast.message}
      </Text>
      <TouchableOpacity onPress={() => onDismiss(toast.id)} style={styles.closeBtn}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{'\u00D7'}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

function ConfirmModal({
  options,
  onResult,
}: {
  options: ConfirmOptions
  onResult: (result: boolean) => void
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start()
  }, [])

  const dismiss = (result: boolean) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() =>
      onResult(result)
    )
  }

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>{options.title}</Text>
        <Text style={styles.modalMessage}>{options.message}</Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalBtn, styles.cancelBtn]}
            onPress={() => dismiss(false)}
          >
            <Text style={styles.cancelBtnText}>{options.cancelText || 'Cancel'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalBtn, styles.confirmBtn]}
            onPress={() => dismiss(true)}
          >
            <Text style={styles.confirmBtnText}>{options.confirmText || 'Confirm'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions
    resolve: (value: boolean) => void
  } | null>(null)
  const nextId = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId.current++
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const confirmFn = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ options, resolve })
    })
  }, [])

  const handleConfirmResult = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result)
      setConfirmState(null)
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, confirm: confirmFn }}>
      {children}
      {/* Toasts */}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </View>
      {/* Confirm modal */}
      {confirmState && (
        <ConfirmModal options={confirmState.options} onResult={handleConfirmResult} />
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    width: Math.min(SCREEN_WIDTH - 32, 420),
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeBtn: {
    marginLeft: 8,
    padding: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  modal: {
    width: Math.min(SCREEN_WIDTH - 48, 380),
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  confirmBtn: {
    backgroundColor: '#EF4444',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
})
