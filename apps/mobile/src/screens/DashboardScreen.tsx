import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { COLORS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

const QuickAction = ({ title, icon, color, onPress }: { title: string; icon: string; color: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
      <Text style={styles.iconText}>{icon}</Text>
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function DashboardScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>WELCOME BACK,</Text>
            <Text style={styles.username}>{user?.username || 'RECRUIT'}</Text>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>RANK S</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="TOTAL BATTLES" value="128" color={COLORS.arenaBlue} />
          <StatCard label="WIN RATE" value="74%" color={COLORS.success} />
          <StatCard label="EXAMS TAKEN" value="42" color={COLORS.arenaPurple} />
          <StatCard label="TACTICAL SCORE" value="8.9k" color={COLORS.arenaOrange} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK DEPLOYMENT</Text>
          <View style={styles.actionsGrid}>
            <QuickAction title="BATTLE ARENA" icon="⚔️" color={COLORS.arenaBlue} onPress={() => navigation.navigate('BattleArena')} />
            <QuickAction title="EXAM TERMINAL" icon="📝" color={COLORS.arenaPurple} onPress={() => navigation.navigate('ExamArena')} />
            <QuickAction title="SOCIAL SECTOR" icon="📡" color={COLORS.arenaOrange} onPress={() => navigation.navigate('Social')} />
            <QuickAction title="COMRADES" icon="👥" color={COLORS.success} onPress={() => { }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT PERFORMANCE</Text>
          <View style={styles.chartPlaceholder}>
            <View style={[styles.bar, { height: '40%' }]} />
            <View style={[styles.bar, { height: '60%' }]} />
            <View style={[styles.bar, { height: '80%' }]} />
            <View style={[styles.bar, { height: '50%' }]} />
            <View style={[styles.bar, { height: '90%' }]} />
            <View style={[styles.bar, { height: '70%' }]} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  welcome: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  username: {
    color: COLORS.foreground,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rankBadge: {
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.arenaBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rankText: {
    color: COLORS.arenaBlue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm * 4) / 2,
    backgroundColor: COLORS.card,
    margin: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: SPACING.md,
    opacity: 0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: (width - SPACING.lg * 2 - SPACING.md * 3) / 4,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconText: {
    fontSize: 20,
  },
  actionTitle: {
    color: COLORS.foreground,
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  chartPlaceholder: {
    height: 120,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    padding: SPACING.md,
  },
  bar: {
    width: 20,
    backgroundColor: COLORS.arenaBlue,
    borderRadius: 4,
    opacity: 0.6,
  },
});
