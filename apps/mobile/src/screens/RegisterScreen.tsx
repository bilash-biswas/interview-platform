import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, SPACING } from '../constants/theme';
import { authApi } from '../api/authService';
import { setCredentials } from '../redux/slices/authSlice';
import { setAuthToken } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ onSwitch }: { onSwitch: () => void }) {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('All sectors must be filled.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const data = await authApi.register({ username, email, password });
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('token', data.token);
      setAuthToken(data.token);
      dispatch(setCredentials({ user: data.user, token: data.token }));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>A</Text>
            </View>
            <Text style={styles.title}>RECRUITMENT</Text>
            <Text style={styles.subtitle}>INITIATING NEW PROTOCOL</Text>
          </View>

          <View style={styles.form}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>CALLSIGN (USERNAME)</Text>
              <TextInput
                style={styles.input}
                placeholder="WARRIOR_01"
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

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
              <Text style={styles.label}>SECURE PASSCODE</Text>
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
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>INITIATE LINK</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton} onPress={onSwitch}>
              <Text style={styles.switchText}>ALREADY RECRUITED? <Text style={styles.switchTextBold}>IDENTIFY NOW</Text></Text>
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
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: COLORS.arenaOrange,
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
    color: COLORS.arenaOrange,
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
    backgroundColor: COLORS.arenaOrange,
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
    marginBottom: SPACING.xl,
  },
  switchText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  switchTextBold: {
    color: COLORS.arenaOrange,
    fontWeight: '900',
  },
});
