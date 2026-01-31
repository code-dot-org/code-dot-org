# API

This holds all of the interactions between the frontend and our backend. We
optionally also support modes where the backend is not running and we are
either responding with mock responses or with equivalent offline operations.
Only the fully online mode is feature-rich and other modes might not offer
every API route.

## Structure

The APIs are separated more or less based on the structure of the backend into
`domains`. So, controller actions in the backend's
`controllers/levels_controller` will correspond to the `domains/levels/*` keys,
queries, and schemata.

Within each domain, the relevant content is split across different files:

- `*.api.ts` - The actual API calls and validation.
- `*.keys.ts` - Caching keys used by the API system to maintain responses.
- `*.query.ts` - React hooks to interact with API endpoints as needed.
- `*.schemata.ts` - Each schema corresponding to what we expect our responses to be.
- `*.types.ts` - The response types based on the schemata.

## Creating the Transport

Depending on the type of application and its network considerations, you can
instantiate a different `Transport`. This is the interface that actually
performs the API call. Generally, the `HttpTransport` is the clear choice
since this performs a network request, but it relies on the backend server to
be running and accessible. Other options offer different strategies that work
well for offline or progressive situations, but may lack some features.

Here is a general way of determining a transport dynamically using an envionment
variable:

```
import {
  createHttpTransport,
  createMockTransport,
  createReplayTransport,
} from '@code-dot-org/core/api/transports';

const apiMode = import.meta.env.VITE_API_MODE as 'rails' | 'mock' | 'replay' | 'auto';

const http = createHttpTransport({
  baseUrl: '/api',
  getCsrfToken: () =>
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? null,
});

const transport =
  apiMode === 'mock'
    ? createMockTransport({routes: mockRoutes, baseUrl: '/api', latencyMs: {min: 20, max: 120}})
    : apiMode === 'replay'
      ? createReplayTransport({mode: 'replay', backingTransport: http, namespace: 'vite-labs'})
      : apiMode === 'auto'
        ? createReplayTransport({mode: 'auto', backingTransport: http, namespace: 'vite-labs'})
        : http;
```
