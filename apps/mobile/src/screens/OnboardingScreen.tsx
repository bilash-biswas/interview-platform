import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    title: 'TACTICAL RECRUITMENT',
    description: 'Join the elite ranks of tactical engineers ready for combat-ready preparation.',
    badge: '⚔️',
  },
  {
    title: 'COMBAT TRAINING',
    description: 'Simulate high-stakes interviews with our real-time 1v1 battle arena.',
    badge: '🔥',
  },
  {
    title: 'GLOBAL BROADCAST',
    description: 'Share your progress and connect with fellow recruits in the tactical sector.',
    badge: '📡',
  },
];

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.stepIndicator}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentStep ? COLORS.arenaBlue : 'rgba(255, 255, 255, 0.2)' },
              ]}
            />
          ))}
        </View>

        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{STEPS[currentStep].badge}</Text>
        </View>

        <Text style={styles.title}>{STEPS[currentStep].title}</Text>
        <Text style={styles.description}>{STEPS[currentStep].description}</Text>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentStep === STEPS.length - 1 ? 'ENTER ARENA' : 'NEXT PHASE'}
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
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    marginBottom: SPACING.xxl,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  badgeContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  badgeText: {
    fontSize: 40,
  },
  title: {
    color: COLORS.foreground,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.arenaBlue,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 12,
    position: 'absolute',
    bottom: SPACING.xxl,
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
