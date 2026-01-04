import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { examApi } from '../api/examService';

export default function ExamArenaScreen({ route, navigation }: any) {
  const { examId = '659123abc' } = route?.params || {}; // Mock ID if needed
  const [exam, setExam] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExam();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchExam = async () => {
    try {
      // In a real scenario, we'd fetch based on examId
      // For now, mock a tactical exam if API is not fully ready
      const mockExam = {
        title: 'TACTICAL SYSTEMS AUDIT',
        questions: [
          {
            id: 'q1',
            text: 'Which protocol is used for real-time tactical data updates in the Arena infrastructure?',
            options: ['HTTP/1.1', 'WebSockets', 'SMTP', 'FTP'],
            correctAnswer: 'WebSockets'
          },
          {
            id: 'q2',
            text: 'What is the primary objective of the Redux state management in our mobile terminal?',
            options: ['Direct DOM manipulation', 'Global state synchronization', 'Local file storage', 'CSS processing'],
            correctAnswer: 'Global state synchronization'
          }
        ]
      };
      setExam(mockExam);
    } catch (err) {
      Alert.alert('LINK FAILURE', 'Could not establish connection to exam server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [exam.questions[currentIndex].id]: option });
  };

  const nextQuestion = () => {
    if (currentIndex < exam.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleAutoSubmit = () => {
    Alert.alert('TERMINAL TIMEOUT', 'Time has expired. Autosubmitting tactical data.');
    // Logic for submission
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) return <View style={styles.loading}><ActivityIndicator color={COLORS.arenaBlue} /></View>;

  const currentQuestion = exam.questions[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.examTitle}>{exam.title}</Text>
          <Text style={styles.questionCount}>PHASE {currentIndex + 1} OF {exam.questions.length}</Text>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option: string) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  answers[currentQuestion.id] === option && styles.selectedOption
                ]}
                onPress={() => handleSelect(option)}
              >
                <View style={[
                  styles.optionRadio,
                  answers[currentQuestion.id] === option && styles.selectedRadio
                ]} />
                <Text style={[
                  styles.optionText,
                  answers[currentQuestion.id] === option && styles.selectedOptionText
                ]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
          onPress={prevQuestion}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>PREVIOUS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={currentIndex === exam.questions.length - 1 ? () => { } : nextQuestion}
        >
          <Text style={styles.navButtonText}>
            {currentIndex === exam.questions.length - 1 ? 'SUBMIT DATA' : 'NEXT PHASE'}
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
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  examTitle: {
    color: COLORS.foreground,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  questionCount: {
    color: COLORS.arenaBlue,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  },
  timerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  questionText: {
    color: COLORS.foreground,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    marginBottom: SPACING.xl,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: COLORS.arenaBlue,
    backgroundColor: 'rgba(0, 209, 255, 0.05)',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
  },
  selectedRadio: {
    borderColor: COLORS.arenaBlue,
    backgroundColor: COLORS.arenaBlue,
  },
  optionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: COLORS.foreground,
    fontWeight: '900',
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: 'space-between',
  },
  navButton: {
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabledButton: {
    opacity: 0.3,
  },
  navButtonText: {
    color: COLORS.foreground,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
