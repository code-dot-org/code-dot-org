// Standalone dev host entry point. Renders the lesson deep dive with MSW
// mocks and a stub Redux store — zero backend, zero apps/ build.
//
// Scenarios: /?scenario=fresh|aced|sparse

import {configureStore} from '@reduxjs/toolkit';
import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import {injectFontAwesome} from '@code-dot-org/fonts';

// Design-system color custom properties, which the Studio host loads
// globally. The sketchlab canvas draws its shape strokes from them; without
// these sheets the border shorthand is invalid and shapes get no outline.
import '@code-dot-org/component-library-styles/primitiveColors.css';
import '@code-dot-org/component-library-styles/colors.css';

import {currentUserSlice} from './devhost/cdoStubs';
import LessonDeepDiveContainer from './lessonDeepDive/LessonDeepDiveContainer';
import {startMockWorker} from './mocks/browser';
import {SCENARIO_TAGS, SCENARIOS, type ScenarioTag} from './mocks/fixtures';

injectFontAwesome();

const store = configureStore({
  reducer: {currentUser: currentUserSlice.reducer},
});

function activeScenario(): ScenarioTag {
  const tag = new URLSearchParams(window.location.search).get('scenario');
  return SCENARIO_TAGS.includes(tag as ScenarioTag)
    ? (tag as ScenarioTag)
    : 'fresh';
}

async function boot() {
  await startMockWorker();
  const root = createRoot(
    document.getElementById('lesson-deep-dive-container')!,
  );
  root.render(
    <StrictMode>
      <Provider store={store}>
        <LessonDeepDiveContainer
          lessonDeepDiveData={SCENARIOS[activeScenario()]}
        />
      </Provider>
    </StrictMode>,
  );
}

void boot();
