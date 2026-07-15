import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import { registerServiceWorker } from './app/registerServiceWorker';
import './styles/global.css';

registerServiceWorker();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
