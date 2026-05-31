# API Mocks

Mock Service Worker (MSW) handlers for running labs without Rails. When
`VITE_API_MODE=msw`, the consumer starts the worker before React mounts; the
real HTTP transports and validation runs unmodified and MSW intercepts at the
network layer.

This mocking module helps different packages devise 'fixtures' which will alter
that mock API store and provide payloads for those APIs for the purposes of
avoiding the backend server for most development tasks and testing.

## Wiring (consumer side)

```ts
// apps/<your-app>/src/main.tsx
// -- or --
// packages/<your-package>/src/main.tsx (for lab packages, etc)
async function bootMocks() {
  if (import.meta.env.VITE_API_MODE !== 'msw') return;

  const {registerLabFixtures, setActiveScenario, startMockWorker} = await import(
    '@code-dot-org/core/api/mocks'
  );
  const {MusicFixtures} = await import('@code-dot-org/music-lab/mocks');

  registerLabFixtures('music', MusicFixtures);

  // The route loader sets the active `{labKey, tag}` from the URL params
  // before any fetch fires.
  setActiveScenario({labKey: 'music', tag: 'simple'});

  await startMockWorker();
}

await bootMocks();
createRoot(document.getElementById('root')!).render(<App />);
```

The service worker script (`mockServiceWorker.js`) lives in the consumer's
`public/` directory; generate it with `npx msw init public --save`.

## Generic fixtures: `registerMockFixture`

The base primitive maps any HTTP method + path pattern to a responder, scoped
to a `{labKey, tag}` scenario:

```ts
registerMockFixture({labKey: 'music', tag: 'simple'}, [
  // static body — wrapped in HttpResponse.json
  {
    path: '*/api/widget',
    respond: {ok: true},
  },
  // function responder — request, parsed path params, scenario-scoped store
  {
    method: 'post',
    path: '*/api/echo/:id',
    respond: async ({params, request, store}) => {
      const body = await request.json();
      store.write('last', body);
      return {id: params.id, body};
    },
  },
]);
```

The dispatch handler (`dispatch.handlers.ts`) runs first on every request and
serves the first matching route for the active scenario. On a miss — or when a
function responder returns `undefined` — it falls through to the default
domain handlers below it, so a route can selectively override one endpoint and
leave the rest alone. Registration is additive; `clearMockFixtures(scope?)`
replaces. Routes match first-registered-first, so register specific paths
before wildcard ones.

## Lab fixtures: sugar over the generic primitive

`registerLabFixtures` is a convenience layer for the common per-level shape:

```ts
type LabFixture = {
  channel?: Channel;
  sources?: ProjectSourcesAny;
  levelProperties?: LevelPropertiesMap;
  theme?: UserThemeSettings | null;
};
type LabFixtures = Record<string /* tag */, LabFixture>;
```

It splits a `LabFixture` two ways:

- **read-only** (`levelProperties`, `theme`) desugar into `registerMockFixture`
  routes — the dispatcher serves them.
- **stateful** (`channel`, `sources`) stay as seed data the behavioral
  handlers (`channels.handlers`, `sources.handlers`) read via
  `getActiveFixture()`, layering write-through on top. These can't be plain
  static routes because GET reflects prior writes.

Labs export their own scenarios; e.g. `packages/labs/music/src/fixtures/`
exports `simple`, `complex`, `error`. The studio dev wiring registers them
under the lab key and `setActiveScenario` picks the active one from the URL.

Generally, for lab fixtures, the name of the fixture is the `channelId` and
is selected by any URL that would supply that `channelId` by name. So, for
standalone projects, for instance, we might have `src/fixtures/simple.ts`
and that would supply the API responses for `/projects/music/simple/edit` in
the case of the `music` lab type.

## Adding a mock

For a one-off or lab-specific endpoint, reach for `registerMockFixture` — no
core change needed. Add a _default_ domain handler only when every scenario
should get the same baseline response with no fixture registered:

1. Pick the domain file: `levels.handlers.ts`, `preferences.handlers.ts`, etc.
2. Register the URL with an `*/` prefix so it matches regardless of the
   dashboard host the kyTransport is pointed at.
3. Return a sensible default. Per-scenario data belongs in a fixture, served
   ahead of the default by the dispatcher.
4. For writes, persist via `scenarioStore`'s `writeResource(name, value)`;
   reads layer `readResource()` over the seed for the latest state.

## Vitest

The same handler library runs in tests via an MSW node server. From a
package's vitest `setupFiles`:

```ts
import {afterAll, afterEach, beforeAll} from 'vitest';
import {mockServer} from '@code-dot-org/core/api/mocks/server';

beforeAll(() => mockServer.listen({onUnhandledRequest: 'error'}));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
```

Reference the file from `vitest.config.ts` (`test.setupFiles`). Tests then
exercise the real `DashboardApiClient` end to end — no per-test transport
stubs needed. Per-test overrides go through `mockServer.use(...)`.

The `./server` subpath is separate from `./api/mocks` so `msw/node` doesn't
end up in browser bundles.

## Write-through and reset

Writes (POST/PUT to channels, sources, thumbnails, etc.) persist to
`sessionStorage` under keys shaped `cdo-mock:<labKey>:<tag>:<resource>`.
Reads pick up those overrides on the next call, so reloading the page keeps
your edits within a browser session.

To wipe the store, navigate with `?cdoMockReset=1`. Studio's `enableMocks`
calls `maybeResetFromUrl()` before the worker starts and strips the param
from the URL so subsequent reloads don't reset again.
