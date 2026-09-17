// Standalone dev shell. Renders the real lesson deep dive out of apps/src
// with no Rails and no webpack; see README.md.
//
// Mirrors apps/src/sites/studio/pages/lessons/tutor.js, the webpack entry the
// Rails page loads. Only the store differs: Studio's global store is
// assembled by code-studio.js, so the shell supplies the one slice the
// feature reads.

import './nodeShims';

import {StrictMode, type ComponentProps} from 'react';
import {Provider} from 'react-redux';

import LessonDeepDiveContainer from '@cdo/apps/aiTutor/views/lessonDeepDive/LessonDeepDiveContainer';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

import {DevPageChrome} from './devPageChrome';
import {LESSON_DEEP_DIVE_DATA} from './fixtures';
import {registerLessonDeepDiveMocks} from './mocks';

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

async function boot(): Promise<void> {
  // Without the worker, requests go through the Vite proxy to a local Rails
  // dashboard. VITE_API_MODE=msw serves the fixtures instead.
  if (import.meta.env.VITE_API_MODE === 'msw') {
    const {startMockWorker} = await import('@code-dot-org/core/api/mocks');
    registerLessonDeepDiveMocks();
    await startMockWorker();
  }

  createReactRoot(
    <StrictMode>
      <DevPageChrome>
        <Provider store={createDevStore()}>
          <LessonDeepDiveContainer lessonDeepDiveData={LESSON_DEEP_DIVE_DATA} />
        </Provider>
      </DevPageChrome>
    </StrictMode>,
    document.getElementById('lesson-deep-dive-container')!,
  );
}

void boot();
