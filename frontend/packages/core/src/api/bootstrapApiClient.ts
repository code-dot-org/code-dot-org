import {createApiClient, type ApiClient} from './client/createApiClient';
import {createHttpTransport} from './transports/httpTransport';
import {createMockTransport} from './transports/mockTransport';
import {createReplayTransport} from './transports/replayTransport';
// TODO: import {mockRoutes} from './mocks/allRoutes';

type ApiMode = 'dashboard' | 'mock' | 'replay' | 'auto';

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

  const http = createHttpTransport({
    baseUrl: '',
    credentials: 'same-origin',
    getCsrfToken,
  });

  const transport =
    mode === 'mock'
      ? createMockTransport({
          baseUrl: '',
          routes: [], // mockRoutes,
          latencyMs: {min: 20, max: 120},
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
