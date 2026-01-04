import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../constants/theme';
import { useRegisterMutation } from '../redux/services/authApi';
import { setCredentials } from '../redux/features/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleRegister = async () => {
    const { username, email, password, confirmPassword } = formData;
    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    try {
      const data = await register({ username, email, password }).unwrap();
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('token', data.token);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.data?.error || 'Registration failed.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>A</Text>
            </View>
            <Text style={styles.title}>NEW RECRUIT</Text>
            <Text style={styles.subtitle}>INITIALIZE YOUR PROFILE</Text>
          </View>

          <View style={styles.form}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>USERNAME</Text>
              <TextInput
                style={styles.input}
                placeholder="arena_master"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="recruit@arena.com"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>ACCESS PASSCODE</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>CONFIRM PASSCODE</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>CREATE ACCOUNT</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton} onPress={() => router.push('/login' as any)}>
              <Text style={styles.switchText}>ALREADY REGISTERED? <Text style={styles.switchTextBold}>LOGIN HERE</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: COLORS.arenaBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    color: '#000',
    fontSize: 28,
    fontWeight: '900',
  },
  title: {
    color: COLORS.foreground,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.arenaBlue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    color: COLORS.foreground,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.arenaBlue,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.2)',
  },
  switchButton: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  switchText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  switchTextBold: {
    color: COLORS.arenaBlue,
    fontWeight: '900',
  },
});
