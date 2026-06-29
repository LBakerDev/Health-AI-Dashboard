import { AppProviders } from '@app/providers';
import { MvpShellPage } from '@pages/mvp-shell';

export function App() {
  return (
    <AppProviders>
      <MvpShellPage />
    </AppProviders>
  );
}
