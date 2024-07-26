import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import ControlButtons from '@cdo/apps/javalab/ControlButtons';
import javalabView from '@cdo/apps/javalab/redux/viewRedux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

describe('Java Lab Control Buttons Test', () => {
  let defaultProps;
  let store;

  beforeEach(() => {
    defaultProps = {
      isRunning: false,
      isTesting: false,
      toggleRun: () => {},
      toggleTest: () => {},
      isEditingStartSources: false,
      disableFinishButton: false,
      onContinue: () => {},
      disableRunButton: false,
      disableTestButton: false,
      showTestButton: true,
      isSubmittable: false,
      isSubmitted: false,
    };
    stubRedux();
    registerReducers({javalabView});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault(props) {
    return render(
      <Provider store={store}>
        <ControlButtons {...defaultProps} {...props} />
      </Provider>
    );
  }

  it('submit button for unsubmitted submittable level', () => {
    renderDefault({isSubmittable: true, isSubmitted: false});
    expect(screen.getByRole('button', {name: 'Submit'})).toBeDefined();
  });

  it('finish button says finish for non-submittable level', () => {
    renderDefault({isSubmittable: false});
    expect(screen.getByRole('button', {name: 'Finish'})).toBeDefined();
  });

  it('disables run button if disableRunButton is true', () => {
    renderDefault({disableRunButton: true});
    expect(
      screen.getByRole('button', {name: 'Run'}).getAttribute('disabled')
    ).toBeDefined();
  });

  it('disables test button if disableTestButton is true', () => {
    renderDefault({disableTestButton: true});
    expect(
      screen.getByRole('button', {name: 'Test'}).getAttribute('disabled')
    ).toBeDefined();
  });

  it('hides test button if showTestButton is false', () => {
    renderDefault({showTestButton: false});
    expect(screen.queryByRole('button', {name: 'Test'})).toBeNull();
  });
});
