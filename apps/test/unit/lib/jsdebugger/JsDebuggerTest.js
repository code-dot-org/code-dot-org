import React from 'react';
import sinon from 'sinon';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import JsDebugger, {UnconnectedJsDebugger} from '@cdo/apps/lib/jsdebugger/JsDebugger';
import JsDebuggerUi from '@cdo/apps/lib/jsdebugger/JsDebuggerUi';
import {getStore, registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';

describe('The JSDebugger component', () => {

  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);
    const codeTextbox = document.createElement('div');
    document.body.appendChild(codeTextbox);
    codeTextbox.id = 'codeTextbox';
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
    const runApp = sinon.spy();
    getStore().dispatch(setPageConstants({
      showDebugButtons: false,
      showDebugConsole: false,
      showDebugWatch: false,
      showDebugSlider: false,
      debuggerUi: new JsDebuggerUi(runApp, getStore()),
    }));
    expect(render().find('#debug-area').isEmpty()).to.be.false;
  });

});
