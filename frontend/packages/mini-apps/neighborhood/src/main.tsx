import {ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {ThemeProvider as DesignSystemThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {CdoTheme} from '@code-dot-org/component-library/themes';
import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';
import {injectFontAwesome} from '@code-dot-org/fonts';

// Design-system CSS variable definitions (colors, typography tokens,
// primitive palettes). Apps normally loads these via
// `createReactRoot.tsx`; the standalone `yarn dev` workflow needs
// them here so MUI's theme overrides — which read variables like
// `--background-brand-purple-primary` — actually resolve. Lives in
// main.tsx (the dev-server entry), not src/index.ts, so the library
// build apps consumes stays uncontaminated.
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';

import App from './App.tsx';

initializeCore({plugins: [localizationPlugin, observabilityPlugin]});

// Load FontAwesome Pro stylesheets so the turtle/rabbit icons (and
// any other FA icons inside component-library components) actually
// render. Apps invokes this once at boot via
// `apps/src/sites/studio/pages/code-studio.js`; the standalone dev
// server has to do it here.
injectFontAwesome();

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
