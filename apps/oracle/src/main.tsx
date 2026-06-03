import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '@fj/design-tokens/colors.css';
import '@fj/design-tokens/typography.css';
import '@fj/design-tokens/spacing.css';
import '@fj/design-tokens/animations.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
