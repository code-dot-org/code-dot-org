import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import {reducers} from '@cdo/apps/applab/redux/applab';
import ScreenSelector from '@cdo/apps/applab/ScreenSelector';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';

describe('The ScreenSelector component', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);
    registerReducers(reducers);
  });

  afterEach(() => {
    restoreRedux();
  });

  function render() {
    return mount(
      <Provider store={getStore()}>
        <ScreenSelector
          screenIds={['screen1', 'screen2']}
          onCreate={() => {}}
        />
      </Provider>
    );
  }

  it('renders a select element on pages with design mode', () => {
    getStore().dispatch(
      setPageConstants({
        hasDesignMode: true,
      })
    );
    expect(render().find('select')).toHaveLength(1);
  });

  it('will be hidden on pages without design mode', () => {
    getStore().dispatch(
      setPageConstants({
        hasDesignMode: false,
      })
    );
    expect(render().find('select')).toHaveLength(0);
  });

  it('will not be hidden on readonly pages', () => {
    getStore().dispatch(
      setPageConstants({
        hasDesignMode: true,
        isReadOnlyWorkspace: true,
      })
    );
    expect(render().find('select')).toHaveLength(1);
  });
});
