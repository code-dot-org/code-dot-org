import {ThemeProvider} from '@mui/material';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {CdoTheme} from '@code-dot-org/component-library/themes';
import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';
import {injectFontAwesome} from '@code-dot-org/fonts';

import {DevApp} from './DevApp';
import {worker} from './msw/browser';

async function bootstrap() {
  if (import.meta.env.DEV) {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  }

  initializeCore({plugins: [localizationPlugin, observabilityPlugin]});
  void injectFontAwesome({layer: 'base'}).catch(() => undefined);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider theme={CdoTheme}>
        <DevApp />
      </ThemeProvider>
    </StrictMode>,
  );
}

void bootstrap();
