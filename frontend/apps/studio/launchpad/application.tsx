import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/shapeAndSpacingVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/brandOverrides.css';

import {CssBaseline, ThemeProvider} from '@mui/material';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {CodeaiTheme} from '@code-dot-org/component-library/themes';

import Launchpad from '@/modules/launchpad/Launchpad';

const mount = document.getElementById('vite-root');
if (mount) {
  createRoot(mount).render(
    <StrictMode>
      <ThemeProvider theme={CodeaiTheme}>
        <CssBaseline />
        <Launchpad />
      </ThemeProvider>
    </StrictMode>,
  );
}
