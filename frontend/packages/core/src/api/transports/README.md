# API Transports

A transport moves requests between the API client and a backend.
All transports implement the same interface; the API client does not
know or care which one it talks to.

```
Transport
  request<T>(opts) → Promise<T>
  requestBlob(opts) → Promise<Blob>
  requestWithMeta<T>(opts) → Promise<ApiResponse<T>>
```

## Choosing a transport

Selection is driven by `VITE_API_MODE` in `bootstrapApiClient.ts`:

| Mode                  | Transport                | Use                                                               |
| --------------------- | ------------------------ | ----------------------------------------------------------------- |
| `dashboard` (default) | kyTransport              | Production. Talks to Rails via Ky.                                |
| `msw`                 | kyTransport + MSW        | Offline dev. Real kyTransport; MSW intercepts at the network.     |
| `replay`              | replayTransport (replay) | Offline playback of previously recorded responses from IndexedDB. |
| `auto`                | replayTransport (auto)   | Try IndexedDB cache first, fall back to network.                  |

For `msw`, the consumer is responsible for starting the worker before any API
call is made. See `../mocks/README.md`.

## kyTransport

The default. Wraps the Ky HTTP library.

```ts
import {createKyTransport} from '@code-dot-org/core/api';

const transport = createKyTransport({
  baseUrl: 'https://studio.code.org',
  credentials: 'same-origin',
  getCsrfToken: () => token,
});
```

Handles CSRF injection on non-GET requests, FormData detection,
JSON/text content negotiation, and abort signals. Errors are
normalized to `ApiError`.

## replayTransport

Wraps a backing transport. Records responses to IndexedDB, replays
them later without network. Useful for offline development and
deterministic testing.

```ts
import {createReplayTransport, createKyTransport} from '@code-dot-org/core/api';

// Record: hit network, cache every response
const recorder = createReplayTransport({
  mode: 'record',
  backingTransport: createKyTransport({...}),
});

// Replay: serve from cache only, error if missing
const player = createReplayTransport({
  mode: 'replay',
  backingTransport: createKyTransport({...}),
});

// Auto: cache first, network fallback
const hybrid = createReplayTransport({
  mode: 'auto',
  backingTransport: createKyTransport({...}),
});
```

Cache keys are derived from method + URL + sorted query params +
body hash. The `namespace` option isolates recordings between apps.

Storage is IndexedDB (`cdo-api-replay` database, `recordings` store).

## Errors

All transports throw `ApiError` on failure:

```ts
class ApiError extends Error {
  status: number;
  headers: Record<string, string>;
  url: string;
  method: HttpMethod;
}
```

## Files

| File                 | Purpose                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `types.ts`           | `Transport` interface, `RequestOptions`, `ApiResponse`, `ApiError` |
| `kyTransport.ts`     | Ky-based transport                                                 |
| `replayTransport.ts` | IndexedDB record/replay wrapper                                    |
| `simpleIdb.ts`       | IndexedDB get/put helpers                                          |
| `url.ts`             | URL building, replay key generation                                |
