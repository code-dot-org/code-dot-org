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
  let root, jsDebugger;

  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);

    const codeTextbox = document.createElement('div');
    document.body.appendChild(codeTextbox);
    codeTextbox.id = 'codeTextbox';

    const runApp = sinon.spy();
    getStore().dispatch(setPageConstants({
      showDebugButtons: true,
      showDebugConsole: true,
      showDebugWatch: true,
      showDebugSlider: true,
      debuggerUi: new JsDebuggerUi(runApp, getStore()),
    }));
    root = mount(
      <Provider store={getStore()}>
        <JsDebugger style={{height: 250}}/>
      </Provider>
    );
    jsDebugger = root.find('UnconnectedJsDebugger').get(0);
  });

  afterEach(() => {
    restoreRedux();
  });

  const debugAreaEl = () => root.find('#debug-area').get(0);
  const paneHeader = () => root.find('PaneHeader');
  const closeIcon = () => paneHeader().find('i.fa-chevron-circle-down');
  const openIcon = () => paneHeader().find('i.fa-chevron-circle-up');

  it("renders a div", () => {
    expect(root.find('div#debug-area').isEmpty()).to.be.false;
  });

  it("is initially open", () => {
    expect(jsDebugger.isOpen()).to.be.true;
  });

  it("initially has the height given to it via css", () => {
    expect(debugAreaEl().style.height).to.equal('250px');
  });

  describe("The header", () => {
    it("contains an icon for closing the debugger", () => {
      expect(closeIcon().isEmpty()).to.be.false;
    });
  });

  describe("clicking the close icon", () => {

    beforeEach(() => {
      closeIcon().simulate('click');
    });

    it("will make the isOpen() method return false", () => {
      expect(jsDebugger.isOpen()).to.be.false;
    });

    it("will swap out the open/close icons", () => {
      expect(closeIcon().isEmpty()).to.be.true;
      expect(openIcon().isEmpty()).to.be.false;
    });

    it("will collapse the debugger by setting the height in the css", () => {
      expect(debugAreaEl().style.height).to.equal('30px');
    });

    describe("Then clicking the open icon", () => {

      beforeEach(() => {
        openIcon().simulate('click');
      });

      it("will make isOpen return true again", () => {
        expect(jsDebugger.isOpen()).to.be.true;
      });

      it("will again swap out the open/close icons", () => {
        expect(closeIcon().isEmpty()).to.be.false;
        expect(openIcon().isEmpty()).to.be.true;
      });

      it("will expand the debugger by setting the height in the css", () => {
        expect(debugAreaEl().style.height).to.equal('250px');
      });

      describe("And resizing the debug area with other code", () => {

        beforeEach(() => {
          debugAreaEl().style.height = '350px';
        });

        it("will make closing and opening the debugger return to the same height", () => {
          closeIcon().simulate('click');
          expect(debugAreaEl().style.height).to.equal('30px');
          openIcon().simulate('click');
        });

      });

    });

  });

});
