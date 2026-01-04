import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { COLORS, SPACING } from '../constants/theme';
import io from 'socket.io-client';

const SOCKET_URL = 'http://10.0.2.2:3005'; // Match web's quiz/battle service port

export default function BattleArenaScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [status, setStatus] = useState('SEARCHING'); // SEARCHING, MATCHED, COMBAT, FINISHED
  const [opponent, setOpponent] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const socketRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for searching
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Initialize Socket
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-queue', { userId: user?.id, username: user?.username });
    });

    socketRef.current.on('battle-matched', (data: any) => {
      setOpponent(data.opponent);
      setStatus('MATCHED');
      setTimeout(() => setStatus('COMBAT'), 2000);
    });

    socketRef.current.on('next-question', (question: any) => {
      setCurrentQuestion(question);
      setTimeLeft(15);
    });

    socketRef.current.on('battle-finished', (results: any) => {
      setStatus('FINISHED');
      Alert.alert('BATTLE OVER', results.winner === user?.id ? 'VICTORY SECURED' : 'DEFEAT SUSTAINED');
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleAnswer = (option: string) => {
    socketRef.current.emit('submit-answer', {
      battleId: 'mock-id',
      userId: user?.id,
      answer: option
    });
  };

  if (status === 'SEARCHING') {
    return (
      <View style={styles.searchingContainer}>
        <Animated.View style={[styles.searchBadge, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.searchIcon}>⚔️</Text>
        </Animated.View>
        <Text style={styles.searchingTitle}>SEARCHING FOR COMRADES</Text>
        <Text style={styles.searchingSubtitle}>LOCATING TACTICAL MATCH...</Text>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>ABORT MISSION</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'MATCHED') {
    return (
      <View style={styles.matchedContainer}>
        <View style={styles.matchSide}>
          <Text style={styles.sideName}>{user?.username}</Text>
          <View style={styles.sideAvatar}><Text style={styles.sideText}>YOU</Text></View>
        </View>
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.matchSide}>
          <View style={[styles.sideAvatar, { backgroundColor: COLORS.error }]}><Text style={styles.sideText}>OPP</Text></View>
          <Text style={styles.sideName}>{opponent?.username || 'ELITE_RECRUIT'}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Combat UI implementation */}
      <View style={styles.combatHeader}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{user?.username}</Text>
          <View style={styles.hpBar}><View style={[styles.hpFill, { width: '100%' }]} /></View>
        </View>
        <View style={styles.timerCircle}>
          <Text style={styles.timerValue}>{timeLeft}</Text>
        </View>
        <View style={[styles.playerInfo, { alignItems: 'flex-end' }]}>
          <Text style={styles.playerName}>{opponent?.username || 'OPPONENT'}</Text>
          <View style={styles.hpBar}><View style={[styles.hpFill, { width: '100%', backgroundColor: COLORS.error }]} /></View>
        </View>
      </View>

      <View style={styles.combatContent}>
        <Text style={styles.questionText}>
          {currentQuestion?.text || 'SYNCHRONIZING TACTICAL DATA...'}
        </Text>

        <View style={styles.options}>
          {['A', 'B', 'C', 'D'].map((opt) => (
            <TouchableOpacity key={opt} style={styles.optionBtn} onPress={() => handleAnswer(opt)}>
              <Text style={styles.optionLabel}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  searchBadge: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0, 209, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xxl, borderWidth: 1, borderColor: COLORS.arenaBlue },
  searchIcon: { fontSize: 40 },
  searchingTitle: { color: COLORS.foreground, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  searchingSubtitle: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '900', marginTop: 8, letterSpacing: 2 },
  cancelButton: { marginTop: 60, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  cancelText: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  matchedContainer: { flex: 1, backgroundColor: COLORS.background, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: SPACING.xl },
  matchSide: { alignItems: 'center' },
  sideAvatar: { width: 80, height: 80, borderRadius: 20, backgroundColor: COLORS.arenaBlue, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  sideText: { color: '#000', fontWeight: '900' },
  sideName: { color: COLORS.foreground, fontSize: 16, fontWeight: '900' },
  vsText: { color: COLORS.error, fontSize: 32, fontWeight: '900', fontStyle: 'italic' },
  combatHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.lg, alignItems: 'center' },
  playerInfo: { flex: 1 },
  playerName: { color: COLORS.foreground, fontSize: 10, fontWeight: '900', marginBottom: 4 },
  hpBar: { height: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 },
  hpFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 2 },
  timerCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: COLORS.arenaBlue, justifyContent: 'center', alignItems: 'center', marginHorizontal: SPACING.md },
  timerValue: { color: COLORS.arenaBlue, fontSize: 20, fontWeight: '900' },
  combatContent: { flex: 1, padding: SPACING.xl, justifyContent: 'center' },
  questionText: { color: COLORS.foreground, fontSize: 20, fontWeight: '900', textAlign: 'center', lineHeight: 28, marginBottom: SPACING.xxl },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  optionBtn: { width: '48%', backgroundColor: COLORS.card, padding: SPACING.xl, borderRadius: 16, marginBottom: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  optionLabel: { color: COLORS.foreground, fontSize: 18, fontWeight: '900' }
});
