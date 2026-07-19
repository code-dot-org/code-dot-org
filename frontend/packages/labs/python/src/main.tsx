// Standalone dev harness for Python Lab: `yarn dev` serves this. It is NOT part
// of the library build (the lib entry is src/index.ts). It mounts the App
// through the same host path the studio uses — `LabHost` drives the load against
// the MSW mock API (see ./fixtures), so there is no Rails backend.
//
// Run is still a stub (writes a placeholder to the console) until the pyodide
// runtime is ported; everything else — instructions, file browser, editor,
// console — is real.

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
import {injectFontAwesome} from '@code-dot-org/fonts';
import {LabHost, RootStateProvider} from '@code-dot-org/lab';

import App from './App';

initializeCore({plugins: [localizationPlugin]});
injectFontAwesome();

// The lab loads a project by channel id from the URL; default to the `simple`
// fixture scenario so the harness works at the root path (the channel id doubles
// as the fixture scenario tag, matching the studio convention).
const channelId =
  window.location.pathname.match(
    /^\/app\/projects\/python\/([^/]+)\/edit$/,
  )?.[1] ?? 'simple';

// Start the mock API and register Python Lab's fixtures before rendering, so the
// host's level_properties / app_options / channel / sources requests are served.
async function enableMocks() {
  const {
    startMockWorker,
    registerLabFixtures,
    setActiveScenario,
    maybeResetFromUrl,
  } = await import('@code-dot-org/core/api/mocks');
  const {PythonFixtures} = await import('./fixtures');

  maybeResetFromUrl();
  registerLabFixtures('python', PythonFixtures);
  setActiveScenario({labKey: 'python', tag: channelId});

  await startMockWorker();
}

await enableMocks();

// The base `<Lab>` wraps content in the component-library ThemeProvider's
// `<div data-theme>`, which has no intrinsic height. The studio host sizes labs
// via its own layout CSS; here we make that wrapper (and this harness's own) fill
// the viewport so the lab's flex layout has a height to divide.
const fullHeight = (
  <GlobalStyles styles={{'div[data-theme]': {height: '100%'}}} />
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
                  standaloneProjectType="python"
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
