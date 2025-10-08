console.log('%c[DEBUG] index.tsx: SCRIPT EXECUTION STARTED.', 'color: green; font-weight: bold;');

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[DEBUG] index.tsx: Could not find root element to mount to. The app cannot start.');
  throw new Error("Could not find root element to mount to");
}

console.log('[DEBUG] index.tsx: Found root element. Rendering React app...');
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('[DEBUG] index.tsx: React app has been rendered.');
