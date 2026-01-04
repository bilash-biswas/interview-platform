import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGetExamsQuery } from '@/redux/services/examApi';
import { COLORS, SPACING } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ExamsScreen() {
  const router = useRouter();
  const { data: exams, isLoading, refetch } = useGetExamsQuery();

  const renderExamItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.examCard}
      onPress={() => router.push({ pathname: '/exam-arena', params: { id: item._id || item.id } } as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category || 'GENERAL'}</Text>
        </View>
        <Text style={styles.timeLabel}>{item.totalTime}m Session</Text>
      </View>

      <Text style={styles.examTitle}>{item.title}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.footerDetail}>
          <Text style={styles.detailLabel}>COMMENCES</Text>
          <Text style={styles.detailValue}>
            {new Date(item.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
          </Text>
        </View>
        <View style={styles.footerDetail}>
          <Text style={styles.detailLabel}>PENALTY</Text>
          <Text style={[styles.detailValue, { color: COLORS.error }]}>-{item.negativeMarkingValue}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Text style={styles.actionText}>ENTER COMBAT SECTOR</Text>
        <IconSymbol name="chevron.right" size={14} color={COLORS.arenaBlue} />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.arenaBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ASSIGNED SECTORS</Text>
          </View>
        </View>
        <Text style={styles.title}>OFFICIAL</Text>
        <Text style={styles.subtitle}>EXAM ARENA</Text>
      </View>

      <FlatList
        data={exams}
        renderItem={renderExamItem}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.2)',
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
  },
  badgeText: {
    color: COLORS.arenaBlue,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    color: COLORS.foreground,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: COLORS.arenaBlue,
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    marginTop: -8,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  examCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timeLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  examTitle: {
    color: COLORS.foreground,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: SPACING.lg,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  footerDetail: {
    gap: 2,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    opacity: 0.5,
  },
  detailValue: {
    color: COLORS.foreground,
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: COLORS.arenaBlue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  }
});
