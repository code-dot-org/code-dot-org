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

  // vite-plugin-rails sets Vite's `base` from `config/vite.json`
  // (e.g. `/frontend-studio/`), so `public/mockServiceWorker.js` is served at
  // `${BASE_URL}mockServiceWorker.js` rather than the root.
  const swUrl = `${import.meta.env.BASE_URL}mockServiceWorker.js`;

  await startMockWorker({serviceWorker: {url: swUrl}});
}
