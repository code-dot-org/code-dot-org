// Studio's MSW boot. When `VITE_API_MODE=msw`, this starts the service worker
// once with the full handler list registered. Per-lab fixtures register
// lazily from the route loader (`getLabFixtures` + `registerLabFixtures` +
// `setActiveScenario`) so an unused lab's fixtures never enter the bundle.

import type {AccountsScenarioTag} from '@code-dot-org/accounts/mocks';

export async function enableMocks(): Promise<void> {
  if (import.meta.env.VITE_API_MODE !== 'msw') return;

  // Dynamic import keeps msw and its handlers out of the production bundle.
  const {startMockWorker, maybeResetFromUrl, setActiveScenario} = await import(
    '@code-dot-org/core/api/mocks'
  );
  const {registerAccountsFixtures, ACCOUNTS_LAB_KEY, ACCOUNTS_SCENARIO_TAGS} =
    await import('@code-dot-org/accounts/mocks');

  // `?cdoMockReset=1` wipes the sessionStorage scenarioStore. Honor it
  // before any handler reads from the store.
  maybeResetFromUrl();

  // Register at boot, not from a route loader: the current-user route these
  // fixtures provide must exist before the root route's beforeLoad resolves auth.
  registerAccountsFixtures();
  const requested = new URLSearchParams(window.location.search).get('scenario');
  const tag: AccountsScenarioTag =
    requested &&
    (ACCOUNTS_SCENARIO_TAGS as readonly string[]).includes(requested)
      ? (requested as AccountsScenarioTag)
      : 'teacher';
  setActiveScenario({labKey: ACCOUNTS_LAB_KEY, tag});

  // vite-plugin-rails sets Vite's `base` from `config/vite.json`
  // (e.g. `/frontend-studio/`), so `public/mockServiceWorker.js` is served at
  // `${BASE_URL}mockServiceWorker.js` rather than the root.
  const swUrl = `${import.meta.env.BASE_URL}mockServiceWorker.js`;

  await startMockWorker({serviceWorker: {url: swUrl}});
}
