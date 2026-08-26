import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Import code.org brand fonts (Figtree, Noto Sans, Barlow)
import '@code-dot-org/fonts/brands/code.org/index.css';

// Import component library root CSS variables (colors, primitives, etc.)
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

// Load Font Awesome Pro 6 icons from CDN
import {injectFontAwesome} from '@code-dot-org/fonts';

injectFontAwesome();

// Import lab CSS variables (borders, z-indices, etc.)
import '@code-dot-org/lab-classic/styles/variables.scss';

import App from './App.tsx';

// Standalone `yarn dev` harness only; the studio host (modules/labs/maze)
// supplies real levelId/levelPropertiesMap. Nothing to load in isolation
// without a backend, so render the (empty) loading state.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App isLoading={false} />
  </StrictMode>,
);
