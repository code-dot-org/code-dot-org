// Studio's MSW boot. When `VITE_API_MODE=msw`, this starts the service worker
// once with the full handler list registered. Per-lab fixtures register
// lazily from the route loader (`getLabFixtures` + `registerLabFixtures` +
// `setActiveScenario`) so an unused lab's fixtures never enter the bundle.

export async function enableMocks(): Promise<void> {
  if (import.meta.env.VITE_API_MODE !== 'msw') return;

  // Dynamic import keeps msw and its handlers out of the production bundle.
  const {startMockWorker, maybeResetFromUrl, registerMockFixture} =
    await import('@code-dot-org/core/api/mocks');

  // `?cdoMockReset=1` wipes the sessionStorage scenarioStore. Honor it
  // before any handler reads from the store.
  maybeResetFromUrl();

  // The auth endpoint is cross-origin (dashboard on :3000, Vite on another
  // port), so the MSW service worker can't intercept it. Register a global
  // signed-out stub so the root layout renders <Outlet /> instead of the
  // auth error page.
  registerMockFixture({
    path: '*/api/v1/users/current',
    respond: {is_signed_in: false},
  });

  // `*/levels/:levelId/level_properties` (registered by
  // `core/api/mocks/levels.handlers.ts` for the dashboard API) wildcard-
  // matches the authoring service's `/authoring-api/levels/:id/level_properties`
  // too, since MSW's leading `*` matches any prefix. Without this passthrough,
  // Author Mode's own level-properties fetch silently gets the dashboard
  // mock's default empty map instead of the authoring service's real data.
  // Scoped to this one path — not all of `/authoring-api/*` — because a
  // broader passthrough also caught the SSE `/authoring-api/events`
  // connection and other in-flight requests stalled behind it.
  const {bypass} = await import('msw');
  registerMockFixture({
    path: '*/authoring-api/levels/*/level_properties',
    respond: ({request}) => fetch(bypass(request)),
  });

  // vite-plugin-rails sets Vite's `base` from `config/vite.json`
  // (e.g. `/frontend-studio/`), so `public/mockServiceWorker.js` is served at
  // `${BASE_URL}mockServiceWorker.js` rather than the root.
  const swUrl = `${import.meta.env.BASE_URL}mockServiceWorker.js`;

  await startMockWorker({serviceWorker: {url: swUrl}});
}
