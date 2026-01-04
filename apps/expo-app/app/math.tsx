import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useGetMathQuestionsQuery } from '@/redux/services/mathApi';
import MathRender from '@/components/MathRender';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MathScreen() {
  const router = useRouter();
  const { data: questions, isLoading, error } = useGetMathQuestionsQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading math questions...</Text>
      </View>
    );
  }

  if (error || !questions || questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load questions.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowResult(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Math Challenge', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.progressText}>Question {currentIndex + 1} of {questions.length}</Text>
        </View>

        <View style={styles.questionContainer}>
          <MathRender text={currentQuestion.text} fontSize={22} />
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            let borderColor = '#E5E7EB';
            let backgroundColor = '#FFFFFF';
            let textColor = '#374151';

            if (showResult) {
              if (index === currentQuestion.correct_option_index) {
                borderColor = '#10B981';
                backgroundColor = '#ECFDF5';
                textColor = '#047857';
              } else if (index === selectedOption) {
                borderColor = '#EF4444';
                backgroundColor = '#FEF2F2';
                textColor = '#B91C1C';
              }
            } else if (selectedOption === index) {
              borderColor = '#3B82F6';
              backgroundColor = '#EFF6FF';
            }

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleOptionClick(index)}
                disabled={showResult}
                style={[
                  styles.optionButton,
                  { borderColor, backgroundColor }
                ]}
              >
                <MathRender text={option} fontSize={18} color={textColor} style={{ height: 60 }} />
              </TouchableOpacity>
            );
          })}
        </View>

        {showResult && (
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={nextQuestion}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Start Over'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 10, color: '#6B7280', fontSize: 16 },
  errorText: { color: '#EF4444', fontSize: 16, marginBottom: 20 },
  header: { marginBottom: 20, alignItems: 'center' },
  progressText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    minHeight: 150,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  optionsContainer: { gap: 12 },
  optionButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    minHeight: 80,
    justifyContent: 'center',
  },
  footer: { marginTop: 30, alignItems: 'center' },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  backButton: { padding: 10, backgroundColor: '#E5E7EB', borderRadius: 8 },
  backButtonText: { color: '#374151' }
});
