import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {AiChatDisabledProvider} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import progress from '@cdo/apps/code-studio/progressRedux';
import lab from '@cdo/apps/lab2/lab2Redux';
import lab2Project from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import lab2System from '@cdo/apps/lab2/redux/systemRedux';
import {LevelProperties, ProjectSources} from '@cdo/apps/lab2/types';
import {PythonlabView} from '@cdo/apps/pythonlab';
import {STANDALONE_NEIGHBORHOOD_PROJECT} from '@cdo/apps/pythonlab/constants';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

jest.mock('@codebridge/Codebridge', () => {
  return {
    Codebridge: jest.fn(() => <div>Codebridge</div>),
  };
});

jest.mock('@cdo/apps/pythonlab/pyodideWorkerManager', () => {
  return {
    restartPyodideIfProgramIsRunning: jest.fn(),
    sendInput: jest.fn(),
  };
});

const defaultLevelProperties: LevelProperties = {
  id: 0,
  name: '',
  appName: 'pythonlab',
};

describe('PythonLabView', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      progress,
      lab2Project,
      lab,
      lab2System,
    });

    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault(
    levelProperties: LevelProperties,
    initialSources: ProjectSources | undefined
  ) {
    return render(
      <Provider store={store}>
        <ThemeProvider>
          <AiChatDisabledProvider>
            <PythonlabView
              levelProperties={levelProperties}
              initialSources={initialSources}
            />
          </AiChatDisabledProvider>
        </ThemeProvider>
      </Provider>
    );
  }

  it('shows project type picker when loading project level for the first time', () => {
    renderDefault({...defaultLevelProperties, isProjectLevel: true}, undefined);

    // Look for the project type picker buttons
    screen.getByRole('button', {name: 'Console only'});
    screen.getByRole('button', {name: 'Neighborhood'});
  });

  it('does not show project type picker if project type is already set', () => {
    renderDefault(
      {...defaultLevelProperties, isProjectLevel: true},
      STANDALONE_NEIGHBORHOOD_PROJECT
    );

    expect(screen.queryByRole('button', {name: 'Console only'})).toBeNull();
  });

  it('does not show project type picker if not a project level', () => {
    renderDefault(defaultLevelProperties, undefined);

    expect(screen.queryByRole('button', {name: 'Console only'})).toBeNull();
  });
});
