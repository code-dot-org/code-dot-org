import {expect} from '../../util/reconfiguredChai';
import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {
  getStore,
  registerReducers,
  __testing_stubRedux,
  __testing_restoreRedux,
} from '@cdo/apps/redux';
import ScreenSelector from '@cdo/apps/applab/ScreenSelector';
import {reducers} from '@cdo/apps/applab/redux/applab';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import commonReducers from '@cdo/apps/redux/commonReducers';

describe('The ScreenSelector component', () => {
  beforeEach(() => {
    __testing_stubRedux();
    registerReducers(commonReducers);
    registerReducers(reducers);
  });

  afterEach(() => {
    __testing_restoreRedux();
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
    expect(render().find('select')).to.have.length(1);
  });

  it('will be hidden on pages without design mode', () => {
    getStore().dispatch(
      setPageConstants({
        hasDesignMode: false,
      })
    );
    expect(render().find('select')).to.have.length(0);
  });

  it('will not be hidden on readonly pages', () => {
    getStore().dispatch(
      setPageConstants({
        hasDesignMode: true,
        isReadOnlyWorkspace: true,
      })
    );
    expect(render().find('select')).to.have.length(1);
  });
});
