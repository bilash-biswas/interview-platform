import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, SPACING } from '@/constants/theme';
import io from 'socket.io-client';

const SOCKET_URL = 'http://192.168.10.235:8000';

interface BattlePlayer {
  userId: string;
  username: string;
  score: number;
}

export default function BattleArenaScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // States matching backend/web logic
  const [status, setStatus] = useState<'idle' | 'waiting' | 'active' | 'finished'>('idle');
  const [battleId, setBattleId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [players, setPlayers] = useState<Record<string, BattlePlayer>>({});
  const [localAnswered, setLocalAnswered] = useState(false);
  const [qCount, setQCount] = useState(5);

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
    socketRef.current = io(SOCKET_URL, {
      path: '/socket-quiz',
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Battle Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('waiting_for_opponent', () => {
      setStatus('waiting');
    });

    socketRef.current.on('battle_start', (data: any) => {
      console.log('Battle Start:', data);
      setBattleId(data.battleId);
      setOpponent(data.opponent);
      setQuestions(data.questions);
      if (user?.id) {
        setPlayers({ [socketRef.current.id]: { userId: user.id, username: user.username || '', score: 0 } });
      }
      setStatus('active');
      setCurrentIdx(0);
    });

    socketRef.current.on('battle_update', (data: any) => {
      console.log('Battle Update:', data);
      if (data.players) setPlayers(data.players);
      if (data.currentIdx !== undefined) {
        setCurrentIdx(data.currentIdx);
        setLocalAnswered(false);
      }
    });

    socketRef.current.on('battle_end', (data: any) => {
      console.log('Battle End:', data);
      setPlayers(data.players);
      setStatus('finished');
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  const startSearch = () => {
    if (!user) return;
    socketRef.current.emit('join_battle_queue', {
      userId: user.id,
      username: user.username,
      questionCount: qCount
    });
  };

  const submitAnswer = (answerIdx: number) => {
    if (localAnswered || status !== 'active' || !battleId) return;
    setLocalAnswered(true);
    socketRef.current.emit('submit_battle_answer', {
      battleId,
      questionIdx: currentIdx,
      answerIdx
    });
  };

  if (status === 'idle') {
    return (
      <View style={styles.searchingContainer}>
        <View style={styles.lobbyIconContainer}>
          <Text style={styles.searchIcon}>⚔️</Text>
        </View>
        <Text style={styles.searchingTitle}>1v1 MCQ BATTLE</Text>
        <Text style={styles.searchingSubtitle}>SELECT INTENSITY AND COMMENCE</Text>

        <View style={styles.intensityContainer}>
          {[5, 10, 20].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.intensityBtn, qCount === num && styles.intensityBtnActive]}
              onPress={() => setQCount(num)}
            >
              <Text style={[styles.intensityText, qCount === num && styles.intensityTextActive]}>{num} Qs</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={startSearch}>
          <Text style={styles.startBtnText}>ENTER QUEUE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>RETURN TO BASE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'waiting') {
    return (
      <View style={styles.searchingContainer}>
        <Animated.View style={[styles.searchBadge, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.searchIcon}>🔍</Text>
        </Animated.View>
        <Text style={styles.searchingTitle}>SCOUTING...</Text>
        <Text style={styles.searchingSubtitle}>LOCATING TACTICAL MATCH...</Text>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setStatus('idle')}>
          <Text style={styles.cancelText}>ABORT MISSION</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'finished') {
    const myScore = players[socketRef.current.id]?.score || 0;
    const oppScore = Object.values(players).find((p) => p.userId !== user?.id)?.score || 0;
    const isWinner = myScore > oppScore;
    const isDraw = myScore === oppScore;

    return (
      <View style={styles.container}>
        <View style={styles.finishedCard}>
          <Text style={styles.finishedEmoji}>{isDraw ? '🤝' : isWinner ? '🏆' : '💀'}</Text>
          <Text style={styles.finishedTitle}>COMBAT CONCLUDED</Text>

          <View style={styles.scoreBoard}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>YOU</Text>
              <Text style={styles.scoreValue}>{myScore}</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>{opponent}</Text>
              <Text style={[styles.scoreValue, { color: COLORS.error }]}>{oppScore}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={() => setStatus('idle')}>
            <Text style={styles.startBtnText}>NEW MISSION</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const question = questions[currentIdx];
  const myScore = players[socketRef.current.id]?.score || 0;
  const oppScore = Object.values(players).find((p) => p.userId !== user?.id)?.score || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.combatHeader}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>YOU</Text>
          <Text style={styles.scoreValueHeader}>{myScore}</Text>
        </View>

        <View style={styles.sectorInfo}>
          <Text style={styles.sectorLabel}>SECTOR</Text>
          <Text style={styles.sectorValue}>{currentIdx + 1} / {questions.length}</Text>
        </View>

        <View style={[styles.playerInfo, { alignItems: 'flex-end' }]}>
          <Text style={styles.playerName}>{opponent}</Text>
          <Text style={[styles.scoreValueHeader, { color: COLORS.error }]}>{oppScore}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.combatContent}>
        <Text style={styles.intelligenceLabel}>Intelligence Briefing</Text>
        <Text style={styles.questionText}>
          {question?.text || 'SYNCHRONIZING...'}
        </Text>

        <View style={styles.options}>
          {question?.options.map((opt: string, idx: number) => (
            <TouchableOpacity
              key={idx}
              disabled={localAnswered}
              style={[styles.optionBtn, localAnswered && styles.optionBtnDisabled]}
              onPress={() => submitAnswer(idx)}
            >
              <View style={styles.optLetterContainer}>
                <Text style={styles.optLetter}>{String.fromCharCode(65 + idx)}</Text>
              </View>
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Progress Matrix */}
      <View style={styles.progressContainer}>
        {questions.map((_, i) => (
          <View key={i} style={[
            styles.progressDot,
            i < currentIdx ? styles.progressPast : i === currentIdx ? styles.progressCurrent : styles.progressFuture
          ]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  lobbyIconContainer: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(255, 165, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  searchBadge: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0, 209, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xxl, borderWidth: 1, borderColor: COLORS.arenaBlue },
  searchIcon: { fontSize: 40 },
  searchingTitle: { color: COLORS.foreground, fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  searchingSubtitle: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '900', marginTop: 8, letterSpacing: 2, opacity: 0.5 },

  intensityContainer: { flexDirection: 'row', gap: 12, marginVertical: 40 },
  intensityBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  intensityBtnActive: { borderColor: 'rgba(255, 165, 0, 0.5)', backgroundColor: 'rgba(255, 165, 0, 0.05)' },
  intensityText: { color: COLORS.textSecondary, fontWeight: '900', textAlign: 'center' },
  intensityTextActive: { color: '#FFA500' },

  startBtn: { backgroundColor: '#FFA500', width: '100%', paddingVertical: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#FFA500', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 2 },

  cancelButton: { marginTop: 24, paddingVertical: 12 },
  cancelText: { color: 'rgba(255, 255, 255, 0.3)', fontSize: 10, fontWeight: '900', letterSpacing: 2 },

  combatHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.lg, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  playerInfo: { flex: 1 },
  sectorInfo: { alignItems: 'center' },
  playerName: { color: COLORS.textSecondary, fontSize: 8, fontWeight: '900', marginBottom: 4, letterSpacing: 1 },
  scoreValueHeader: { color: COLORS.arenaBlue, fontSize: 24, fontWeight: '900' },
  sectorLabel: { color: COLORS.textSecondary, fontSize: 8, fontWeight: '900' },
  sectorValue: { color: COLORS.foreground, fontSize: 16, fontWeight: '900' },

  combatContent: { padding: SPACING.xl },
  intelligenceLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '900', letterSpacing: 3, marginBottom: 20, opacity: 0.3 },
  questionText: { color: COLORS.foreground, fontSize: 22, fontWeight: '900', lineHeight: 30, marginBottom: 40 },

  options: { gap: 16 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  optionBtnDisabled: { opacity: 0.5 },
  optLetterContainer: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(0, 209, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  optLetter: { color: COLORS.arenaBlue, fontWeight: '900', fontSize: 12 },
  optionText: { color: COLORS.foreground, fontSize: 16, fontWeight: '700', flex: 1 },

  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 20 },
  progressDot: { height: 4, borderRadius: 2 },
  progressPast: { width: 24, backgroundColor: 'rgba(0, 209, 255, 0.3)' },
  progressCurrent: { width: 32, backgroundColor: COLORS.arenaBlue },
  progressFuture: { width: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)' },

  finishedCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  finishedEmoji: { fontSize: 80, marginBottom: 20 },
  finishedTitle: { color: COLORS.foreground, fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 40 },
  scoreBoard: { width: '100%', gap: 16, marginBottom: 60 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, padding: 24, borderRadius: 24, borderLeftWidth: 4, borderLeftColor: COLORS.arenaBlue },
  scoreLabel: { color: COLORS.textSecondary, fontWeight: '900' },
  scoreValue: { color: COLORS.arenaBlue, fontSize: 32, fontWeight: '900' }
});
