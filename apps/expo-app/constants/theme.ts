import { Platform } from 'react-native';

export const COLORS = {
  background: '#0B0E14',
  foreground: '#FFFFFF',
  arenaBlue: '#00D1FF',
  arenaPurple: '#BC00FF',
  arenaOrange: '#FF9E00',
  border: 'rgba(255, 255, 255, 0.1)',
  card: 'rgba(255, 255, 255, 0.05)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  error: '#FF4B4B',
  success: '#00FF94',
  tint: '#00D1FF',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: COLORS.arenaBlue,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: COLORS.arenaBlue,
  },
  dark: {
    text: COLORS.foreground,
    background: COLORS.background,
    tint: COLORS.arenaBlue,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: COLORS.arenaBlue,
  },
};

export const Fonts = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'sans-serif' }),
  medium: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'sans-serif-medium' }),
  bold: Platform.select({ ios: 'System', android: 'Roboto-Bold', default: 'sans-serif-bold' }),
  mono: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  rounded: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
};
