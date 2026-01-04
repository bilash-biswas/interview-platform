import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, SPACING } from '@/constants/theme';
import { initSocket, getSocket } from '@/redux/services/socket';
import { addMessage, setOnlineUsers, setRoom, setMessages } from '@/redux/features/chatSlice';
import { useGetChatHistoryQuery, useGetConversationsQuery } from '@/redux/services/chatApi';
import { useGetFriendsQuery } from '@/redux/services/socialApi';
import { RootState } from '@/redux/store';
import { IconSymbol } from '@/components/ui/icon-symbol';

const MessageBubble = ({ message, isMine }: { message: any; isMine: boolean }) => (
  <View style={[styles.bubbleContainer, isMine ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
    <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
      <Text style={[styles.messageText, isMine && styles.myMessageText]}>{message.content}</Text>
    </View>
    <Text style={styles.timestamp}>
      {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}
    </Text>
  </View>
);

export default function ChatScreen() {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.chat.messages);
  const currentRoom = useSelector((state: RootState) => state.chat.currentRoom);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Queries
  const { data: conversations, refetch: refetchConversations } = useGetConversationsQuery(user?.id || '', { skip: !user?.id });
  const { data: friends } = useGetFriendsQuery(user?.id || '', { skip: !user?.id });
  const { data: history, isFetching: loadingHistory } = useGetChatHistoryQuery(currentRoom || '', { skip: !currentRoom });

  useEffect(() => {
    if (history) {
      dispatch(setMessages(history));
    }
  }, [history]);

  useEffect(() => {
    if (token) {
      const socket = initSocket(token);
      socket.on('receive_message', (msg: any) => {
        dispatch(addMessage(msg));
        refetchConversations();
      });
      return () => { socket.disconnect(); };
    }
  }, [token]);

  const handleSelectConversation = (otherUserId: string) => {
    const roomId = [user?.id, otherUserId].sort().join('_');
    dispatch(setRoom(roomId));
    const socket = getSocket();
    if (socket) socket.emit('join_room', roomId);
  };

  const handleSend = () => {
    if (!inputText.trim() || !currentRoom) return;
    const socket = getSocket();
    if (socket) {
      const recipientId = currentRoom.split('_').find(id => id !== user?.id);
      socket.emit('send_message', {
        content: inputText,
        roomId: currentRoom,
        senderId: user?.id,
        senderName: user?.username,
        recipientId
      });
      setInputText('');
    }
  };

  if (currentRoom) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => dispatch(setRoom(''))} style={styles.backBtn}>
            <Text style={styles.backText}>BACK</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.chatTitle}>SECURE UPLINK</Text>
            <Text style={styles.chatSubtitle}>TARGET ID: {currentRoom.slice(-8)}</Text>
          </View>
        </View>

        <View style={styles.chatArea}>
          {loadingHistory && messages.length === 0 ? (
            <ActivityIndicator color={COLORS.arenaBlue} style={{ flex: 1 }} />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={({ item }) => <MessageBubble message={item} isMine={item.senderId === user?.id} />}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
              showsVerticalScrollIndicator={false}
            />
          )}

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
            <View style={styles.inputArea}>
              <TextInput
                style={styles.input}
                placeholder="INPUT DATA..."
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Text style={styles.sendIcon}>🚀</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TACTICAL COMMS</Text>
        <Text style={styles.headerSubtitle}>ACTIVE CHANNELS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {conversations && conversations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RECENT TRANSMISSIONS</Text>
            {conversations.map((conv: any) => {
              const otherId = conv.lastMessage.senderId === user?.id ? conv.lastMessage.recipientId : conv.lastMessage.senderId;
              const otherName = conv.lastMessage.senderId === user?.id ? (conv.lastMessage.recipientName || 'ALLY') : conv.lastMessage.senderName;
              return (
                <TouchableOpacity
                  key={conv._id}
                  style={styles.convItem}
                  onPress={() => handleSelectConversation(otherId)}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{otherName?.[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.convInfo}>
                    <Text style={styles.convName}>{otherName}</Text>
                    <Text style={styles.convLast} numberOfLines={1}>{conv.lastMessage.content}</Text>
                  </View>
                  <Text style={styles.convTime}>{new Date(conv.lastMessage.createdAt).getHours()}:{new Date(conv.lastMessage.createdAt).getMinutes()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONNEL REGISTRY</Text>
          {friends?.map((friend: any) => {
            const friendId = friend.requester === user?.id ? friend.recipient : friend.requester;
            const friendName = friend.requester === user?.id ? friend.recipientName : friend.requesterName;
            return (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendItem}
                onPress={() => handleSelectConversation(friendId)}
              >
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>{friendName?.[0]?.toUpperCase()}</Text>
                </View>
                <Text style={styles.friendName}>{friendName}</Text>
                <View style={styles.arrow}>
                  <IconSymbol name="chevron.right" size={14} color={COLORS.arenaBlue} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 30, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '900', letterSpacing: 4, opacity: 0.5 },
  headerSubtitle: { color: COLORS.foreground, fontSize: 32, fontWeight: '900', marginTop: 4 },

  scrollContent: { padding: 20 },
  section: { marginBottom: 40 },
  sectionTitle: { color: COLORS.arenaBlue, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 20, opacity: 0.6 },

  convItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  avatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(0, 209, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.arenaBlue, fontWeight: '900', fontSize: 18 },
  convInfo: { flex: 1, marginLeft: 16 },
  convName: { color: COLORS.foreground, fontWeight: '900', fontSize: 16 },
  convLast: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4, opacity: 0.6 },
  convTime: { color: COLORS.textSecondary, fontSize: 8, fontWeight: '900', opacity: 0.4 },

  friendItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 },
  friendAvatar: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  friendAvatarText: { color: COLORS.foreground, fontSize: 12, fontWeight: '900', opacity: 0.5 },
  friendName: { color: COLORS.foreground, fontWeight: '700', fontSize: 14, marginLeft: 12, flex: 1 },
  arrow: { opacity: 0.3 },

  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 12, marginRight: 16, borderRightWidth: 1, borderRightColor: COLORS.border },
  backText: { color: COLORS.arenaBlue, fontWeight: '900', fontSize: 10 },
  chatTitle: { color: COLORS.textSecondary, fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  chatSubtitle: { color: COLORS.foreground, fontSize: 14, fontWeight: '900' },

  chatArea: { flex: 1 },
  messageList: { padding: 20 },
  bubbleContainer: { marginBottom: 20 },
  bubble: { maxWidth: '80%', padding: 16, borderRadius: 20 },
  myBubble: { backgroundColor: COLORS.arenaBlue, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: COLORS.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  messageText: { color: COLORS.foreground, fontSize: 14, fontWeight: '600' },
  myMessageText: { color: '#000', fontWeight: '800' },
  timestamp: { color: COLORS.textSecondary, fontSize: 8, fontWeight: '900', marginTop: 4, opacity: 0.3 },

  inputArea: { flexDirection: 'row', padding: 16, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'center' },
  input: { flex: 1, backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12, color: COLORS.foreground, fontSize: 14, maxHeight: 100 },
  sendButton: { width: 50, height: 50, backgroundColor: COLORS.arenaBlue, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  sendIcon: { fontSize: 20 }
});
