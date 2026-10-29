import {createApiClient, type ApiClient} from './client/createApiClient';
import {resolveCsrfToken} from './csrfToken';
import {createKyTransport} from './transports/kyTransport';
import {createReplayTransport} from './transports/replayTransport';
import {CodeStudioConfig} from '@/config';

// `msw` is a separate mode for the consumer's boot wiring: when active, the
// consumer starts an MSW worker (see `@code-dot-org/core/api/mocks`) and the
// real `kyTransport` is used. Network calls are intercepted at the worker
// boundary so the production transport path is exercised in dev.
type ApiMode = 'dashboard' | 'msw' | 'replay' | 'auto';

function getApiMode(): ApiMode {
  const raw = (import.meta.env.VITE_API_MODE ?? 'dashboard') as ApiMode;
  return raw;
}

export function bootstrapApiClient(): ApiClient {
  const mode = getApiMode();

  const http = createKyTransport({
    // What SiteConfig resolved, rather than resolving it again: the environment
    // decides, unless the page names an API origin of its own (SiteConfig's
    // `dashboardApiUrl`).
    baseUrl: CodeStudioConfig.dashboardApiUrl,
    credentials: 'same-origin',
    getCsrfToken: resolveCsrfToken,
  });

  const transport =
    mode === 'replay'
      ? createReplayTransport({
          mode: 'replay',
          namespace: 'vite-app',
          backingTransport: http,
        })
      : mode === 'auto'
        ? createReplayTransport({
            mode: 'auto',
            namespace: 'vite-app',
            backingTransport: http,
          })
        : http;

  return createApiClient(transport);
}
