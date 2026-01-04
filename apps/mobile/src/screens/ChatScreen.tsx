import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { COLORS, SPACING } from '../constants/theme';

const MessageBubble = ({ message, isMine }: { message: any; isMine: boolean }) => (
  <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
    <Text style={[styles.messageText, isMine && styles.myMessageText]}>{message.content}</Text>
    <Text style={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
  </View>
);

export default function ChatScreen({ route }: any) {
  const { recipientName = 'COMRADE_01' } = route?.params || {};
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<any[]>([
    { id: '1', content: 'Tactical link established.', senderId: '0', timestamp: new Date() },
    { id: '2', content: 'Ready for deployment in the Battle Arena?', senderId: '0', timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      content: inputText,
      senderId: user?.id,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.recipientName}>{recipientName}</Text>
        <View style={styles.statusDot} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageBubble message={item} isMine={item.senderId === user?.id} />}
        contentContainerStyle={styles.messageList}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="TYPE ENCRYPTED MESSAGE..."
            placeholderTextColor="rgba(255, 255, 255, 0.2)"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendIcon}>🚀</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', alignItems: 'center' },
  recipientName: { color: COLORS.foreground, fontSize: 16, fontWeight: '900', letterSpacing: 1, marginRight: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  messageList: { padding: SPACING.lg },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: SPACING.md },
  myBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.arenaBlue, borderBottomRightRadius: 4 },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  messageText: { color: COLORS.foreground, fontSize: 14, fontWeight: '500' },
  myMessageText: { color: '#000', fontWeight: '700' },
  timestamp: { fontSize: 8, color: 'rgba(0, 0, 0, 0.3)', marginTop: 4, alignSelf: 'flex-end', fontWeight: '900' },
  inputArea: { flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, color: COLORS.foreground, fontSize: 12, fontWeight: '600' },
  sendButton: { width: 45, height: 45, backgroundColor: COLORS.arenaBlue, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: SPACING.sm },
  sendIcon: { fontSize: 18 }
});
