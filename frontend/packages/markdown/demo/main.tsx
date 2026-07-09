// Load the design-system fonts and style variables so the component-library
// components (Typography, Link) the markdown maps onto render with real styles
// — mirroring how apps/studio sets up component-library styling.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/brandOverrides.css';

import {ThemeProvider} from '@mui/material';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';
import {injectFontAwesome} from '@code-dot-org/fonts';

import {Demo} from './Demo';

// DSCO controls (e.g. the Toggle's check/x marks) render Font Awesome glyphs, so
// load the icon stylesheets the same way apps/studio does.
injectFontAwesome();

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

// Preview the demo under a different brand with ?brand=codeai-next or
// ?brand=codeai-audit, mirroring the server-side brand router's URL param.
// The attribute must be on <html> before getMuiThemeForBrand runs: the CSS
// tokens react to [data-brand] whenever it changes, but the MUI theme is
// chosen once at boot.
const brand = new URLSearchParams(window.location.search).get('brand');
if (brand) {
  document.documentElement.dataset.brand = brand;
}
const theme = getMuiThemeForBrand(document.documentElement.dataset.brand);

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <Demo />
    </ThemeProvider>
  </StrictMode>,
);
