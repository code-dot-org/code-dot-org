// Load the design-system fonts and style variables so the component-library
// components (Typography, Link) the markdown maps onto render with real styles
// — mirroring how apps/studio sets up component-library styling.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {ThemeProvider} from '@mui/material';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {CdoTheme} from '@code-dot-org/component-library/themes';
import {injectFontAwesome} from '@code-dot-org/fonts';

import {Demo} from './Demo';

// DSCO controls (e.g. the Toggle's check/x marks) render Font Awesome glyphs, so
// load the icon stylesheets the same way apps/studio does.
injectFontAwesome();

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={CdoTheme}>
      <Demo />
    </ThemeProvider>
  </StrictMode>,
);
