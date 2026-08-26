import {act, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import CodebridgeRegistry from '@cdo/apps/codebridge/CodebridgeRegistry';
import ControlButtons from '@cdo/apps/codebridge/Console/ControlButtons';
import {MiniApps} from '@cdo/apps/codebridge/constants';
import lab from '@cdo/apps/lab2/lab2Redux';
import lab2Project, {
  setProjectSource,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import predictLevel from '@cdo/apps/lab2/redux/predictLevelRedux';
import lab2System, {
  setCodeEnvironmentError,
  setLoadedCodeEnvironment,
} from '@cdo/apps/lab2/redux/systemRedux';
import {ProjectSources} from '@cdo/apps/lab2/types';
import Theater from '@cdo/apps/miniApps/theater/Theater';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

// Assigned per test so a run can be settled on demand; the name has to start
// with "mock" for jest to allow it inside the hoisted factory.
let mockOnRun: jest.Mock;

jest.mock('@codebridge/codebridgeContext', () => ({
  useCodebridgeContext: () => ({
    onRun: mockOnRun,
    onStop: jest.fn(),
    levelProperties: {id: 1, name: 'level', appName: 'pythonlab'},
  }),
}));

jest.mock('@cdo/apps/lab2/hooks/useLevelActivityMetrics', () => ({
  useLevelActivityMetrics: () => jest.fn(),
}));

describe('ControlButtons', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({lab, lab2Project, lab2System, predictLevel});
    store = getStore();
    mockOnRun = jest.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    restoreRedux();
    CodebridgeRegistry.getInstance().setTheater(null);
  });

  const renderControlButtons = () =>
    render(
      <Provider store={store}>
        <ControlButtons />
      </Provider>
    );

  const getRunButton = () => screen.getByRole('button', {name: /run/i});

  const hasStopButton = () =>
    screen.queryByRole('button', {name: /stop/i}) !== null;

  // A theater level whose stage is driven by the given fake theater.
  const setUpTheaterLevel = (theater: Partial<Theater>) => {
    store.dispatch(setLoadedCodeEnvironment(true));
    store.dispatch(
      setProjectSource({
        labConfig: {miniApp: {name: MiniApps.Theater}},
      } as unknown as ProjectSources)
    );
    CodebridgeRegistry.getInstance().setTheater(theater as Theater);
  };

  // MUI's pending state swaps the button's icon for a spinner. Which element
  // that spinner is depends on the theme, so check the class MUI puts on the
  // button instead.
  const isPending = () =>
    getRunButton().classList.contains('MuiButton-loading');

  it('shows the disabled run button as pending while the environment loads', () => {
    renderControlButtons();

    expect(getRunButton()).toBeDisabled();
    expect(isPending()).toBe(true);
  });

  it('drops the pending state but keeps the run button disabled when the environment fails to set up', () => {
    renderControlButtons();

    store.dispatch(setCodeEnvironmentError('Something blocked the sandbox.'));

    expect(getRunButton()).toBeDisabled();
    expect(isPending()).toBe(false);
  });

  it('keeps the run button disabled even once the environment loads, if setup failed', () => {
    renderControlButtons();

    store.dispatch(setCodeEnvironmentError('Something blocked the sandbox.'));
    store.dispatch(setLoadedCodeEnvironment(true));

    expect(getRunButton()).toBeDisabled();
  });

  it('enables the run button once the environment loads', () => {
    renderControlButtons();

    store.dispatch(setLoadedCodeEnvironment(true));

    expect(getRunButton()).toBeEnabled();
  });

  it('keeps the run button on stop until the theater finishes playing', async () => {
    let finishPlayback = () => {};
    const playbackDone = new Promise<void>(resolve => {
      finishPlayback = resolve;
    });
    setUpTheaterLevel({waitUntilPlaybackDone: () => playbackDone});
    renderControlButtons();

    await act(async () => {
      getRunButton().click();
    });

    // The program has finished, but its gif and audio have not.
    expect(mockOnRun).toHaveBeenCalledTimes(1);
    expect(hasStopButton()).toBe(true);

    await act(async () => {
      finishPlayback();
    });

    expect(hasStopButton()).toBe(false);
  });

  it('keeps the run button on stop until a program that outlives its gif finishes', async () => {
    let finishProgram = () => {};
    mockOnRun = jest.fn(
      () =>
        new Promise<void>(resolve => {
          finishProgram = resolve;
        })
    );
    // Playback is already over by the time the program ends.
    setUpTheaterLevel({waitUntilPlaybackDone: () => Promise.resolve()});
    renderControlButtons();

    await act(async () => {
      getRunButton().click();
    });

    expect(hasStopButton()).toBe(true);

    await act(async () => {
      finishProgram();
    });

    expect(hasStopButton()).toBe(false);
  });
});
