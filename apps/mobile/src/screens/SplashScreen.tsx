import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCredentials } from '../redux/slices/authSlice';
import { setAuthToken } from '../api/client';
import { COLORS } from '../constants/theme';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        const [userStr, token] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
        ]);

        if (userStr && token) {
          const user = JSON.parse(userStr);
          setAuthToken(token);
          dispatch(setCredentials({ user, token }));
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setTimeout(onFinish, 2000);
      }
    };

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    init();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>A</Text>
        </View>
        <Text style={styles.title}>ARENA</Text>
        <Text style={styles.subtitle}>TACTICAL PREPARATION</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.arenaBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.arenaBlue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '900',
  },
  title: {
    color: COLORS.foreground,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.arenaBlue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    opacity: 0.8,
  },
});
