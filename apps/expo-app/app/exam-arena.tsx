import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetExamDetailsQuery, useGetExamQuestionsQuery, useSubmitExamAnswersMutation } from '@/redux/services/examApi';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, SPACING } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ExamArenaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const { data: exam, isLoading: loadingExam } = useGetExamDetailsQuery(id as string);
  const { data: questions, isLoading: loadingQuestions } = useGetExamQuestionsQuery(id as string);
  const [submitAnswers, { isLoading: isSubmitting }] = useSubmitExamAnswersMutation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (exam) {
      const now = new Date().getTime();
      const start = new Date(exam.startTime).getTime();
      const end = start + exam.totalTime * 60 * 1000;

      if (now < start) {
        setTimeLeft(Math.floor((start - now) / 1000));
      } else if (now < end) {
        setIsStarted(true);
        setTimeLeft(Math.floor((end - now) / 1000));
      } else {
        setTimeLeft(0);
      }
    }
  }, [exam]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (isStarted) handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isStarted]);

  const handleSelect = (optionIdx: number) => {
    if (!questions) return;
    setAnswers({
      ...answers,
      [questions[currentIndex]._id || questions[currentIndex].id]: optionIdx
    });
  };

  const handleSubmit = async () => {
    if (!user || !id || !exam) return;
    try {
      await submitAnswers({
        examId: id as string,
        body: {
          studentId: user.id,
          username: user.username,
          answers,
          timeSpent: exam.totalTime * 60 - timeLeft
        }
      }).unwrap();
      Alert.alert('SUCCESS', 'Tactical data transmitted. Reviewing results.');
      router.back();
    } catch (err) {
      Alert.alert('FAILURE', 'Data transmission failed.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loadingExam || loadingQuestions) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.arenaBlue} />
        <Text style={styles.loadingText}>SYNCHRONIZING DATASTREAM...</Text>
      </View>
    );
  }

  if (!isStarted && timeLeft > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>DEPLOYMENT PENDING</Text>
          </View>
          <Text style={styles.prepTitle}>PREPARE FOR</Text>
          <Text style={styles.battleTitle}>BATTLE</Text>

          <View style={styles.timerBadge}>
            <Text style={styles.timerValue}>
              T-MINUS: {Math.floor(timeLeft / 3600)}H {Math.floor((timeLeft % 3600) / 60)}M {timeLeft % 60}S
            </Text>
          </View>

          <View style={styles.examInfoCard}>
            <Text style={styles.infoTitle}>{exam?.title}</Text>
            <Text style={styles.infoDesc}>{exam?.description}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>MODULES</Text>
                <Text style={styles.statValue}>{exam?.questionCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>WINDOW</Text>
                <Text style={styles.statValue}>{exam?.totalTime}m</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>PENALTY</Text>
                <Text style={[styles.statValue, { color: COLORS.error }]}>-{exam?.negativeMarkingValue}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.abortBtn} onPress={() => router.back()}>
            <Text style={styles.abortText}>RETURN TO BASE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (timeLeft === 0 && !isStarted) {
    return (
      <View style={styles.center}>
        <Text style={styles.closedEmoji}>🛑</Text>
        <Text style={styles.closedTitle}>ARENA CLOSED</Text>
        <Text style={styles.closedDesc}>The deployment window for this sector has concluded.</Text>
        <TouchableOpacity style={styles.abortBtn} onPress={() => router.back()}>
          <Text style={styles.abortText}>RETURN TO BASE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQ = questions![currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE DEPLOYMENT</Text>
          </View>
          <Text style={styles.examTitleHeader} numberOfLines={1}>{exam?.title}</Text>
          <Text style={styles.phaseLabel}>PHASE {currentIndex + 1} OF {questions?.length}</Text>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>EXPIRATION</Text>
          <Text style={styles.timerCount}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionCard}>
          <View style={styles.intelRow}>
            <View style={styles.intelDot} />
            <Text style={styles.intelText}>DECRYPTION PHASE</Text>
          </View>

          <Text style={styles.questionText}>{currentQ.text}</Text>

          <View style={styles.optionsGrid}>
            {currentQ.options.map((option: string, idx: number) => {
              const questionId = currentQ._id || currentQ.id;
              const isSelected = answers[questionId] === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.optionBtn, isSelected && styles.selectedOption]}
                  onPress={() => handleSelect(idx)}
                >
                  <View style={[styles.optionIndex, isSelected && styles.selectedOptionIndex]}>
                    <Text style={[styles.optionIndexText, isSelected && styles.selectedOptionIndexText]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex(prev => prev - 1)}
          style={[styles.navBtn, currentIndex === 0 && styles.disabledBtn]}
        >
          <Text style={styles.navBtnText}>BACKTRACK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, currentIndex === questions!.length - 1 && styles.submitBtn]}
          onPress={currentIndex === questions!.length - 1 ? handleSubmit : () => setCurrentIndex(prev => prev + 1)}
          disabled={isSubmitting}
        >
          <Text style={styles.actionBtnText}>
            {currentIndex === questions!.length - 1 ? (isSubmitting ? 'TRANSMITTING...' : 'FINALIZE MISSION') : 'PROCEED'}
          </Text>
        </TouchableOpacity>
      </View>
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
    padding: SPACING.xl,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 20,
  },
  pendingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.2)',
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
    marginBottom: 20,
  },
  pendingText: {
    color: COLORS.arenaBlue,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
  },
  prepTitle: {
    color: COLORS.foreground,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  battleTitle: {
    color: COLORS.arenaBlue,
    fontSize: 48,
    fontWeight: '900',
    fontStyle: 'italic',
    marginTop: -10,
    marginBottom: 30,
  },
  timerBadge: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 40,
  },
  timerValue: {
    color: COLORS.foreground,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  examInfoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 32,
    padding: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    color: COLORS.foreground,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  infoDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.5,
  },
  statValue: {
    color: COLORS.arenaBlue,
    fontSize: 20,
    fontWeight: '900',
  },
  abortBtn: {
    marginTop: 40,
    paddingVertical: 12,
  },
  abortText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  closedEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  closedTitle: {
    color: COLORS.foreground,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
  },
  closedDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    marginBottom: 4,
  },
  liveText: {
    color: COLORS.arenaBlue,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  examTitleHeader: {
    color: COLORS.foreground,
    fontSize: 14,
    fontWeight: '900',
  },
  phaseLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerLabel: {
    color: COLORS.textSecondary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    opacity: 0.6,
  },
  timerCount: {
    color: COLORS.arenaBlue,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 32,
    padding: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  intelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    opacity: 0.3,
  },
  intelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.arenaBlue,
  },
  intelText: {
    color: COLORS.foreground,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
  },
  questionText: {
    color: COLORS.foreground,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: 40,
  },
  optionsGrid: {
    gap: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
    borderColor: COLORS.arenaBlue,
  },
  optionIndex: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedOptionIndex: {
    backgroundColor: COLORS.arenaBlue,
  },
  optionIndexText: {
    color: COLORS.textSecondary,
    fontWeight: '900',
    fontSize: 12,
  },
  selectedOptionIndexText: {
    color: '#fff',
  },
  optionText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  selectedOptionText: {
    color: COLORS.foreground,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabledBtn: {
    opacity: 0.2,
  },
  navBtnText: {
    color: COLORS.foreground,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  actionBtn: {
    flex: 2,
    backgroundColor: COLORS.arenaBlue,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: COLORS.success,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  }
});
