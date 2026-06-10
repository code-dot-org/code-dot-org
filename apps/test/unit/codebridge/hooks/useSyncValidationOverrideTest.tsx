import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {useSyncValidationOverride} from '@cdo/apps/codebridge/hooks/useSyncValidationOverride';
import lab from '@cdo/apps/lab2/lab2Redux';
import {PASSED_ALL_TESTS_VALIDATION} from '@cdo/apps/lab2/progress/constants';
import lab2Project, {
  setProjectSource,
} from '@cdo/apps/lab2/redux/lab2ProjectRedux';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

import {testProject} from '../test-files';
import {mockAppOptions} from '../test_utils';

// Build a source from testProject containing exactly `count` validation files.
function sourceWithValidationFiles(count: number): MultiFileSource {
  const files = {...testProject.files};
  let validationFilesSeen = 0;
  for (const id of Object.keys(files)) {
    const isValidation = files[id].type === ProjectFileType.VALIDATION;
    if (isValidation) {
      validationFilesSeen++;
    }
  }
  // testProject already has one validation file (id 7); add more as needed.
  for (let i = 0; validationFilesSeen < count; i++, validationFilesSeen++) {
    const newId = `validation-${i}`;
    files[newId] = {
      ...testProject.files['7'],
      id: newId,
      name: `validation_${i}.vld`,
    };
  }
  // Strip validation files entirely when none are wanted.
  if (count === 0) {
    for (const id of Object.keys(files)) {
      if (files[id].type === ProjectFileType.VALIDATION) {
        delete files[id];
      }
    }
  }
  return {...testProject, files};
}

describe('useSyncValidationOverride', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({lab, lab2Project});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    jest.resetAllMocks();
  });

  function renderWithSource(source: MultiFileSource) {
    act(() => {
      store.dispatch(setProjectSource({source}));
    });
    const wrapper = ({children}: {children?: React.ReactNode}) => (
      <Provider store={store}>{children}</Provider>
    );
    return renderHook(() => useSyncValidationOverride(), {wrapper});
  }

  const overrideValidations = () => store.getState().lab.overrideValidations;

  it('sets the passed-all-tests override when the project has a validation file', () => {
    mockAppOptions({editBlocks: 'start_sources'});
    renderWithSource(sourceWithValidationFiles(1));
    expect(overrideValidations()).toEqual([PASSED_ALL_TESTS_VALIDATION]);
  });

  it('clears the override when the project has no validation file', () => {
    mockAppOptions({editBlocks: 'start_sources'});
    renderWithSource(sourceWithValidationFiles(0));
    expect(overrideValidations()).toEqual([]);
  });

  it('keeps the override set while any validation file remains', () => {
    mockAppOptions({editBlocks: 'start_sources'});
    renderWithSource(sourceWithValidationFiles(2));
    expect(overrideValidations()).toEqual([PASSED_ALL_TESTS_VALIDATION]);

    // Removing one of two validation files must not clear the override.
    act(() => {
      store.dispatch(setProjectSource({source: sourceWithValidationFiles(1)}));
    });
    expect(overrideValidations()).toEqual([PASSED_ALL_TESTS_VALIDATION]);

    // Removing the last validation file clears it.
    act(() => {
      store.dispatch(setProjectSource({source: sourceWithValidationFiles(0)}));
    });
    expect(overrideValidations()).toEqual([]);
  });

  it('does nothing outside start mode', () => {
    mockAppOptions({editBlocks: undefined});
    renderWithSource(sourceWithValidationFiles(1));
    expect(overrideValidations()).toBeUndefined();
  });
});
