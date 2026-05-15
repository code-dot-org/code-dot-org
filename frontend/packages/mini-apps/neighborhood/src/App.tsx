import {useEffect, useState} from 'react';

import {CodeStudioConfig} from '@code-dot-org/core';
import {DashboardApiClient} from '@code-dot-org/core/api';
import type {
  LevelPropertiesMap,
  UserThemeSettings,
} from '@code-dot-org/core/api';
import * as Observability from '@code-dot-org/core/plugins/observability';

import NeighborhoodVisualization from './NeighborhoodVisualization';

function App() {
  const [count, setCount] = useState(0);
  const [levelProperties, setLevelProperties] = useState<
    LevelPropertiesMap | undefined
  >();
  const [theme, setTheme] = useState<UserThemeSettings | null | undefined>();

  useEffect(() => {
    Observability.logger.info('Neighborhood MiniApp mounted', {
      environment: CodeStudioConfig.environment,
      source: 'neighborhood-mini-app',
    });
    Observability.metrics.count('neighborhood_mini_app.app_mounted', 1, {
      environment: CodeStudioConfig.environment,
      source: 'neighborhood-mini-app',
    });

    DashboardApiClient.levels
      .getLevelProperties({levelId: 46446})
      .then(res => setLevelProperties(res));
    DashboardApiClient.preferences
      .getThemeSettings({errorCallback: () => ({})})
      .then(res => setTheme(res));
  }, []);

  const reportObservabilityClick = () => {
    Observability.logger.info(
      'Neighborhood MiniApp observability test button clicked',
      {
        clickCount: count + 1,
        environment: CodeStudioConfig.environment,
        source: 'neighborhood-mini-app',
      },
    );
    Observability.metrics.count(
      'neighborhood_mini_app.observability_button_clicked',
      1,
      {
        clickCount: count + 1,
        environment: CodeStudioConfig.environment,
        source: 'neighborhood-mini-app',
      },
    );
    setCount(currentCount => currentCount + 1);
  };

  return (
    <>
      <h1>Neighborhood MiniApp</h1>
      <NeighborhoodVisualization />
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
