import {renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {useInitialSources} from '@cdo/apps/codebridge/hooks';
import lab from '@cdo/apps/lab2/lab2Redux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

import {smallProjectSources} from '../test-files';

describe('useInitialSources', () => {
  let store: Store;
  beforeEach(() => {
    stubRedux();
    registerReducers({
      lab,
    });
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  function getWrapper() {
    return ({children}: {children?: React.ReactNode}) => (
      <Provider store={store}>{children}</Provider>
    );
  }

  it('returns default sources if none are found', () => {
    const wrapper = getWrapper();
    const {result} = renderHook(() => useInitialSources(smallProjectSources), {
      wrapper,
    });
    const expectedSources = {
      ...smallProjectSources,
      labConfig: undefined,
    };
    const {
      initialSources,
      levelStartSources,
      templateStartSources,
      parsedDefaultSources,
    } = result.current;
    expect(initialSources).toEqual(expectedSources);
    expect(levelStartSources).toBeUndefined();
    expect(templateStartSources).toBeUndefined();
    expect(parsedDefaultSources).toEqual(expectedSources);
  });
});
