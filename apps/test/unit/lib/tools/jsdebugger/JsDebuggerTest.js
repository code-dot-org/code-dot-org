import React from 'react';
import sinon from 'sinon';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../../util/deprecatedChai';
import JsDebugger from '@cdo/apps/lib/tools/jsdebugger/JsDebugger';
import {actions, reducers} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {createMouseEvent} from '../../../../util/testUtils.js';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import {sandboxDocumentBody} from '../../../../util/testUtils';
import dom from '@cdo/apps/dom';

describe('The JSDebugger component', () => {
  let root, jsDebugger, addEventSpy, removeEventSpy, codeApp;
  const getBodyEventSpies = spyOnBodyEventMethods();
  sandboxDocumentBody();

  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);
    registerReducers(reducers);

    document.body.innerHTML = '';
    // needs to be around for resizing.
    codeApp = document.createElement('div');
    codeApp.id = 'codeApp';
    document.body.appendChild(codeApp);

    const runApp = sinon.spy();
    getStore().dispatch(
      setPageConstants({
        appType: 'applab',
        showDebugButtons: true,
        showDebugConsole: true,
        showDebugWatch: true,
        showDebugSlider: true,
        debugConsoleDisabled: false
      })
    );
    getStore().dispatch(actions.initialize({runApp}));
    getStore().dispatch(actions.open());

    // Stub getTouchEventName to return valid event names as if we were in Chrome on a
    // mobile device, regardless of what browser the tests are running on.
    sinon
      .stub(dom, 'getTouchEventName')
      .callsFake(name => dom.TOUCH_MAP[name]['standard']);

    ({addEventSpy, removeEventSpy} = getBodyEventSpies());
    ['mousemove', 'touchmove', 'mouseup', 'touchend'].forEach(e => {
      addEventSpy.withArgs(e);
      removeEventSpy.withArgs(e);
    });

    root = mount(
      <Provider store={getStore()}>
        <JsDebugger onSlideOpen={sinon.spy()} onSlideShut={sinon.spy()} />
      </Provider>
    );
    // Get the inner JsDebugger component by name (inside the Radium and
    // React-Redux wrappers).
    jsDebugger = root.find('JsDebugger');
  });

  afterEach(() => {
    root.unmount();
    dom.getTouchEventName.restore();
    restoreRedux();
  });

  const debugAreaEl = () => root.find('#debug-area');
  const paneHeader = () => root.find('PaneHeader');
  const closeIcon = () => paneHeader().find('.fa-chevron-circle-down');
  const openIcon = () => paneHeader().find('.fa-chevron-circle-up');
  const resizeBar = () => root.find('#debugResizeBar');
  const watchersResizeBar = () => root.find('#watchersResizeBar');
  const debugConsole = () => root.find('#debug-console');

  it('renders a div', () => {
    expect(root.find('div#debug-area')).to.exist;
  });

  it('initially has the height of 120px', () => {
    expect(debugAreaEl().instance().style.height).to.equal('120px');
  });

  describe('The header', () => {
    it('contains an icon for closing the debugger', () => {
      expect(closeIcon()).to.exist;
    });
  });

  describe('clicking the close icon', () => {
    beforeEach(() => {
      jsDebugger.instance().slideToggle();
      jsDebugger.update();
    });

    it('will make isOpen return false', () => {
      expect(root.find('JsDebugger').props().isOpen).to.be.false;
    });

    it('will swap out the open/close icons', () => {
      expect(closeIcon()).not.to.exist;
      expect(openIcon()).to.exist;
    });

    it('will collapse the debugger by setting the height in the css', () => {
      expect(debugAreaEl().instance().style.height).to.equal('30px');
    });

    it('will call the onSlideShut prop', () => {
      expect(jsDebugger.props().onSlideShut).to.have.been.called;
    });

    describe('Then clicking the open icon', () => {
      beforeEach(() => {
        jsDebugger.instance().slideToggle();
        jsDebugger.update();
      });

      it('will make isOpen return true again', () => {
        expect(jsDebugger.props().isOpen).to.be.true;
      });

      it('will again swap out the open/close icons', () => {
        expect(closeIcon()).to.exist;
        expect(openIcon()).not.to.exist;
      });

      it('will expand the debugger by setting the height in the css', () => {
        expect(debugAreaEl().instance().style.height).to.equal('120px');
      });

      it('will call the onSlideOpen prop', () => {
        expect(jsDebugger.props().onSlideOpen).to.have.been.called;
      });

      describe('And resizing the debug area with other code', () => {
        beforeEach(() => {
          jsDebugger.instance().setDebugHeight(350);
          jsDebugger.update();
        });

        it('will make closing and opening the debugger return to the same height', () => {
          expect(debugAreaEl().instance().style.height).to.equal('350px');
          jsDebugger.instance().slideToggle();
          jsDebugger.update();
          expect(debugAreaEl().instance().style.height).to.equal('30px');
          jsDebugger.instance().slideToggle();
          jsDebugger.update();
        });
      });
    });
  });

  describe('Resizing the debug bar', () => {
    let codeTextbox;
    beforeEach(() => {
      codeTextbox = document.createElement('div');
      codeTextbox.id = 'codeTextbox';
      document.body.appendChild(codeTextbox);
    });

    afterEach(() => {
      document.body.removeChild(codeTextbox);
    });

    it('mouseup and touchend events on document.body are subscribed to', () => {
      expect(addEventSpy.withArgs('mouseup')).to.have.been.called;
      expect(addEventSpy.withArgs('touchend')).to.have.been.called;
    });

    describe('when the mouse is pressed on the resize bar', () => {
      beforeEach(() => {
        resizeBar().simulate('mouseDown');
      });
      it('starts listening to mouse move events on the docment body', () => {
        expect(addEventSpy.withArgs('mousemove')).to.have.been.called;
        expect(addEventSpy.withArgs('touchmove')).to.have.been.called;
      });

      describe('when the mouse is moved', () => {
        it('changes the height of the debugger', () => {
          document.body.dispatchEvent(
            createMouseEvent('touchmove', 0, window.innerHeight - 200)
          );
          jsDebugger.update();
          expect(debugAreaEl().instance().style.height).to.equal('200px');
        });

        it('and will do so multiple times', () => {
          document.body.dispatchEvent(
            createMouseEvent('touchmove', 0, window.innerHeight - 180)
          );
          jsDebugger.update();
          expect(debugAreaEl().instance().style.height).to.equal('180px');
        });

        describe('when the mouse is unpressed', () => {
          beforeEach(() => {
            document.body.dispatchEvent(createMouseEvent('touchmove', 0, 120));
            addEventSpy
              .withArgs('touchend')
              .args.forEach(args => args[1](new CustomEvent('touchend')));
          });

          it('will stop responding to mouse move events', () => {
            expect(removeEventSpy.withArgs('touchmove')).to.have.been.called;
            expect(removeEventSpy.withArgs('mousemove')).to.have.been.called;
          });
        });
      });
    });
  });

  describe('Resizing the watchers bar', () => {
    it('mouseup and touchend events on document.body are subscribed to', () => {
      expect(addEventSpy.withArgs('mouseup')).to.have.been.called;
      expect(addEventSpy.withArgs('touchend')).to.have.been.called;
    });

    describe('when the mouse is pressed on the resize bar', () => {
      beforeEach(() => {
        watchersResizeBar().simulate('mouseDown');
      });

      it('starts listening to mouse move events on the docment body', () => {
        expect(addEventSpy.withArgs('mousemove')).to.have.been.called;
        expect(addEventSpy.withArgs('touchmove')).to.have.been.called;
      });

      it('does not change the position of anything', () => {
        expect(watchersResizeBar().instance().style.right).to.equal('');
        expect(debugConsole().instance().style.right).to.equal('');
      });

      describe('when the mouse is moved', () => {
        beforeEach(() => {
          document.body.dispatchEvent(createMouseEvent('touchmove', -300, 0));
          jsDebugger.update();
        });

        it("changes the 'right' position of the watchers resize bar", () => {
          expect(watchersResizeBar().instance().style.right).to.equal('300px');
        });

        it("changes the 'right' style of the debug console", () => {
          expect(debugConsole().instance().style.right).to.equal('300px');
        });

        it('and will do so multiple times', () => {
          document.body.dispatchEvent(createMouseEvent('touchmove', -320, 0));
          expect(debugConsole().instance().style.right).to.equal('320px');
        });

        describe('when the mouse is unpressed', () => {
          beforeEach(() => {
            document.body.dispatchEvent(createMouseEvent('touchmove', -320, 0));
            addEventSpy
              .withArgs('touchend')
              .args.forEach(args => args[1](new CustomEvent('touchend')));
          });

          it('will stop responding to mouse move events', () => {
            expect(removeEventSpy.withArgs('touchmove')).to.have.been.called;
            expect(removeEventSpy.withArgs('mousemove')).to.have.been.called;
          });
        });
      });
    });
  });
});

