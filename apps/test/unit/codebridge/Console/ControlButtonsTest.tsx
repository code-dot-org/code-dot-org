import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import ControlButtons from '@cdo/apps/codebridge/Console/ControlButtons';
import lab from '@cdo/apps/lab2/lab2Redux';
import lab2Project from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import predictLevel from '@cdo/apps/lab2/redux/predictLevelRedux';
import lab2System, {
  setCodeEnvironmentError,
  setLoadedCodeEnvironment,
} from '@cdo/apps/lab2/redux/systemRedux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

jest.mock('@codebridge/codebridgeContext', () => ({
  useCodebridgeContext: () => ({
    onRun: jest.fn(),
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
  });

  afterEach(() => {
    restoreRedux();
  });

  const renderControlButtons = () =>
    render(
      <Provider store={store}>
        <ControlButtons />
      </Provider>
    );

  const getRunButton = () => screen.getByRole('button', {name: /run/i});

  // The loading spinner is a decorative <i>, with no role or text of its own to
  // query by, so this checks its class -- which is the whole point of the test.
  const hasSpinner = (container: HTMLElement) =>
    // eslint-disable-next-line no-restricted-properties
    container.querySelector('.fa-spinner') !== null;

  it('shows a spinner on the disabled run button while the environment loads', () => {
    const {container} = renderControlButtons();

    expect(getRunButton()).toBeDisabled();
    expect(hasSpinner(container)).toBe(true);
  });

  it('drops the spinner but keeps the run button disabled when the environment fails to set up', () => {
    const {container} = renderControlButtons();

    store.dispatch(setCodeEnvironmentError('Something blocked the sandbox.'));

    expect(getRunButton()).toBeDisabled();
    expect(hasSpinner(container)).toBe(false);
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
});
