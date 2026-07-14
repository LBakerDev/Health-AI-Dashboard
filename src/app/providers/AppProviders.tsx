import type { PropsWithChildren } from 'react';

import { ThemeProvider } from '@shared/theme';

export function AppProviders({ children }: PropsWithChildren) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
