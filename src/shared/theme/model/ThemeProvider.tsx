import { useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { ThemeContext } from './theme-context';
import { readStoredThemeMode, writeStoredThemeMode } from './theme-storage';
import type { ThemeContextValue } from './theme-context';
import type { ThemeMode } from './types';
import { useSystemTheme } from './useSystemTheme';

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemTheme = useSystemTheme();
  const [mode, setModeState] = useState<ThemeMode>(readStoredThemeMode);
  const resolvedTheme = mode === 'system' ? systemTheme : mode;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(() => {
    const setMode = (nextMode: ThemeMode) => {
      setModeState(nextMode);
      writeStoredThemeMode(nextMode);
    };

    return {
      mode,
      resolvedTheme,
      setMode,
      toggleTheme: () => setMode(resolvedTheme === 'dark' ? 'light' : 'dark'),
    };
  }, [mode, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
