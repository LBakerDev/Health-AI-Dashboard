import type { ThemeMode } from './types';

const STORAGE_KEY = 'health-dashboard-theme';
const themeModes = new Set<ThemeMode>(['light', 'dark', 'system']);

export function readStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  let storedMode: string | null = null;

  try {
    storedMode = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return 'dark';
  }

  if (storedMode && themeModes.has(storedMode as ThemeMode)) {
    return storedMode as ThemeMode;
  }

  return 'dark';
}

export function writeStoredThemeMode(themeMode: ThemeMode) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, themeMode);
  } catch {
    // Ignore storage failures in private browsing or locked-down contexts.
  }
}
