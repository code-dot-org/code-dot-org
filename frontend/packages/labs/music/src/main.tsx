import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Import code.org brand fonts (Figtree, Noto Sans, Barlow)
import '@code-dot-org/fonts/brands/code.org/index.css';

// Import component library root CSS variables (colors, primitives, etc.)
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {initializeCore} from '@code-dot-org/core';
import {
  ApiClientProvider,
  DashboardApiClient,
  QueryClientProvider,
} from '@code-dot-org/core/api';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {injectFontAwesome} from '@code-dot-org/fonts';
import {RootStateProvider} from '@code-dot-org/core/redux';
import {LabHost} from '@code-dot-org/lab/host';

// Import lab CSS variables (borders, z-indices, etc.)
import '@code-dot-org/lab/styles/variables.scss';

import App from './App';

// Standalone dev harness: there is no Rails backend here, so initialize core
// and run entirely against the MSW mock API (see ./fixtures). This mirrors the
// provider stack the studio host sets up around a lab.
initializeCore({plugins: [localizationPlugin]});
injectFontAwesome();

// The lab loads a project by channel id from the URL; default to the `simple`
// fixture scenario so the harness works at the root path. The channel id
// doubles as the fixture scenario tag, matching the studio convention.
const channelId =
  window.location.pathname.match(
    /^\/app\/projects\/music\/([^/]+)\/edit$/,
  )?.[1] ?? 'simple';

/**
 * Start the mock API and register Music Lab's fixtures before rendering, so the
 * lab's initial level_properties / app_options / channel / sources requests are
 * intercepted by the service worker.
 */
async function enableMocks() {
  const {
    startMockWorker,
    registerLabFixtures,
    setActiveScenario,
    maybeResetFromUrl,
  } = await import('@code-dot-org/core/api/mocks');
  const {MusicFixtures} = await import('./fixtures');

  // `?cdoMockReset=1` wipes any persisted scenario store before handlers read it.
  maybeResetFromUrl();
  registerLabFixtures('music', MusicFixtures);
  setActiveScenario({labKey: 'music', tag: channelId});

  await startMockWorker();
}

await enableMocks();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Host-provided stack: shared redux store, react-query, and API client —
        the same providers the studio host supplies around a lab. `LabHost`
        drives the load exactly as studio does, so this harness exercises the
        real host path. */}
    <RootStateProvider>
      <QueryClientProvider>
        <ApiClientProvider client={DashboardApiClient}>
          <LabHost
            LabEntrypoint={App}
            standaloneProjectType="music"
            channelId={channelId}
          />
        </ApiClientProvider>
      </QueryClientProvider>
    </RootStateProvider>
  </StrictMode>,
);
