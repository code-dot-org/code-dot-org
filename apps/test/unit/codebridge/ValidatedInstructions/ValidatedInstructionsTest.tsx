import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import progress, {
  initProgress,
  mergeResults,
  setCurrentLevelId,
} from '@cdo/apps/code-studio/progressRedux';
import {CodebridgeContextProvider} from '@cdo/apps/codebridge';
import ValidatedInstructions from '@cdo/apps/codebridge/InfoPanel/ValidatedInstructions';
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
import commonI18n from '@cdo/locale';

import {
  initProgressPayload,
  validatedLevelProperties,
  levelResults,
  nonValidatedLevelProperties,
} from '../test-files';
import {getDefaultCodebridgeContext} from '../test_utils';

describe('ValidatedInstructions', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let store: any;
  beforeEach(() => {
    stubRedux();
    registerReducers({progress, lab, predictLevel, lab2System, lab2Project});
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

  it('For a non-validated level, continue button shows up when you have edited and run code', () => {
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

  it('For a validated level, continue button shows up when you have passed tests', () => {
    // Level 3 in the progression is validated and not yet passed
    store.dispatch(setCurrentLevelId('3'));
    store.dispatch(onLevelChange({levelProperties: validatedLevelProperties}));
    renderDefault();

    expect(
      screen.queryByRole('button', {name: commonI18n.continue()})
    ).toBeNull();

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
});
