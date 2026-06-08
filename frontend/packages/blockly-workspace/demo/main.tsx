// Load the design-system fonts and style variables so the component-library
// components the BlocklyMarkdown instructions map onto (Typography, Link) render
// with real styles — mirroring how apps/studio sets up component-library
// styling, and matching the markdown package's own demo.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {Demo} from './Demo';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
