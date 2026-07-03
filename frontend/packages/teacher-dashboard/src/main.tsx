// Load the design-system fonts and style variables so MUI Typography and the
// component's semantic color tokens (`var(--text-neutral-secondary)`) render
// with real styles — mirroring how apps/studio and the markdown package's
// demo shell set up component-library styling.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {ThemeProvider} from '@mui/material';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {CdoTheme} from '@code-dot-org/component-library/themes';

import {emptySections} from './fixtures/empty';
import {listSections} from './fixtures/list';

import {TeacherDashboardHome} from './index';

const LAB_KEY = 'teacher-dashboard';
const FIXTURE_TAGS = ['empty', 'list'] as const;
type FixtureTag = (typeof FIXTURE_TAGS)[number];

/** `?tag=list` selects the section-list fixture; anything else (including absent) is `empty`. */
function getFixtureTag(): FixtureTag {
  const tag = new URLSearchParams(window.location.search).get('tag');
  return FIXTURE_TAGS.includes(tag as FixtureTag)
    ? (tag as FixtureTag)
    : 'empty';
}

/**
 * Deterministic MSW dev/visual target: registers both scenarios and activates
 * the one selected by `?tag=`, following the lab fixtures wiring
 * (`packages/core/src/api/mocks/README.md`).
 */
async function bootMocks(tag: FixtureTag) {
  const {registerLabFixtures, setActiveScenario, startMockWorker} =
    await import('@code-dot-org/core/api/mocks');

  registerLabFixtures(LAB_KEY, {
    empty: {sections: emptySections},
    list: {sections: listSections},
  });
  setActiveScenario({labKey: LAB_KEY, tag});

  await startMockWorker();
}

await bootMocks(getFixtureTag());

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={CdoTheme}>
      <TeacherDashboardHome />
    </ThemeProvider>
  </StrictMode>,
);
