import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {render, screen} from '@testing-library/react';
import ControlButtons from '@cdo/apps/javalab/ControlButtons';
import javalabView from '@cdo/apps/javalab/redux/viewRedux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {Provider} from 'react-redux';

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

  it('submit button for unsubmitted submittable level', () => {
    render(
      <Provider store={store}>
        <ControlButtons {...defaultProps} isSubmittable isSubmitted={false} />
      </Provider>
    );
    expect(screen.getByRole('button', {name: 'Submit'})).to.exist;
  });

  it('finish button says finish for non-submittable level', () => {
    render(
      <Provider store={store}>
        <ControlButtons {...defaultProps} isSubmittable={false} />
      </Provider>
    );
    expect(screen.getByRole('button', {name: 'Finish'})).to.exist;
  });

  it('disables run button if disableRunButton is true', () => {
    render(
      <Provider store={store}>
        <ControlButtons {...defaultProps} disableRunButton />
      </Provider>
    );
    expect(screen.getByRole('button', {name: 'Run'}).getAttribute('disabled'))
      .to.exist;
  });

  it('disables test button if disableTestButton is true', () => {
    render(
      <Provider store={store}>
        <ControlButtons {...defaultProps} disableTestButton />
      </Provider>
    );
    expect(screen.getByRole('button', {name: 'Test'}).getAttribute('disabled'))
      .to.exist;
  });

  it('hides test button if showTestButton is false', () => {
    render(
      <Provider store={store}>
        <ControlButtons {...defaultProps} showTestButton={false} />
      </Provider>
    );
    expect(screen.queryByRole('button', {name: 'Test'})).to.be.null;
  });
});
