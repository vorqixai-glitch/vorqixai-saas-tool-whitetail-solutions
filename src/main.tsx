import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TRPCProvider } from './providers/trpc.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TRPCProvider>
      <App />
    </TRPCProvider>
  </StrictMode>,
);
