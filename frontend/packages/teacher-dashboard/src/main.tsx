import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {
  maybeResetFromUrl,
  setActiveScenario,
  startMockWorker,
} from '@code-dot-org/core/api/mocks';

import DevApp from './DevApp';
import {getScenarioFromUrl} from './getScenarioFromUrl';
import {TEACHER_DASHBOARD_LAB_KEY} from './mocks/scenarios';

// This dev shell only ever runs under MSW — there is no Rails backend to
// point it at (users/README.md:51-55 pattern; design.md §3).
initializeCore();

maybeResetFromUrl();
setActiveScenario({
  labKey: TEACHER_DASHBOARD_LAB_KEY,
  tag: getScenarioFromUrl(window.location.search),
});

await startMockWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DevApp />
  </StrictMode>,
);
