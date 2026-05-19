import {useEffect} from 'react';

import {CodeStudioConfig} from '@code-dot-org/core';
import * as Observability from '@code-dot-org/core/plugins/observability';

import NeighborhoodVisualization from './NeighborhoodVisualization';

import moduleStyles from './neighborhood.module.scss';

function App() {
  useEffect(() => {
    Observability.logger.info('Neighborhood MiniApp mounted', {
      environment: CodeStudioConfig.environment,
      source: 'neighborhood-mini-app',
    });
    Observability.metrics.count('neighborhood_mini_app.app_mounted', 1, {
      environment: CodeStudioConfig.environment,
      source: 'neighborhood-mini-app',
    });
  }, []);

  return (
    <>
      <h1>Neighborhood MiniApp</h1>
      <div className={moduleStyles.container}>
        <NeighborhoodVisualization isDarkMode={true} />
      </div>
      <p>Dashboard: {CodeStudioConfig.dashboardApiUrl}</p>
    </>
  );
}

export default App;