/**
 * Safe-spies on document.body.addEventListener and on
 * document.body.removeEventListener. See createOrCaptureSpy() for details.
 * @returns {function(): {addEventSpy: spy, removeEventSpy: spy}}
 */
function spyOnBodyEventMethods() {
  const getAddEventSpy = createOrCaptureSpy(document.body, 'addEventListener');
  const getRemoveEventSpy = createOrCaptureSpy(
    document.body,
    'removeEventListener'
  );

  return () => ({
    addEventSpy: getAddEventSpy(),
    removeEventSpy: getRemoveEventSpy()
  });
}

/**
 * Helper for spying on a method that might already be spied on at some level
 * above this test - for example, by some of our test cleanup assertions.
 *
 * If the method is already spied upon, we assert that it hasn't been called
 * yet and capture a reference to that spy for use in this test, but we don't
 * clean it up because the parent spy-er will do that.
 *
 * If the method is not spied upon, we spy on it and clean it up properly.
 *
 * This helper performs its own beforeEach/afterEach operations so it should
 * be called directly inside a describe block.  It returns a getter for the
 * captured spy which can be called from subsequent beforeEach blocks or in
 * the body of the test.
 *
 * @param {Object} parentObj - parent of the method to be spied upon.
 * @param {string} methodName - name of the method to be spied upon.
 * @returns {function(): spy} Getter for the captured spy.
 */
function createOrCaptureSpy(parentObj, methodName) {
  let spyFn, wasCaptured;

  beforeEach(() => {
    if (parentObj[methodName].hasOwnProperty('callCount')) {
      // Something is already spying on this method.  Capture the spy for use
      // in our test, and don't clean it up ourselves.
      spyFn = parentObj[methodName];
      expect(spyFn).not.to.have.been.called;
      wasCaptured = true;
    } else {
      spyFn = sinon.spy(parentObj, methodName);
      wasCaptured = false;
    }
  });

  afterEach(() => {
    if (!wasCaptured) {
      spyFn.restore();
    }
  });

  return () => spyFn;
}
