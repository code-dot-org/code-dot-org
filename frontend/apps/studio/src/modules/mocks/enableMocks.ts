// Studio's MSW boot. When `VITE_API_MODE=msw`, this starts the service worker
// once with the full handler list registered. Per-lab fixtures register
// lazily from the route loader (`getLabFixtures` + `registerLabFixtures` +
// `setActiveScenario`) so an unused lab's fixtures never enter the bundle.

export async function enableMocks(): Promise<void> {
  if (import.meta.env.VITE_API_MODE !== 'msw') return;

  // Dynamic import keeps msw and its handlers out of the production bundle.
  const {startMockWorker} = await import('@code-dot-org/core/api/mocks');

  // vite-plugin-rails sets Vite's `base` from `config/vite.json`
  // (e.g. `/frontend-studio/`), so `public/mockServiceWorker.js` is served at
  // `${BASE_URL}mockServiceWorker.js` rather than the root.
  const swUrl = `${import.meta.env.BASE_URL}mockServiceWorker.js`;

  await startMockWorker({serviceWorker: {url: swUrl}});
}
