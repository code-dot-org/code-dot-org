import {expect} from '../../util/reconfiguredChai';
import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import ScreenSelector from '@cdo/apps/applab/ScreenSelector';
import {reducers} from '@cdo/apps/applab/redux/applab';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import commonReducers from '@cdo/apps/redux/commonReducers';

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
        hasDesignMode: true
      })
    );
    expect(
      render()
        .find('select')
        .props().style.display
    ).not.to.equal('none');
  });

  it('will be hidden on pages without design mode', () => {
    getStore().dispatch(
      setPageConstants({
        hasDesignMode: false
      })
    );
    expect(
      render()
        .find('select')
        .props().style.display
    ).to.equal('none');
  });

  it('will not be hidden on readonly pages', () => {
    getStore().dispatch(
      setPageConstants({
        hasDesignMode: true,
        isReadOnlyWorkspace: true
      })
    );
    expect(
      render()
        .find('select')
        .props().style.display
    ).not.to.equal('none');
  });
});
