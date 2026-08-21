// Standalone dev harness for Web Lab: `yarn dev` serves this. It is NOT part
// of the library build (the lib entry is src/index.ts). It mounts the App
// through the same host path the studio uses — `LabHost` drives the load against
// the MSW mock API (see ./fixtures), so there is no Rails backend.

//
// The page preview is still a placeholder until the HTML preview is ported;
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

import {useRecordedTutor} from './aiTutor/transport';
import App from './App';

initializeCore({plugins: [localizationPlugin]});
injectFontAwesome();

// There is no Rails behind the mock API, so the AI Tutor answers from a
// recording rather than posting a completion into a handler that does not
// exist. The recording is written against this harness's own project, so the
// accept/reject flow really does rewrite `styles.css` (`aiTutor/transport`).
//
// Who is looking at the page comes from the mock API's own
// `/api/v1/users/current` handler (`@code-dot-org/core/api/mocks`), which
// answers as a signed-in student with AI enabled.
useRecordedTutor();

// The lab loads a project by channel id from the URL; default to the `simple`
// fixture scenario so the harness works at the root path (the channel id doubles
// as the fixture scenario tag, matching the studio convention).
const channelId =
  window.location.pathname.match(
    /^\/frontend-studio\/projects\/web\/([^/]+)\/edit$/,
  )?.[1] ?? 'simple';

// Start the mock API and register Web Lab's fixtures before rendering, so the
// host's level_properties / app_options / channel / sources requests are served.
async function enableMocks() {
  const {
    startMockWorker,
    registerLabFixtures,
    setActiveScenario,
    maybeResetFromUrl,
  } = await import('@code-dot-org/core/api/mocks');
  const {WebFixtures} = await import('./fixtures');

  maybeResetFromUrl();
  registerLabFixtures('web', WebFixtures);
  setActiveScenario({labKey: 'web', tag: channelId});

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
                  standaloneProjectType="web"
                  channelId={channelId}
                />
              </div>
            </ApiClientProvider>
          </QueryClientProvider>
        </RootStateProvider>
      </ThemeProvider>
    </StyledEngineProvider>,
  );
}
