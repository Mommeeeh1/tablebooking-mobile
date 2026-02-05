import { View, Text, StyleSheet } from 'react-native'

interface StatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  PENDING:   { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E' },
  APPROVED:  { bg: '#D1FAE5', border: '#6EE7B7', text: '#065F46' },
  REJECTED:  { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B' },
  CANCELLED: { bg: '#E5E7EB', border: '#9CA3AF', text: '#374151' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status]

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
})
