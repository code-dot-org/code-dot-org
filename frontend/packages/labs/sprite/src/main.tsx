// The package's own dev server: Sprite Lab against the mock API, with the
// providers Studio gives a lab. Open /app/projects/sprite/<fixture>/edit; the
// fixture names (src/fixtures) double as channel ids. The engine runs alone
// in engine-demo.html.
import {GlobalStyles, StyledEngineProvider, ThemeProvider} from '@mui/material';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import {
  getMuiThemeForBrand,
  resolveBrand,
} from '@code-dot-org/component-library/themes';
import {initializeCore} from '@code-dot-org/core';
import {
  ApiClientProvider,
  DashboardApiClient,
  QueryClientProvider,
} from '@code-dot-org/core/api';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';
import {RootStateProvider} from '@code-dot-org/core/redux';
import {injectFontAwesome} from '@code-dot-org/fonts';
import {LabHost} from '@code-dot-org/lab/host';
import '@code-dot-org/lab/styles/variables.scss';

import App from './App';

initializeCore({plugins: [localizationPlugin, observabilityPlugin]});
injectFontAwesome();

// The brand picks the theme, as in Studio; Rails stamps it on <html> there.
document.documentElement.dataset.brand = resolveBrand(
  document.documentElement.dataset.brand,
);
const theme = getMuiThemeForBrand(document.documentElement.dataset.brand);

const channelId =
  window.location.pathname.match(
    /^\/app\/projects\/sprite\/([^/]+)\/edit$/,
  )?.[1] ?? 'simple';

// The worker must be answering before the lab's first request goes out.
async function enableMocks() {
  const {
    maybeResetFromUrl,
    registerLabFixtures,
    setActiveScenario,
    startMockWorker,
  } = await import('@code-dot-org/core/api/mocks');
  const {SpriteFixtures} = await import('./fixtures');
  // ?cdoMockReset=1 clears what earlier visits saved.
  maybeResetFromUrl();
  registerLabFixtures('sprite', SpriteFixtures);
  setActiveScenario({labKey: 'sprite', tag: channelId});
  await startMockWorker();
}

await enableMocks();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* MUI's styles in a layer below the lab's own, as Studio sets them. */}
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <ThemeProvider theme={theme}>
        <RootStateProvider>
          <QueryClientProvider>
            <ApiClientProvider client={DashboardApiClient}>
              <LabHost
                LabEntrypoint={App}
                standaloneProjectType="sprite"
                channelId={channelId}
              />
            </ApiClientProvider>
          </QueryClientProvider>
        </RootStateProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
);
