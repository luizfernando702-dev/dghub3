
import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Changed default import to named import because App.tsx uses 'export const App'
import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);