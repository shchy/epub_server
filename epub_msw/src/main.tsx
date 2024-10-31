import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.tsx';
import { setupMsw } from './_msw';
setupMsw();

import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CssBaseline>
      <App />
    </CssBaseline>
  </StrictMode>
);
