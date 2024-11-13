import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import progress, {
  initProgress,
  mergeResults,
  setCurrentLevelId,
} from '@cdo/apps/code-studio/progressRedux';
import {CodebridgeContextProvider} from '@cdo/apps/codebridge';
import ValidatedInstructions from '@cdo/apps/codebridge/InfoPanel/ValidatedInstructions';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import lab, {onLevelChange, setValidationState} from '@cdo/apps/lab2/lab2Redux';
import lab2Project, {setHasEdited} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import predictLevel from '@cdo/apps/lab2/redux/predictLevelRedux';
import lab2System, {setHasRun} from '@cdo/apps/lab2/redux/systemRedux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import commonI18n from '@cdo/locale';

import {
  initProgressPayload,
  validatedLevelProperties,
  levelResults,
  nonValidatedLevelProperties,
  predictLevelProperties,
  submittableLevelProperties,
} from '../test-files';
import {getDefaultCodebridgeContext} from '../test_utils';

describe('ValidatedInstructions', () => {
  let store: Store;
  beforeEach(() => {
    stubRedux();
    registerReducers({
      progress,
      lab,
      predictLevel,
      lab2System,
      lab2Project,
      currentUser,
    });
    store = getStore();
    store.dispatch(initProgress(initProgressPayload));
    store.dispatch(mergeResults(levelResults));
  });

  afterEach(() => {
    restoreRedux();
  });

  function renderDefault() {
    render(
      <Provider store={store}>
        <CodebridgeContextProvider value={getDefaultCodebridgeContext()}>
          <ValidatedInstructions />
        </CodebridgeContextProvider>
      </Provider>
    );
  }

  it('Continue button is visible for an already-passed level', () => {
    store.dispatch(onLevelChange({levelProperties: validatedLevelProperties}));
    // Default progress state is on a level that has already passed.
    renderDefault();

    // Continue button should be present.
    screen.getByRole('button', {name: commonI18n.continue()});
  });

  it('Buttons are correct for a non-validated level', () => {
    // Level 1 in the progression, which is "in progress"
    store.dispatch(setCurrentLevelId('1'));
    store.dispatch(
      onLevelChange({levelProperties: nonValidatedLevelProperties})
    );
    renderDefault();

    expect(
      screen.queryByRole('button', {name: commonI18n.continue()})
    ).toBeNull();

    // Update edit and run flags in redux
    store.dispatch(setHasRun(true));
    store.dispatch(setHasEdited(true));

    // Continue button should be present.
    screen.getByRole('button', {name: commonI18n.continue()});
  });

  it('Buttons are correct for a validated level', () => {
    // Level 3 in the progression is validated and not yet passed
    store.dispatch(setCurrentLevelId('3'));
    store.dispatch(onLevelChange({levelProperties: validatedLevelProperties}));
    store.dispatch(
      setValidationState({
        hasConditions: true,
        satisfied: false,
        message: '',
        index: 0,
      })
    );
    renderDefault();

    // To start theere should be no continue button but there should be a validate button.
    expect(
      screen.queryByRole('button', {name: commonI18n.continue()})
    ).toBeNull();
    screen.getByRole('button', {name: codebridgeI18n.validate()});

    // Set the validation to passed
    store.dispatch(
      setValidationState({
        hasConditions: true,
        satisfied: true,
        message: 'Passed',
        index: 0,
      })
    );

    // Continue button should be present.
    screen.getByRole('button', {name: commonI18n.continue()});
  });

  it('Buttons are correct on a predict level', () => {
    // Level 5 is a predict level that has not yet passed
    store.dispatch(setCurrentLevelId('5'));
    store.dispatch(onLevelChange({levelProperties: predictLevelProperties}));

    renderDefault();

    // No continue button to start
    expect(
      screen.queryByRole('button', {name: commonI18n.continue()})
    ).toBeNull();

    // A predict level has met validation after code is run.
    store.dispatch(setHasRun(true));

    // Continue button should be present.
    screen.getByRole('button', {name: commonI18n.continue()});
  });

  it('Buttons are correct on a submittable level', () => {
    // Make Level 7 a submittable level without validation that has not yet passed.
    store.dispatch(setCurrentLevelId('7'));
    store.dispatch(
      onLevelChange({levelProperties: submittableLevelProperties})
    );

    renderDefault();

    // No submit or unsubmit button to start
    expect(
      screen.queryByRole('button', {name: commonI18n.submit()})
    ).toBeNull();
    expect(
      screen.queryByRole('button', {name: commonI18n.unsubmit()})
    ).toBeNull();

    // Mark code as run and edited; submit should show up
    store.dispatch(setHasRun(true));
    store.dispatch(setHasEdited(true));

    // Submit button should be present.
    screen.getByRole('button', {name: commonI18n.submit()});

    // Now mark level as "submitted", button should change to unsubmit
    store.dispatch(mergeResults({'7': 1000}));

    screen.getByRole('button', {name: commonI18n.unsubmit()});
  });

  it('shows finish button when on the last level', () => {
    // Make level 7 a level without validation.
    store.dispatch(setCurrentLevelId('7'));
    store.dispatch(
      onLevelChange({levelProperties: nonValidatedLevelProperties})
    );

    renderDefault();

    // No finish button to start
    expect(
      screen.queryByRole('button', {name: commonI18n.finish()})
    ).toBeNull();

    // Mark code as run and edited; finish should show up
    store.dispatch(setHasRun(true));
    store.dispatch(setHasEdited(true));

    // Finish button should be present.
    screen.getByRole('button', {name: commonI18n.finish()});
  });
});
