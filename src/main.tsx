import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { PreetiTypingProvider } from './context/PreetiTypingContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PreetiTypingProvider>
        <App />
      </PreetiTypingProvider>
    </ErrorBoundary>
  </StrictMode>,
);
