import {CdoTheme} from '@code-dot-org/component-library/themes';
import {ThemeProvider as DesignSystemThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Design-system CSS variable definitions (colors, typography tokens,
// primitive palettes). These are normally loaded by apps via
// `createReactRoot.tsx`; for the standalone `yarn dev` workflow we
// load them here so MUI's theme overrides — which reference
// `--background-brand-purple-primary` etc. — actually resolve.
// These imports are in main.tsx only (the dev-server entry), not in
// src/index.ts, so they don't end up in the library build that apps
// consumes.
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*
      Mirror apps's provider stack so the standalone preview renders
      identically to what consumers see. `DesignSystemThemeProvider`
      adds the `data-theme` attribute scope for CSS-variable
      cascades; `MuiThemeProvider` plus `CdoTheme` plugs MUI's
      runtime into the design system's variants, default props, and
      style overrides.
    */}
    <DesignSystemThemeProvider>
      <MuiThemeProvider theme={CdoTheme}>
        <App />
      </MuiThemeProvider>
    </DesignSystemThemeProvider>
  </StrictMode>,
);
