// Standalone dev harness for World Lab: `yarn dev` serves this. It is NOT part
// of the library build (the lib entry is src/index.ts). It mounts the App
// through the same host path the studio uses — `LabHost` drives the load against
// the MSW mock API (see ./fixtures), so there is no Rails backend.
//
// The world preview is a placeholder until the Phaser 4 runtime is wired in;
// everything else — instructions, file browser, editor — is real.

// Design-system fonts and CSS variables (colors, primitives).
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

// Lab CSS variables (borders, z-indices) used by base components like PanelContainer.
import '@code-dot-org/lab/styles/variables.scss';

import {GlobalStyles, StyledEngineProvider, ThemeProvider} from '@mui/material';
import {createRoot} from 'react-dom/client';

import {CdoTheme} from '@code-dot-org/component-library/themes';
import {initializeCore} from '@code-dot-org/core';
import {
  ApiClientProvider,
  DashboardApiClient,
  QueryClientProvider,
} from '@code-dot-org/core/api';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {RootStateProvider} from '@code-dot-org/core/redux';
import {injectFontAwesome} from '@code-dot-org/fonts';
import {LabHost} from '@code-dot-org/lab/host';

import App from './App';
import {mountBootBadge} from './demoBootBadge';
import {getSandboxUrl, setSandboxUrl} from './runtime/worldConfig';

initializeCore({plugins: [localizationPlugin]});
injectFontAwesome();

// Demo convenience: default the sandbox origin to the `dev:sandbox` port so
// `yarn dev:isolated` + opening the lab "just works" without a `?world-sandbox=`
// query. An explicit `?world-sandbox=` still wins (getSandboxUrl reads it).
if (!getSandboxUrl()) {
  setSandboxUrl('http://localhost:5202/');
}

// The lab loads a project by channel id from the URL; default to the `simple`
// fixture scenario so the harness works at the root path (the channel id doubles
// as the fixture scenario tag, matching the studio convention).
const channelId =
  window.location.pathname.match(
    /^\/frontend-studio\/projects\/world\/([^/]+)\/edit$/,
  )?.[1] ?? 'simple';

// Start the mock API and register World Lab's fixtures before rendering, so the
// host's level_properties / app_options / channel / sources requests are served.
async function enableMocks() {
  const {
    startMockWorker,
    registerLabFixtures,
    setActiveScenario,
    maybeResetFromUrl,
  } = await import('@code-dot-org/core/api/mocks');
  const {WorldFixtures} = await import('./fixtures');

  maybeResetFromUrl();
  registerLabFixtures('world', WorldFixtures);
  setActiveScenario({labKey: 'world', tag: channelId});

  await startMockWorker();
}

await enableMocks();

// Global tweaks for the standalone harness:
// - The base `<Lab>` wraps content in the component-library ThemeProvider's
//   `<div data-theme>`, which has no intrinsic height. The studio host sizes
//   labs via its own layout CSS; here we make that wrapper fill the viewport so
//   the lab's flex layout has a height to divide. Scoped to `#root` so it does
//   NOT match `<div data-theme>` menus/dialogs that portal to `<body>` (those
//   also carry `data-theme`, and a `height: 100%` would stretch them to the
//   whole window).
// - The DSCO tooltip portals to `<body>` with `height: fit-content`, which
//   Chromium resolves against the full-height viewport here (stretching it to
//   the whole window). `max-content` renders it at its content height, as
//   intended. Scoped to the portaled tooltip (`_tooltip_` name prefix), not the
//   `_tooltipOverlay_` wrapper.
const fullHeight = (
  <GlobalStyles
    styles={{
      '#root div[data-theme]': {height: '100%'},
      'body > [class*="_tooltip_"]': {height: 'max-content'},
    }}
  />
);

const rootElement = document.getElementById('root');
if (rootElement) {
  // No <StrictMode>: it double-invokes effects in dev, which races xterm's
  // async render against the console's dispose/remount (a benign 'dimensions'
  // error). The lab's own tests still run under React's strict behavior.
  createRoot(rootElement).render(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={CdoTheme}>
        {fullHeight}
        <RootStateProvider>
          <QueryClientProvider>
            <ApiClientProvider client={DashboardApiClient}>
              <div style={{height: '100vh'}}>
                <LabHost
                  LabEntrypoint={App}
                  standaloneProjectType="world"
                  channelId={channelId}
                />
              </div>
            </ApiClientProvider>
          </QueryClientProvider>
        </RootStateProvider>
      </ThemeProvider>
    </StyledEngineProvider>,
  );
  // Demo-only: show the real boot time on-page so it can be read with DevTools
  // closed (see demoBootBadge for why that matters).
  mountBootBadge();
}
