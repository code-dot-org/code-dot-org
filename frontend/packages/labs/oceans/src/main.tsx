import {CssBaseline, ThemeProvider} from '@mui/material';
import {createRoot} from 'react-dom/client';

import {CdoTheme} from '@code-dot-org/component-library/themes';
import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import '@code-dot-org/fonts/brands/code.org/index.css';

import DemoShell from './DemoShell';

initializeCore({plugins: [localizationPlugin]});

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={CdoTheme}>
    {/* Sets body { font-family: Figtree, ... } so it cascades into the lab's
        separate React root (init.tsx createRoot), mirroring studio's bootstrap. */}
    <CssBaseline />
    <DemoShell />
  </ThemeProvider>,
);
