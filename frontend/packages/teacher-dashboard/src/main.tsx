// Standalone dev host entry point. Recreates the Studio provider stack so the
// Teacher Dashboard homepage renders identically — zero backend needed.
//
// Usage: VITE_API_MODE=msw yarn dev

import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import './devhost/productionResets.css';

import {CssBaseline, ThemeProvider} from '@mui/material';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';

import {CdoTheme} from '@code-dot-org/component-library/themes';
import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';
import {injectSlices} from '@code-dot-org/core/redux';
import {injectFontAwesome} from '@code-dot-org/fonts';
import FontLoader from '@code-dot-org/fonts/FontLoader';

import {
  currentUserSlice,
  setCurrentUser,
  DCDO,
  experiments,
  setStoreRef,
} from './devhost/cdoStubs';
import TeacherHomepage from './home/TeacherHomepage';
import {
  HOMEPAGE_LAB_KEY,
  PERSONA_TAGS,
  PERSONAS,
  registerHomepageFixtures,
  type PersonaTag,
} from './mocks';
import {teacherSectionsSlice, setSections} from './redux/teacherSectionsRedux';

initializeCore({plugins: [localizationPlugin, observabilityPlugin]});
injectFontAwesome();

// Inject the Redux slices into the core store.
const store = injectSlices([teacherSectionsSlice, currentUserSlice]);
setStoreRef(store);

function activePersona(): PersonaTag {
  const tag = new URLSearchParams(window.location.search).get('persona');
  return PERSONA_TAGS.includes(tag as PersonaTag)
    ? (tag as PersonaTag)
    : 'established';
}

async function bootMocks(tag: PersonaTag): Promise<void> {
  if (import.meta.env.VITE_API_MODE !== 'msw') return;

  const {maybeResetFromUrl, setActiveScenario, startMockWorker} = await import(
    '@code-dot-org/core/api/mocks'
  );

  registerHomepageFixtures();
  setActiveScenario({labKey: HOMEPAGE_LAB_KEY, tag});
  maybeResetFromUrl();
  await startMockWorker();
}

function seedStoreFromPersona(tag: PersonaTag): void {
  const persona = PERSONAS[tag];

  // Seed DCDO flags and experiments before render.
  DCDO._seed(persona.flags);
  experiments._seed(persona.experiments);

  // Populate the currentUser slice.
  store.dispatch(
    setCurrentUser({
      userId: persona.currentUser.userId,
      displayName: persona.currentUser.displayName,
      gradesTeaching: persona.currentUser.gradesTeaching,
      aiChatAccessLevel: persona.currentUser.aiChatAccessLevel,
    }),
  );

  // Bootstrap sections into the Redux store (mirrors the Rails-rendered
  // script tag in production that calls setSections on page load).
  if (persona.sections.length > 0) {
    store.dispatch(setSections(persona.sections));
  }
}

function devChromeHidden(): boolean {
  return new URLSearchParams(window.location.search).get('devChrome') === 'off';
}

function PersonaSwitcher({value}: {value: PersonaTag}) {
  if (devChromeHidden()) return null;
  return (
    <label
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        zIndex: 9999,
        maxWidth: 280,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: '4px 8px',
        font: '13px sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      Persona:{' '}
      <select
        value={value}
        onChange={event => {
          const params = new URLSearchParams(window.location.search);
          params.set('persona', event.target.value);
          window.location.search = params.toString();
        }}
      >
        {PERSONA_TAGS.map(tag => (
          <option key={tag} value={tag} title={PERSONAS[tag].description}>
            {PERSONAS[tag].label}
          </option>
        ))}
      </select>
      <div style={{marginTop: 4, fontSize: 11, color: '#555'}}>
        {PERSONAS[value].description}
      </div>
    </label>
  );
}

const persona = activePersona();
seedStoreFromPersona(persona);
await bootMocks(persona);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={CdoTheme}>
        <FontLoader locale="en-US" />
        <CssBaseline />
        <BrowserRouter>
          <PersonaSwitcher value={persona} />
          <TeacherHomepage studioUrlPrefix="" />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
