import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/redux/features/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING } from '@/constants/theme';

export default function ProfileScreen() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('token'),
      ]);
    } catch (err) {
      console.error('Logout storage clear failed:', err);
    }
    dispatch(logout());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase() || 'R'}</Text>
          </View>
          <Text style={styles.username}>{user?.username || 'RECRUIT'}</Text>
          <Text style={styles.email}>{user?.email || 'OFFLINE'}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeLabel}>LEVEL 42</Text></View>
            <View style={[styles.badge, { borderColor: COLORS.arenaOrange }]}><Text style={[styles.badgeLabel, { color: COLORS.arenaOrange }]}>ELITE</Text></View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>1.2k</Text>
            <Text style={styles.statLabel}>EXP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>88%</Text>
            <Text style={styles.statLabel}>PRECISION</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>14</Text>
            <Text style={styles.statLabel}>STREAK</Text>
          </View>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>TACTICAL SETTINGS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🛡️</Text>
            <Text style={styles.menuText}>SECURITY PROTOCOLS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={styles.menuText}>COMBAT ANALYSIS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={[styles.menuText, { color: COLORS.error }]}>TERMINATE SESSION</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xl },
  header: { alignItems: 'center', paddingVertical: SPACING.xxl, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatarLarge: { width: 100, height: 100, borderRadius: 30, backgroundColor: COLORS.arenaBlue, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  avatarText: { fontSize: 48, fontWeight: '900', color: '#000' },
  username: { color: COLORS.foreground, fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  email: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 4 },
  badgeRow: { flexDirection: 'row', marginTop: SPACING.md, gap: 8 },
  badge: { borderWidth: 1, borderColor: COLORS.arenaBlue, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  badgeLabel: { color: COLORS.arenaBlue, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: SPACING.xl, backgroundColor: 'rgba(255, 255, 255, 0.02)' },
  statBox: { alignItems: 'center' },
  statNum: { color: COLORS.foreground, fontSize: 20, fontWeight: '900' },
  statLabel: { color: COLORS.textSecondary, fontSize: 8, fontWeight: '900', letterSpacing: 2, marginTop: 4 },
  menu: { padding: SPACING.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: SPACING.lg, borderRadius: 16, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  menuIcon: { fontSize: 18, marginRight: SPACING.md },
  menuText: { color: COLORS.foreground, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  logoutItem: { borderColor: 'rgba(255, 75, 75, 0.2)', backgroundColor: 'rgba(255, 75, 75, 0.05)' },
});
