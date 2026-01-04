import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { COLORS, SPACING } from '../constants/theme';
import { friendApi } from '../api/friendService';

const UserCard = ({ user, onLink, isRequesting }: any) => (
  <View style={styles.userCard}>
    <View style={styles.userInfo}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.username[0].toUpperCase()}</Text>
      </View>
      <View>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.rank}>RANK C</Text>
      </View>
    </View>
    <TouchableOpacity
      style={[styles.linkButton, isRequesting && styles.disabledButton]}
      onPress={() => onLink(user.id, user.username)}
      disabled={isRequesting}
    >
      <Text style={styles.linkText}>{isRequesting ? 'LINKING...' : 'INITIATE LINK'}</Text>
    </TouchableOpacity>
  </View>
);

export default function FriendCenterScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [linkingId, setLinkingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await friendApi.getAllUsers();
      setDiscoverUsers(data.filter((u: any) => u.id !== user?.id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLink = async (recipientId: string, recipientName: string) => {
    if (!user) return;
    setLinkingId(recipientId);
    try {
      await friendApi.sendRequest({
        requester: user.id,
        requesterName: user.username,
        recipient: recipientId,
        recipientName
      });
      Alert.alert('SUCCESS', 'Alliance request transmitted.');
    } catch (err) {
      Alert.alert('FAILURE', 'Link failed.');
    } finally {
      setLinkingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>COMRADE REGISTRY</Text>
        <Text style={styles.subtitle}>DISCOVER ELITE RECRUITS</Text>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="SEARCH CALLSIGN..."
          placeholderTextColor="rgba(255, 255, 255, 0.2)"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={COLORS.arenaBlue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={discoverUsers}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onLink={handleLink}
              isRequesting={linkingId === item.id}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.lg },
  title: { color: COLORS.foreground, fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: COLORS.arenaBlue, fontSize: 9, fontWeight: '900', letterSpacing: 3, marginTop: 4 },
  searchBar: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  searchInput: { backgroundColor: COLORS.card, borderRadius: 12, padding: SPACING.md, color: COLORS.foreground, borderWidth: 1, borderColor: COLORS.border, fontSize: 12, fontWeight: '900' },
  listContent: { padding: SPACING.lg },
  userCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: 16, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  avatarText: { color: COLORS.foreground, fontSize: 18, fontWeight: '900' },
  username: { color: COLORS.foreground, fontSize: 14, fontWeight: '900' },
  rank: { color: COLORS.textSecondary, fontSize: 8, fontWeight: '900', marginTop: 2 },
  linkButton: { backgroundColor: COLORS.foreground, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  disabledButton: { opacity: 0.5 },
  linkText: { color: COLORS.background, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});
