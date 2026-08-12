// Standalone dev shell. Renders the real lesson deep dive out of apps/src
// with no Rails and no webpack; see README.md.
//
// Mirrors apps/src/sites/studio/pages/lessons/tutor.js, the webpack entry the
// Rails page loads. Only the store differs: Studio's global store is
// assembled by code-studio.js, so the shell supplies the one slice the
// feature reads.

import './nodeShims';

// Studio serves Geist and Noto Sans from application.css @font-face; these are
// the same families, packaged.
import '@code-dot-org/fonts/brands/code.org/index.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/shapeAndSpacingVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/brandOverrides.css';

import {CssBaseline, GlobalStyles, ThemeProvider} from '@mui/material';
import {StrictMode, type ComponentProps} from 'react';
import {Provider} from 'react-redux';

import {getMuiThemeForBrand} from '@code-dot-org/component-library/themes';
import {injectFontAwesome} from '@code-dot-org/fonts';

import LessonDeepDiveContainer from '@cdo/apps/aiTutor/views/lessonDeepDive/LessonDeepDiveContainer';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

import {LESSON_DEEP_DIVE_DATA} from './fixtures';
import {registerLessonDeepDiveMocks} from './mocks';

// The feature is height: calc(100vh - 50px), sizing itself to sit under
// Studio's 50px header. Reserve that band rather than letting the feature
// float in it, so its own arithmetic comes out right here too; paint it the
// colour of .container in lesson-deep-dive-container.module.scss so the strip
// does not read as a gap.
//
// Through GlobalStyles because CssBaseline writes body styles at render time
// and beats a plain stylesheet.
const pageFrame = (
  <GlobalStyles styles={{body: {background: '#292f36', paddingTop: '50px'}}} />
);

type ProviderStore = ComponentProps<typeof Provider>['store'];

// Studio's page chrome registers currentUser and header.js fills displayName
// from /api/v1/users/current, so it is undefined until that lands;
// ?displayName= renders the greeting instead of the "friend" fallback.
function createDevStore(): ProviderStore {
  const state = {
    currentUser: {
      userId: 12345,
      displayName:
        new URLSearchParams(window.location.search).get('displayName') ??
        undefined,
      userType: 'student',
      signInState: 'SignedIn',
    },
  };
  return {
    getState: () => state,
    dispatch: (action: unknown) => action,
    subscribe: () => () => {},
    replaceReducer: () => {},
  } as unknown as ProviderStore;
}

// Studio's page chrome links the Font Awesome Pro sheets; without them the
// FontAwesomeV6Icon <i> elements collapse to zero width and shift layout.
injectFontAwesome();

async function boot(): Promise<void> {
  const {startMockWorker} = await import('@code-dot-org/core/api/mocks');
  registerLessonDeepDiveMocks();
  await startMockWorker();

  createReactRoot(
    <StrictMode>
      <ThemeProvider theme={getMuiThemeForBrand('codeai-next')}>
        <CssBaseline />
        {pageFrame}
        <Provider store={createDevStore()}>
          <LessonDeepDiveContainer lessonDeepDiveData={LESSON_DEEP_DIVE_DATA} />
        </Provider>
      </ThemeProvider>
    </StrictMode>,
    document.getElementById('lesson-deep-dive-container')!,
  );
}

void boot();
