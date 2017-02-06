import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import JsDebugger, {UnconnectedJsDebugger} from '@cdo/apps/lib/jsdebugger/JsDebugger';
import {getStore, registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';

describe('The JSDebugger component', () => {

  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);
  });

  afterEach(() => {
    restoreRedux();
  });

  function render() {
    return mount(
      <Provider store={getStore()}>
        <JsDebugger />
      </Provider>
    );
  }

  it("renders a div", () => {
    getStore().dispatch(setPageConstants({
      showDebugButtons: false,
      showDebugConsole: false,
      showDebugWatch: false,
      showDebugSlider: false,
    }));
    expect(render().containsMatchingElement(<div/>)).to.be.true;
  });

});
