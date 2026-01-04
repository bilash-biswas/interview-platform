import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, SPACING } from '../constants/theme';
import { authApi } from '../api/authService';
import { setCredentials } from '../redux/slices/authSlice';
import { setAuthToken } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ onSwitch }: { onSwitch: () => void }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Credentials required.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('token', data.token);
      setAuthToken(data.token);
      dispatch(setCredentials({ user: data.user, token: data.token }));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.title}>IDENTITY CHECK</Text>
          <Text style={styles.subtitle}>SECURE SECTOR ACCESS</Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="recruit@arena.com"
              placeholderTextColor="rgba(255, 255, 255, 0.2)"
              value={email}
              onChangeText={setEmail}
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
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>AUTHORIZE ENTRY</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={onSwitch}>
            <Text style={styles.switchText}>NEW RECRUIT? <Text style={styles.switchTextBold}>REGISTER NOW</Text></Text>
          </TouchableOpacity>
        </View>
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
    padding: SPACING.xl,
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
