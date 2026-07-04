import {useState} from 'react';

import {QueryClientProvider} from '@code-dot-org/core/api';

import {getScenarioFromUrl, isDevChromeOff} from './getScenarioFromUrl';
import ScenarioSelector from './ScenarioSelector';
import TeacherDashboardPage from './TeacherDashboardPage';

function navigateToScenario(tag: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('scenario', tag);
  window.location.assign(url.toString());
}

/** Standalone dev-shell host: MSW scenario chrome + the placeholder page. */
export default function DevApp() {
  const [tag] = useState(() => getScenarioFromUrl(window.location.search));
  const [devChromeOff] = useState(() => isDevChromeOff(window.location.search));

  return (
    <QueryClientProvider>
      {!devChromeOff && (
        <ScenarioSelector value={tag} onChange={navigateToScenario} />
      )}
      <TeacherDashboardPage />
    </QueryClientProvider>
  );
}
