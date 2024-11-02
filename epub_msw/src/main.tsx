import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { LoadingProvider } from './_services';
import App from './App.tsx';

import { Buffer } from 'buffer';

window.Buffer = window.Buffer || Buffer;
// import { worker } from './_msw';
// worker.start().then(() =>
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CssBaseline>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </CssBaseline>
  </StrictMode>
);
// );
