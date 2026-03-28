import {useEffect, useState} from 'react';
import {CodeStudioConfig} from '@code-dot-org/core';
import {DashboardApiClient} from '@code-dot-org/core/api';
import type {
  LevelPropertiesResponse,
  UserPreferenceThemeResponse,
} from '@code-dot-org/core/api';
import * as observability from '@code-dot-org/observability';

function App() {
  const [count, setCount] = useState(0);
  const [levelProperties, setLevelProperties] = useState<
    LevelPropertiesResponse | undefined
  >();
  const [theme, setTheme] = useState<UserPreferenceThemeResponse | undefined>();

  useEffect(() => {
    observability.logger.info('MusicLab mounted', {
      environment: CodeStudioConfig.environment,
    });
    observability.metrics.count('music_lab.mount', 1, {
      environment: CodeStudioConfig.environment,
    });

    DashboardApiClient.labs.levels
      .getLevelProperties({levelId: '46446'})
      .then(res => {
        setLevelProperties(res);
        observability.logger.debug('Level properties loaded', {levelId: '46446'});
      })
      .catch(err => {
        observability.logger.error('Failed to load level properties', {error: String(err)});
        observability.recordError(err, {levelId: '46446'});
      });

    DashboardApiClient.users.userPreference
      .getTheme()
      .then(res => {
        setTheme(res);
        observability.logger.debug('Theme loaded', {theme: res});
      })
      .catch(err => {
        observability.logger.error('Failed to load theme', {error: String(err)});
        observability.recordError(err, {context: 'getTheme'});
      });
  }, []);

  function handleCountClick() {
    const next = count + 1;
    setCount(next);
    observability.logger.info('Button clicked', {count: next});
    observability.metrics.count('music_lab.button_click', 1, {count: String(next)});
  }

  return (
    <>
      <h1>Music Lab</h1>
      <div className="card">
        <button onClick={handleCountClick}>count is {count}</button>
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
