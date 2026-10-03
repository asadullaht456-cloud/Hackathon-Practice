/**
 * Chalo App Theme
 * Primary Color: #3b8132 (Pakistan Green / Transit Green)
 * Supports: Light, Dark, and Glare (high-contrast sunlight) modes.
 */

import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';
import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'glare';

export const NetworkColors = {
  metrobus: '#E53935', // Lahore Metrobus Red Line
  orange: '#F57C00',   // Orange Line Metro Train
  speedo: '#1976D2',   // Speedo Feeder Bus
  student: '#8E24AA',  // Student Zero-Fare Violet
} as const;

export const Colors = {
  light: {
    primary: '#3b8132',
    primaryContainer: '#dcf4d5',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#0f380a',

    secondary: '#4b6354',
    secondaryContainer: '#cde8d5',
    onSecondary: '#ffffff',
    onSecondaryContainer: '#072013',

    background: '#f8fafc',
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9',
    onSurface: '#0f172a',
    onSurfaceVariant: '#475569',

    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',

    border: '#e2e8f0',
    borderStrong: '#cbd5e1',

    card: '#ffffff',
    cardElevated: '#ffffff',

    error: '#dc2626',
    onError: '#ffffff',
    errorContainer: '#fee2e2',
    onErrorContainer: '#7f1d1d',

    success: '#16a34a',
    warning: '#f59e0b',
    info: '#0284c7',

    network: NetworkColors,
  },

  dark: {
    primary: '#4ade80',
    primaryContainer: '#1c4a17',
    onPrimary: '#052e03',
    onPrimaryContainer: '#86efac',

    secondary: '#b1ccba',
    secondaryContainer: '#344b3d',
    onSecondary: '#1c3528',
    onSecondaryContainer: '#cde8d5',

    background: '#0f172a',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    onSurface: '#f8fafc',
    onSurfaceVariant: '#cbd5e1',

    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',

    border: '#334155',
    borderStrong: '#475569',

    card: '#1e293b',
    cardElevated: '#243247',

    error: '#f87171',
    onError: '#450a0a',
    errorContainer: '#7f1d1d',
    onErrorContainer: '#fecaca',

    success: '#22c55e',
    warning: '#fbbf24',
    info: '#38bdf8',

    network: NetworkColors,
  },

  /**
   * High-contrast Glare Mode:
   * Optimized for strong, direct Pakistani outdoor sunlight (50,000+ lux).
   * High-contrast black on pure white, heavy borders (2px), bold outlines, and high readability.
   */
  glare: {
    primary: '#1b5e20',
    primaryContainer: '#a3e635',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#000000',

    secondary: '#000000',
    secondaryContainer: '#e5e7eb',
    onSecondary: '#ffffff',
    onSecondaryContainer: '#000000',

    background: '#ffffff',
    surface: '#ffffff',
    surfaceVariant: '#f3f4f6',
    onSurface: '#000000',
    onSurfaceVariant: '#111827',

    text: '#000000',
    textSecondary: '#111827',
    textMuted: '#374151',

    border: '#000000',
    borderStrong: '#000000',

    card: '#ffffff',
    cardElevated: '#f9fafb',

    error: '#991b1b',
    onError: '#ffffff',
    errorContainer: '#fee2e2',
    onErrorContainer: '#000000',

    success: '#15803d',
    warning: '#b45309',
    info: '#0369a1',

    network: {
      metrobus: '#b91c1c',
      orange: '#c2410c',
      speedo: '#0369a1',
      student: '#6b21a8',
    },
  },
} as const;

export type AppColors = typeof Colors.light;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
  nine: 48,
  ten: 64,
} as const;

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    mono: 'monospace',
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * Creates React Native Paper MD3 Theme matching Chalo design tokens
 */
export function getPaperTheme(mode: ThemeMode): MD3Theme {
  const isDark = mode === 'dark';
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  const currentColors = Colors[mode];

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: currentColors.primary,
      primaryContainer: currentColors.primaryContainer,
      onPrimary: currentColors.onPrimary,
      onPrimaryContainer: currentColors.onPrimaryContainer,
      secondary: currentColors.secondary,
      secondaryContainer: currentColors.secondaryContainer,
      onSecondary: currentColors.onSecondary,
      onSecondaryContainer: currentColors.onSecondaryContainer,
      background: currentColors.background,
      surface: currentColors.surface,
      surfaceVariant: currentColors.surfaceVariant,
      onSurface: currentColors.onSurface,
      onSurfaceVariant: currentColors.onSurfaceVariant,
      outline: currentColors.border,
      outlineVariant: currentColors.borderStrong,
      error: currentColors.error,
      onError: currentColors.onError,
      errorContainer: currentColors.errorContainer,
      onErrorContainer: currentColors.onErrorContainer,
      elevation: {
        ...baseTheme.colors.elevation,
        level1: currentColors.surfaceVariant,
        level2: currentColors.cardElevated,
      },
    },
    roundness: 3,
  };
}
