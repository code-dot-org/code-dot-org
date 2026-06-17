import {createApiClient, type ApiClient} from './client/createApiClient';
import {createHttpTransport} from './transports/httpTransport';
import {createKyTransport} from './transports/kyTransport';
import {createReplayTransport} from './transports/replayTransport';
import {CodeStudioConfig} from '@/config';
import {getDashboardApiUrl} from '@/dashboard';

// `msw` is a separate mode for the consumer's boot wiring: when active, the
// consumer starts an MSW worker (see `@code-dot-org/core/api/mocks`) and the
// real `kyTransport` is used. Network calls are intercepted at the worker
// boundary so the production transport path is exercised in dev.
type ApiMode = 'dashboard' | 'fetch' | 'msw' | 'replay' | 'auto';

function getApiMode(): ApiMode {
  const raw = (import.meta.env.VITE_API_MODE ?? 'dashboard') as ApiMode;
  return raw;
}

function getCsrfToken(): string | null {
  return (
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
      ?.content ?? null
  );
}

export function bootstrapApiClient(): ApiClient {
  const mode = getApiMode();

  const http = createKyTransport({
    baseUrl: getDashboardApiUrl(CodeStudioConfig.environment),
    credentials: 'same-origin',
    getCsrfToken,
  });

  const transport =
    mode === 'fetch'
      ? createHttpTransport({
          baseUrl: '',
          credentials: 'same-origin',
          getCsrfToken,
        })
      : mode === 'replay'
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
