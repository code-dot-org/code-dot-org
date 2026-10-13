import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/shapeAndSpacingVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/brandOverrides.css';

import {Capacitor} from '@capacitor/core';
import {GlobalStyles, StyledEngineProvider, ThemeProvider} from '@mui/material';
import {RouterProvider} from '@tanstack/react-router';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';

import {
  getMuiThemeForBrand,
  resolveBrand,
} from '@code-dot-org/component-library/themes';
import {initializeCore} from '@code-dot-org/core';
import {consentPlugin} from '@code-dot-org/core/plugins/consent';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';
import {injectFontAwesome} from '@code-dot-org/fonts';

import router from '@/router';

initializeCore({
  plugins: [consentPlugin, localizationPlugin, observabilityPlugin],
});

// Capacitor installs these assets with the app and does not need a service worker.
if (!Capacitor.isNativePlatform()) {
  registerSW({immediate: true});
}

document.documentElement.dataset.brand = resolveBrand(undefined);
const theme = getMuiThemeForBrand(document.documentElement.dataset.brand);
// Unlayered, as the MUI styles are. The app answers this page's requests for
// the icon fonts, which dsco.code.org serves to studio.code.org only.
injectFontAwesome();

// The icon font arrives only after the stylesheets above load, so the first
// render waits for it, and text and icons appear together; it waits no longer
// than this, in case dsco.code.org is slow and the icons are not cached yet.
const ICON_WAIT_MS = 1000;

function iconsReady(): Promise<unknown> {
  const stylesheets = Array.from(
    document.querySelectorAll<HTMLLinkElement>(
      'link[href*="/font-awesome-pro/"]',
    ),
    link =>
      new Promise(resolve => {
        link.addEventListener('load', resolve);
        link.addEventListener('error', resolve);
      }),
  );
  return Promise.race([
    Promise.all(stylesheets).then(() =>
      document.fonts.load('900 1em "Font Awesome 6 Pro"'),
    ),
    new Promise(resolve => setTimeout(resolve, ICON_WAIT_MS)),
  ]);
}

// No CSS cascade layers, unlike __root.tsx: Chromium before 99 drops layered
// rules, and Fire tablets can carry WebViews that old. No CssBaseline either,
// so reset the body margin here.
const globalStyles = <GlobalStyles styles={{body: {margin: 0}}} />;

const mount = document.getElementById('vite-root');

function render() {
  if (!mount) return;
  createRoot(mount).render(
    <StrictMode>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          {globalStyles}
          <RouterProvider router={router} />
        </ThemeProvider>
      </StyledEngineProvider>
    </StrictMode>,
  );
}

iconsReady().then(render, render);
