// Standalone dev host. Mirrors Studio's styling foundation (fonts, color
// tokens, CdoTheme) so the page looks like code.org outside the host.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {CssBaseline, ThemeProvider} from '@mui/material';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {CdoTheme} from '@code-dot-org/component-library/themes';
import {initializeCore} from '@code-dot-org/core';
import {QueryClientProvider} from '@code-dot-org/core/api';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';
import FontLoader from '@code-dot-org/fonts/FontLoader';

import AccountSettingsPage from './AccountSettingsPage';
import {
  ACCOUNTS_LAB_KEY,
  ACCOUNTS_SCENARIO_TAGS,
  registerAccountsFixtures,
  type AccountsScenarioTag,
} from './fixtures';
import {loadIconFont} from './iconFont';

initializeCore({plugins: [localizationPlugin, observabilityPlugin]});
loadIconFont();

function activeScenario(): AccountsScenarioTag {
  const tag = new URLSearchParams(window.location.search).get('scenario');
  return ACCOUNTS_SCENARIO_TAGS.includes(tag as AccountsScenarioTag)
    ? (tag as AccountsScenarioTag)
    : 'teacher';
}

// Selects the scenario before any fetch fires. A no-op unless VITE_API_MODE=msw.
async function bootMocks(tag: AccountsScenarioTag): Promise<void> {
  if (import.meta.env.VITE_API_MODE !== 'msw') return;

  const {maybeResetFromUrl, setActiveScenario, startMockWorker} = await import(
    '@code-dot-org/core/api/mocks'
  );

  registerAccountsFixtures();
  setActiveScenario({labKey: ACCOUNTS_LAB_KEY, tag});
  // The write-through store survives reload (sessionStorage); ?cdoMockReset=1
  // wipes it for a clean slate.
  maybeResetFromUrl();
  await startMockWorker();
}

// `?devChrome=off` opts out of the dev chrome (visual tests, embeds, clean
// screenshots) without sniffing the runtime.
function devChromeHidden(): boolean {
  return new URLSearchParams(window.location.search).get('devChrome') === 'off';
}

function ScenarioSwitcher({value}: {value: AccountsScenarioTag}) {
  if (devChromeHidden()) return null;
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
    <ThemeProvider theme={CdoTheme}>
      <FontLoader locale="en-US" />
      <CssBaseline />
      <QueryClientProvider>
        <ScenarioSwitcher value={scenario} />
        <AccountSettingsPage />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
