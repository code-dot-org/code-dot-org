# API

This holds all of the interactions between the frontend and our backend. We
optionally also support modes where the backend is not running and we are
either responding with mock responses or with equivalent offline operations.
Only the fully online mode is feature-rich and other modes might not offer
every API route.

## Structure

The APIs are split by backend domain under `dashboard/<domain>/`. Controller
actions in the backend's `controllers/levels_controller` correspond to the keys,
queries, and schemata in `dashboard/levels/`.

Within each domain, the relevant content is split across different files:

- `*.api.ts` - The actual API calls and validation.
- `*.keys.ts` - Caching keys used by the API system to maintain responses.
- `*.query.ts` - React hooks to interact with API endpoints as needed.
- `*.schemata.ts` - Each schema corresponding to what we expect our responses to be.
- `*.types.ts` - The response types based on the schemata.
- `*.kinds.ts` - When the types involved can be extended, this holds a registry of such schemata.

For the `*.kinds.ts` files, these contain a registry of different extensions to the data
model so that these might be validated on their case-by-case basis. This is rare, but two examples
might be the Level metadata, which differs per level type and Source metadata where a lab might
want to validate the structure of the content within the transport so that assumptions it makes
on the shape of that data are correct to the lab type.

## Creating the Transport

Depending on the type of application and its network considerations, you can
instantiate a different `Transport`. This is the interface that actually
performs the API call. Generally, `kyTransport` is the clear choice
since this performs a network request, but it relies on the backend server to
be running and accessible. Other options offer different strategies that work
well for offline or progressive situations, but may lack some features.

For offline development without Rails, set `VITE_API_MODE=msw` and start the
MSW worker before React renders. The real `kyTransport` is still used; MSW
intercepts at the network boundary so the production code path runs. See
`./mocks/README.md`.

`DashboardApiClient` is built this way by `bootstrapApiClient.ts`, which
selects the transport from `VITE_API_MODE`. To build a client by hand:

```ts
import {CodeStudioConfig, getDashboardApiUrl} from '@code-dot-org/core';
import {
  createApiClient,
  createKyTransport,
  createReplayTransport,
  resolveCsrfToken,
} from '@code-dot-org/core/api';

const mode = (import.meta.env.VITE_API_MODE ?? 'dashboard') as
  | 'dashboard'
  | 'msw'
  | 'replay'
  | 'auto';

const http = createKyTransport({
  baseUrl: getDashboardApiUrl(CodeStudioConfig.environment),
  credentials: 'same-origin',
  getCsrfToken: resolveCsrfToken,
});

const transport =
  mode === 'replay' || mode === 'auto'
    ? createReplayTransport({mode, namespace: 'vite-app', backingTransport: http})
    : http;
// `msw` mode uses `http` directly; the worker handles interception.

const client = createApiClient(transport);
```
