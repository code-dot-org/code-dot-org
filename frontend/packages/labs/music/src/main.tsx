import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Import component library root CSS variables (colors, primitives, etc.)
import '@code-dot-org/component-library-styles/colors.scss';

// Import code.org brand fonts (Figtree, Noto Sans, Barlow)
import '@code-dot-org/fonts/brands/code.org/index.css';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
