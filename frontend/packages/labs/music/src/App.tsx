import {useEffect, useState} from 'react';
import {CodeStudioConfig} from '@code-dot-org/core';
import {DashboardApiClient} from '@code-dot-org/core/api';
import * as Observability from '@code-dot-org/core/observability';
import type {
  LevelPropertiesResponse,
  UserPreferenceThemeResponse,
} from '@code-dot-org/core/api';

function App() {
  const [count, setCount] = useState(0);
  const [levelProperties, setLevelProperties] = useState<
    LevelPropertiesResponse | undefined
  >();
  const [theme, setTheme] = useState<UserPreferenceThemeResponse | undefined>();

  useEffect(() => {
    Observability.logger.info('Music Lab mounted', {
      environment: CodeStudioConfig.environment,
      source: 'music-lab',
    });
    Observability.metrics.count('music_lab.app_mounted', 1, {
      environment: CodeStudioConfig.environment,
      source: 'music-lab',
    });

    DashboardApiClient.labs.levels
      .getLevelProperties({levelId: '46446'})
      .then(res => setLevelProperties(res));
    DashboardApiClient.users.userPreference
      .getTheme()
      .then(res => setTheme(res));
  }, []);

  const reportObservabilityClick = () => {
    Observability.logger.info('Music Lab observability test button clicked', {
      clickCount: count + 1,
      environment: CodeStudioConfig.environment,
      source: 'music-lab',
    });
    Observability.metrics.count('music_lab.observability_button_clicked', 1, {
      clickCount: count + 1,
      environment: CodeStudioConfig.environment,
      source: 'music-lab',
    });
    setCount(currentCount => currentCount + 1);
  };

  return (
    <>
      <h1>Music Lab</h1>
      <div className="card">
        <button onClick={reportObservabilityClick}>count is {count}</button>
      </div>
      <p>Dashboard: {CodeStudioConfig.dashboardApiUrl}</p>
      <p>
        <strong>Level Properties</strong>
      </p>
      <pre style={{height: 400, overflow: 'auto'}}>
        {levelProperties && JSON.stringify(levelProperties, null, 2)}
      </pre>

      <p>
        <strong>Theme</strong>
      </p>
      <pre style={{height: 400, overflow: 'auto'}}>
        {theme && JSON.stringify(theme, null, 2)}
      </pre>
    </>
  );
}

export default App;
