import {act, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import HeaderButtons from '@cdo/apps/codebridge/Workspace/HeaderButtons';
import lab2Project, {
  setViewingAiTutorVersion,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

jest.mock('@codebridge/codebridgeContext', () => ({
  useCodebridgeContext: () => ({
    levelProperties: {id: 1, name: 'level', appName: 'pythonlab'},
    projectPickerSettings: {
      currentType: 'Console',
      showProjectTypePicker: jest.fn(),
    },
  }),
}));

describe('HeaderButtons', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({lab2Project});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  it('disables the project type picker during an AI Tutor review', () => {
    render(
      <Provider store={store}>
        <HeaderButtons />
      </Provider>
    );
    const pickerButton = () =>
      screen.getByRole('button', {name: /output type/i});
    expect(pickerButton()).toBeEnabled();

    act(() => {
      store.dispatch(setViewingAiTutorVersion(true));
    });

    expect(pickerButton()).toBeDisabled();
  });
});
