import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAnalyzeTextMutation } from '@/redux/services/aiApi';

export default function AIScreen() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [analyzeText, { data: result, isLoading }] = useAnalyzeTextMutation();
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setError(null);
    try {
      await analyzeText({ text }).unwrap();
    } catch (err) {
      setError('Analysis failed. Connection refused or service offline.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'AI Command Center', headerShown: true }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>AI Intelligence</Text>
            <Text style={styles.subtitle}>Analyze transmissions and data logs.</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter data for analysis..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity
              onPress={handleAnalyze}
              disabled={isLoading || !text.trim()}
              style={[
                styles.analyzeButton,
                (isLoading || !text.trim()) && styles.disabledButton
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.analyzeButtonText}>ANALYZE DATA</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorCard}>
              <Ionicons name="warning" size={24} color="#B91C1C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {result && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>ANALYSIS COMPLETE</Text>
                <View style={[styles.badge, result.analysis.sentiment === 'Positive' ? styles.badgeSuccess : result.analysis.sentiment === 'Negative' ? styles.badgeError : styles.badgeWarning]}>
                  <Text style={[styles.badgeText, result.analysis.sentiment === 'Positive' ? styles.badgeTextSuccess : result.analysis.sentiment === 'Negative' ? styles.badgeTextError : styles.badgeTextWarning]}>
                    {result.analysis.sentiment.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>CONFIDENCE</Text>
                  <Text style={styles.metricValue}>{Math.round(result.analysis.confidence * 100)}%</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>WORD COUNT</Text>
                  <Text style={styles.metricValue}>{result.analysis.word_count}</Text>
                </View>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.cardTitle}>SUMMARY</Text>
                <Text style={styles.summaryText}>{result.analysis.summary}</Text>
              </View>

              <View style={styles.keywordsContainer}>
                <Text style={styles.cardTitle}>KEY VECTORS</Text>
                <View style={styles.keywordList}>
                  {result.analysis.keywords.map((kw, idx) => (
                    <View key={idx} style={styles.keywordTag}>
                      <Text style={styles.keywordText}>#{kw}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#1F2937', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  inputContainer: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderTopWidth: 4, borderColor: '#6366F1', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  input: { fontSize: 16, color: '#1F2937', minHeight: 100, textAlignVertical: 'top', marginBottom: 16 },
  analyzeButton: { backgroundColor: '#4F46E5', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 12 },
  disabledButton: { backgroundColor: '#A5B4FC' },
  analyzeButtonText: { color: 'white', fontWeight: '700', letterSpacing: 1 },

  errorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, marginTop: 20, borderWidth: 1, borderColor: '#FECACA', gap: 12 },
  errorText: { color: '#B91C1C', flex: 1, fontWeight: '500' },

  resultContainer: { marginTop: 24, gap: 16 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  resultTitle: { fontSize: 12, fontWeight: '900', color: '#6B7280', letterSpacing: 1.5 },

  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeSuccess: { backgroundColor: '#ECFDF5' },
  badgeWarning: { backgroundColor: '#FFFBEB' },
  badgeError: { backgroundColor: '#FEF2F2' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextSuccess: { color: '#059669' },
  badgeTextWarning: { color: '#D97706' },
  badgeTextError: { color: '#DC2626' },

  metricRow: { flexDirection: 'row', gap: 16 },
  metricCard: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  metricLabel: { fontSize: 10, fontWeight: '900', color: '#9CA3AF', marginBottom: 4 },
  metricValue: { fontSize: 24, fontWeight: '800', color: '#111827' },

  summaryCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { fontSize: 10, fontWeight: '900', color: '#9CA3AF', marginBottom: 8, letterSpacing: 1 },
  summaryText: { fontSize: 15, color: '#374151', lineHeight: 22 },

  keywordsContainer: { marginTop: 8 },
  keywordList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  keywordTag: { backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  keywordText: { color: '#4F46E5', fontWeight: '600', fontSize: 12 },
});
