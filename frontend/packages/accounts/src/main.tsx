import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {QueryClientProvider} from '@code-dot-org/core/api';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';

import AccountSettingsPage from './AccountSettingsPage';
import {
  ACCOUNTS_LAB_KEY,
  ACCOUNTS_SCENARIO_TAGS,
  registerAccountsFixtures,
  type AccountsScenarioTag,
} from './fixtures';

initializeCore({plugins: [localizationPlugin, observabilityPlugin]});

function activeScenario(): AccountsScenarioTag {
  const tag = new URLSearchParams(window.location.search).get('scenario');
  return ACCOUNTS_SCENARIO_TAGS.includes(tag as AccountsScenarioTag)
    ? (tag as AccountsScenarioTag)
    : 'teacher';
}

// MSW mode: register fixtures and select the scenario before any fetch fires,
// then start the worker. A no-op when VITE_API_MODE is unset.
async function bootMocks(tag: AccountsScenarioTag): Promise<void> {
  if (import.meta.env.VITE_API_MODE !== 'msw') return;

  const {setActiveScenario, startMockWorker} = await import(
    '@code-dot-org/core/api/mocks'
  );

  registerAccountsFixtures();
  setActiveScenario({labKey: ACCOUNTS_LAB_KEY, tag});
  await startMockWorker();
}

// Dev-only scenario switcher: reloading with `?scenario=` re-boots MSW under
// the chosen tag.
function ScenarioSwitcher({value}: {value: AccountsScenarioTag}) {
  return (
    <label
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        zIndex: 9999,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: '4px 8px',
        font: '13px sans-serif',
      }}
    >
      Scenario:{' '}
      <select
        value={value}
        onChange={event => {
          const params = new URLSearchParams(window.location.search);
          params.set('scenario', event.target.value);
          window.location.search = params.toString();
        }}
      >
        {ACCOUNTS_SCENARIO_TAGS.map(tag => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
    </label>
  );
}

const scenario = activeScenario();
await bootMocks(scenario);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider>
      <ScenarioSwitcher value={scenario} />
      <AccountSettingsPage />
    </QueryClientProvider>
  </StrictMode>,
);
