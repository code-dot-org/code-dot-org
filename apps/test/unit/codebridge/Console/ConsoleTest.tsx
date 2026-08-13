import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {act, render} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import CodebridgeRegistry from '@cdo/apps/codebridge/CodebridgeRegistry';
import Console from '@cdo/apps/codebridge/Console/Console';
import codebridgeWorkspace from '@cdo/apps/codebridge/redux/workspaceRedux';
import lab from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import lab2Project from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import lab2View from '@cdo/apps/lab2/redux/lab2ViewRedux';
import predictLevel from '@cdo/apps/lab2/redux/predictLevelRedux';
import lab2System, {
  setCodeEnvironmentError,
} from '@cdo/apps/lab2/redux/systemRedux';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import currentUser from '@cdo/apps/templates/currentUserRedux';

jest.mock('@codebridge/codebridgeContext', () => ({
  useCodebridgeContext: () => ({
    sendConsoleInput: jest.fn(),
    onRun: jest.fn(),
    onStop: jest.fn(),
    levelProperties: {id: 1, name: 'level', appName: 'pythonlab'},
  }),
}));

jest.mock('@cdo/apps/lab2/hooks/useLevelActivityMetrics', () => ({
  useLevelActivityMetrics: () => jest.fn(),
}));

const ENVIRONMENT_ERROR = 'Something is blocking Python Lab.';

const consoleLines = () =>
  CodebridgeRegistry.getInstance().getConsoleManager()?.getTerminalLines() ??
  [];

const environmentErrorLines = () =>
  consoleLines().filter(line => line.includes(ENVIRONMENT_ERROR));

describe('Console', () => {
  let store: Store;

  beforeAll(() => {
    // xterm queries the color scheme on open(); jsdom has no matchMedia.
    window.matchMedia = () =>
      ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      } as unknown as MediaQueryList);
  });

  beforeEach(() => {
    stubRedux();
    registerReducers({
      codebridgeWorkspace,
      lab,
      lab2Project,
      lab2System,
      lab2View,
      predictLevel,
      currentUser,
    });
    store = getStore();
    CodebridgeRegistry.create();
  });

  afterEach(() => {
    restoreRedux();
  });

  const renderConsole = () =>
    render(
      <Provider store={store}>
        <ThemeProvider>
          <Console />
        </ThemeProvider>
      </Provider>
    );

  it('writes the environment error to the console when one is reported', () => {
    renderConsole();
    expect(environmentErrorLines()).toHaveLength(0);

    act(() => {
      store.dispatch(setCodeEnvironmentError(ENVIRONMENT_ERROR));
    });

    expect(environmentErrorLines()).toHaveLength(1);
  });

  it('rewrites the environment error after a level change clears the console', () => {
    renderConsole();
    act(() => {
      store.dispatch(setCodeEnvironmentError(ENVIRONMENT_ERROR));
    });

    const notifier = Lab2Registry.getInstance().getLifecycleNotifier();
    act(() => notifier.notify(LifecycleEvent.LevelLoadStarted, 1));
    expect(environmentErrorLines()).toHaveLength(0);

    act(() =>
      notifier.notify(
        LifecycleEvent.LevelLoadCompleted,
        {id: 1, name: 'level', appName: 'pythonlab'},
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      )
    );

    expect(environmentErrorLines()).toHaveLength(1);
  });
});
