import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import progress, {
  initProgress,
  mergeResults,
} from '@cdo/apps/code-studio/progressRedux';
import {CodebridgeContextProvider} from '@cdo/apps/codebridge';
import ValidatedInstructions from '@cdo/apps/codebridge/InfoPanel/ValidatedInstructions';
import lab, {onLevelChange} from '@cdo/apps/lab2/lab2Redux';
import lab2Project from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import predictLevel from '@cdo/apps/lab2/redux/predictLevelRedux';
import lab2System from '@cdo/apps/lab2/redux/systemRedux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import commonI18n from '@cdo/locale';

import {
  initProgressPayload,
  levelProperties,
  levelResults,
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
    store.dispatch(onLevelChange({levelProperties}));
  });

  afterEach(() => {
    restoreRedux();
  });

  it('continue button is visible for an already-passed level', () => {
    // Default progress state is on a level that has already passed.
    render(
      <Provider store={store}>
        <CodebridgeContextProvider value={getDefaultCodebridgeContext()}>
          <ValidatedInstructions />
        </CodebridgeContextProvider>
      </Provider>
    );

    // Continue button should be present.
    screen.getByRole('button', {name: commonI18n.continue()});
  });
});
