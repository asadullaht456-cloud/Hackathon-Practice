/**
 * useAppTheme hook for Chalo transit app
 * Provides theme mode (light, dark, glare), color tokens, spacing, and MD3 paper theme.
 * Unblocks Dev1's root layout PaperProvider.
 */

import { create } from 'zustand';
import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import {
  Colors,
  Spacing,
  BorderRadius,
  Fonts,
  ThemeMode,
  getPaperTheme,
  AppColors,
} from '@/constants/theme';

interface ThemeState {
  overrideMode: ThemeMode | null;
  autoGlareEnabled: boolean;
  setOverrideMode: (mode: ThemeMode | null) => void;
  setAutoGlareEnabled: (enabled: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  overrideMode: null,
  autoGlareEnabled: true,
  setOverrideMode: (mode) => set({ overrideMode: mode }),
  setAutoGlareEnabled: (enabled) => set({ autoGlareEnabled: enabled }),
}));

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const { overrideMode, autoGlareEnabled, setOverrideMode, setAutoGlareEnabled } =
    useThemeStore();

  const mode: ThemeMode = useMemo(() => {
    if (overrideMode) return overrideMode;
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }, [overrideMode, systemColorScheme]);

  const colors = Colors[mode] as AppColors;
  const paperTheme = useMemo(() => getPaperTheme(mode), [mode]);

  const toggleGlareMode = () => {
    if (mode === 'glare') {
      setOverrideMode(null);
    } else {
      setOverrideMode('glare');
    }
  };

  return {
    mode,
    isDark: mode === 'dark',
    isGlare: mode === 'glare',
    colors,
    spacing: Spacing,
    borderRadius: BorderRadius,
    fonts: Fonts,
    paperTheme,
    autoGlareEnabled,
    setThemeMode: setOverrideMode,
    setAutoGlareEnabled,
    toggleGlareMode,
  };
}
