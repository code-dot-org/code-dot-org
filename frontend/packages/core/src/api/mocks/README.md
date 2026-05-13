# API Mocks

Mock Service Worker (MSW) handlers for running labs without Rails. When
`VITE_API_MODE=msw`, the consumer starts the worker before React mounts; the
real `kyTransport` then runs unmodified and MSW intercepts at the network
boundary.

## Wiring (consumer side)

```ts
// apps/<your-app>/src/main.tsx
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

## Fixture shape

```ts
type LabFixture = {
  channel?: Channel;
  sources?: ProjectSourcesAny;
  levelProperties?: LevelPropertiesMap;
  theme?: UserThemeSettings | null;
};
type LabFixtures = Record<string /* tag */, LabFixture>;
```

Labs export their own scenarios; e.g. `packages/labs/music/src/fixtures/`
exports `simple`, `complex`, `error`. The studio dev wiring registers them
under the lab key and `setActiveScenario` picks the active one from the URL.

## Adding a handler

1. Pick the domain file: `levels.handlers.ts`, `preferences.handlers.ts`, etc.
2. Register the URL with an `*/` prefix so it matches regardless of the
   dashboard host the kyTransport is pointed at.
3. Pull data from `getActiveFixture()` and fall back to a sensible default
   when the fixture is absent.
4. For writes, persist via `scenarioStore` (sessionStorage write-through —
   coming in a follow-up).

## Files

| File                      | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `registry.ts`             | Fixture registration, active-scenario selection                      |
| `handlers.ts`             | Aggregate `getMockHandlers()` consumed by the worker                 |
| `worker.ts`               | `startMockWorker()` — dynamic import of `msw/browser`, idempotent    |
| `levels.handlers.ts`      | `*/levels/:id/level_properties` and the script/lesson/project shapes |
| `preferences.handlers.ts` | `*/user_preference/theme`                                            |
| `channels.handlers.ts`    | Stub — to be filled in                                               |
| `sources.handlers.ts`     | Stub — to be filled in                                               |
| `projects.handlers.ts`    | Stub — to be filled in                                               |
