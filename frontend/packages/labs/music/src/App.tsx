import {useEffect, useState} from 'react';

import {CodeStudioConfig} from '@code-dot-org/core';
import {
  DashboardApiClient,
  useLevelProperties,
  useApiClient,
} from '@code-dot-org/core/api';
import type {UserThemeSettings} from '@code-dot-org/core/api';
import * as Observability from '@code-dot-org/core/plugins/observability';

function App() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<UserThemeSettings | null | undefined>();

  useEffect(() => {
    Observability.logger.info('Music Lab mounted', {
      environment: CodeStudioConfig.environment,
      source: 'music-lab',
    });
    Observability.metrics.count('music_lab.app_mounted', 1, {
      environment: CodeStudioConfig.environment,
      source: 'music-lab',
    });
    DashboardApiClient.preferences
      .getThemeSettings({errorCallback: () => ({})})
      .then(res => setTheme(res));
  }, []);

  const api = useApiClient();
  const {data: levelPropertiesMap} = useLevelProperties(api, {levelId: 46446});
  const levelProperties = levelPropertiesMap?.['46446'];

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
