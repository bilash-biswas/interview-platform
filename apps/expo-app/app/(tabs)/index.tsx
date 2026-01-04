import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, SPACING } from '@/constants/theme';
import { useGetPendingFriendsQuery, useGetFriendsQuery, useSendFriendRequestMutation, useAcceptFriendRequestMutation } from '@/redux/services/socialApi';
import { useGetAllUsersQuery } from '@/redux/services/authApi';
import { IconSymbol } from '@/components/ui/icon-symbol';

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

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: pending, isLoading: loadingPending } = useGetPendingFriendsQuery(user?.id || '', { skip: !user?.id });
  const { data: friends } = useGetFriendsQuery(user?.id || '', { skip: !user?.id });
  const { data: allUsers, isLoading: loadingUsers } = useGetAllUsersQuery();

  const [sendRequest] = useSendFriendRequestMutation();
  const [acceptRequest] = useAcceptFriendRequestMutation();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleAccept = async (requestId: string) => {
    if (isProcessing) return;
    setIsProcessing(requestId);
    try {
      await acceptRequest({ requestId }).unwrap();
      Alert.alert('SUCCESS', 'Alliance confirmed. Data channels synced.');
    } catch (err: any) {
      Alert.alert('FAILURE', 'Authorization failed.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSendRequest = async (recipientId: string, recipientName: string) => {
    if (!user || isProcessing) return;
    setIsProcessing(recipientId);
    try {
      await sendRequest({
        requester: user.id,
        requesterName: user.username,
        recipient: recipientId,
        recipientName
      }).unwrap();
      Alert.alert('SENT', 'Alliance request transmitted successfully.');
    } catch (err: any) {
      Alert.alert('ERROR', err?.data?.error || 'Link connection failed.');
    } finally {
      setIsProcessing(null);
    }
  };

  // Filter users for suggestions
  const filteredUsers = allUsers?.filter(u => {
    if (u.id === user?.id) return false;
    const isFriend = friends?.some(f => f.requester === u.id || f.recipient === u.id);
    if (isFriend) return false;
    const isPendingReceived = pending?.some(p => p.requester === u.id);
    if (isPendingReceived) return false;
    return true;
  }).slice(0, 4) || [];

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
            <QuickAction title="BATTLE ARENA" icon="⚔️" color={COLORS.arenaBlue} onPress={() => router.push('/(tabs)/battle' as any)} />
            <QuickAction title="EXAM TERMINAL" icon="📝" color={COLORS.arenaPurple} onPress={() => router.push('/(tabs)/exams' as any)} />
            <QuickAction title="SOCIAL SECTOR" icon="📡" color={COLORS.arenaOrange} onPress={() => router.push('/(tabs)/social' as any)} />
            <QuickAction title="MATH LAB" icon="🧮" color={COLORS.success} onPress={() => router.push('/math' as any)} />
            <QuickAction title="AI" icon="🤖" color={COLORS.arenaOrange} onPress={() => router.push('/ai' as any)} />
          </View>
        </View>

        {/* Pending Requests Section */}
        {pending && pending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INBOUND AUTHORIZATIONS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {pending.map((p: any) => (
                <View key={p.id} style={styles.requestCard}>
                  <View style={styles.requestInfo}>
                    <View style={styles.requestAvatar}>
                      <Text style={styles.avatarText}>{p.requesterName?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.requestName}>{p.requesterName}</Text>
                      <Text style={styles.requestRole}>RECRUIT</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.authorizeBtn}
                    onPress={() => handleAccept(p.id)}
                    disabled={isProcessing === p.id}
                  >
                    {isProcessing === p.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.authorizeText}>AUTHORIZE</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* User Suggestions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>GLOBAL RECRUITMENT</Text>
            <TouchableOpacity onPress={() => { }}>
              <Text style={styles.viewMore}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {loadingUsers ? (
            <ActivityIndicator color={COLORS.arenaBlue} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.suggestionsGrid}>
              {filteredUsers.map((u: any) => (
                <View key={u.id} style={styles.suggestionItem}>
                  <View style={styles.suggestionInfo}>
                    <View style={styles.suggestionAvatar}>
                      <Text style={styles.avatarText}>{u.username?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View style={styles.suggestionTextContainer}>
                      <Text style={styles.suggestionName} numberOfLines={1}>{u.username}</Text>
                      <Text style={styles.suggestionEmail} numberOfLines={1}>{u.email}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={() => handleSendRequest(u.id, u.username)}
                    disabled={isProcessing === u.id}
                  >
                    <Text style={styles.linkText}>{isProcessing === u.id ? '...' : 'LINK'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
  horizontalScroll: {
    paddingRight: SPACING.lg,
  },
  requestCard: {
    width: width * 0.7,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.arenaBlue + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.arenaBlue + '40',
  },
  avatarText: {
    color: COLORS.arenaBlue,
    fontSize: 18,
    fontWeight: '900',
  },
  requestName: {
    color: COLORS.foreground,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  requestRole: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    opacity: 0.5,
  },
  authorizeBtn: {
    backgroundColor: COLORS.arenaBlue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  authorizeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  viewMore: {
    color: COLORS.arenaBlue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  suggestionsGrid: {
    gap: SPACING.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  suggestionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    color: COLORS.foreground,
    fontSize: 14,
    fontWeight: '900',
  },
  suggestionEmail: {
    color: COLORS.textSecondary,
    fontSize: 10,
    opacity: 0.5,
  },
  linkBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkText: {
    color: COLORS.foreground,
    fontSize: 9,
    fontWeight: '900',
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
