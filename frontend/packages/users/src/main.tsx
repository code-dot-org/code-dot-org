// Standalone dev host. Mirrors Studio's styling foundation (fonts, color
// tokens, CdoTheme) so the page looks like code.org outside the host.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/shapeAndSpacingVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/brandOverrides.css';

import {CssBaseline, ThemeProvider} from '@mui/material';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';
import {initializeCore} from '@code-dot-org/core';
import {QueryClientProvider} from '@code-dot-org/core/api';
import {analyticsPlugin} from '@code-dot-org/core/plugins/analytics';
import {consentPlugin} from '@code-dot-org/core/plugins/consent';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';
import {injectFontAwesome} from '@code-dot-org/fonts';
import FontLoader from '@code-dot-org/fonts/FontLoader';

import {
  ACCOUNT_SCENARIOS,
  USERS_LAB_KEY,
  USERS_SCENARIO_TAGS,
  registerUsersFixtures,
  type UsersScenarioTag,
} from './fixtures';
import UsersSettingsPage from './UsersSettingsPage';

initializeCore({
  // This host renders no app-config meta, so analytics resolves to provider
  // 'none'. consentPlugin settles immediately without OneTrust on the page,
  // which lets the development console adapter boot.
  plugins: [
    localizationPlugin,
    observabilityPlugin,
    consentPlugin,
    analyticsPlugin,
  ],
});
// FontAwesome icon webfont — dev host only (Studio injects it); without it DSCO
// controls render as blank boxes.
injectFontAwesome();

function activeScenario(): UsersScenarioTag {
  const tag = new URLSearchParams(window.location.search).get('scenario');
  return USERS_SCENARIO_TAGS.includes(tag as UsersScenarioTag)
    ? (tag as UsersScenarioTag)
    : 'teacher';
}

// Selects the scenario before any fetch fires. A no-op unless VITE_API_MODE=msw.
async function bootMocks(tag: UsersScenarioTag): Promise<void> {
  if (import.meta.env.VITE_API_MODE !== 'msw') return;

  const {maybeResetFromUrl, setActiveScenario, startMockWorker} = await import(
    '@code-dot-org/core/api/mocks'
  );

  registerUsersFixtures();
  setActiveScenario({labKey: USERS_LAB_KEY, tag});
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

function ScenarioSwitcher({value}: {value: UsersScenarioTag}) {
  if (devChromeHidden()) return null;
  return (
    <label
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        zIndex: 9999,
        maxWidth: 240,
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
        {USERS_SCENARIO_TAGS.map(tag => (
          <option
            key={tag}
            value={tag}
            title={ACCOUNT_SCENARIOS[tag].description}
          >
            {tag}
          </option>
        ))}
      </select>
      <div style={{marginTop: 4, fontSize: 11, color: '#555'}}>
        {ACCOUNT_SCENARIOS[value].description}
      </div>
    </label>
  );
}

const scenario = activeScenario();
await bootMocks(scenario);

// In studio, Rails puts data-brand on <html> and the app reads it; nothing sets
// it here, so default to the brand production defaults to. `?brand=` overrides
// it for a side-by-side against the legacy tokens.
const brand =
  new URLSearchParams(window.location.search).get('brand') ?? 'codeai-next';
document.documentElement.dataset.brand = brand;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={getMuiThemeForBrand(brand)}>
      <FontLoader locale="en-US" />
      <CssBaseline />
      <QueryClientProvider>
        <ScenarioSwitcher value={scenario} />
        <UsersSettingsPage />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
