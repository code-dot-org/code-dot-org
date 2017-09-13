import React from 'react';
import sinon from 'sinon';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../../util/configuredChai';
import JsDebugger from '@cdo/apps/lib/tools/jsdebugger/JsDebugger';
import {actions, reducers} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {getStore, registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';

describe('The JSDebugger component', () => {
  let root, jsDebugger, addEventSpy, removeEventSpy, codeApp;

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
    getStore().dispatch(setPageConstants({
      appType: 'applab',
      showDebugButtons: true,
      showDebugConsole: true,
      showDebugWatch: true,
      showDebugSlider: true,
    }));
    getStore().dispatch(actions.initialize({runApp}));
    getStore().dispatch(actions.open());

    addEventSpy = sinon.spy(document.body, 'addEventListener');
    removeEventSpy = sinon.spy(document.body, 'removeEventListener');
    ['mousemove', 'touchmove', 'mouseup', 'touchend'].forEach(e => {
      addEventSpy.withArgs(e);
      removeEventSpy.withArgs(e);
    });

    root = mount(
      <Provider store={getStore()}>
        <JsDebugger
          onSlideOpen={sinon.spy()}
          onSlideShut={sinon.spy()}
        />
      </Provider>
    );
    jsDebugger = root.find('UnconnectedJsDebugger').get(0);
  });

  afterEach(() => {
    restoreRedux();
    addEventSpy.restore();
    removeEventSpy.restore();
    document.body.removeChild(codeApp);
  });

  const debugAreaEl = () => root.find('#debug-area').get(0);
  const paneHeader = () => root.find('PaneHeader');
  const closeIcon = () => paneHeader().find('.fa-chevron-circle-down');
  const openIcon = () => paneHeader().find('.fa-chevron-circle-up');
  const resizeBar = () => root.find('#debugResizeBar');
  const watchersResizeBar = () => root.find('#watchersResizeBar');
  const debugConsole = () => root.find('#debug-console');

  it("renders a div", () => {
    expect(root.find('div#debug-area')).to.exist;
  });

  it("initially has the height of 120px", () => {
    expect(debugAreaEl().style.height).to.equal('120px');
  });

  describe("The header", () => {
    it("contains an icon for closing the debugger", () => {
      expect(closeIcon()).to.exist;
    });
  });

  describe("clicking the close icon", () => {

    beforeEach(() => {
      closeIcon().simulate('click');
    });

    it("will make the isOpen() method return false", () => {
      expect(jsDebugger.props.isOpen).to.be.false;
    });

    it("will swap out the open/close icons", () => {
      expect(closeIcon()).not.to.exist;
      expect(openIcon()).to.exist;
    });

    it("will collapse the debugger by setting the height in the css", () => {
      expect(debugAreaEl().style.height).to.equal('30px');
    });

    it("will call the onSlideShut prop", () => {
      expect(jsDebugger.props.onSlideShut).to.have.been.called;
    });

    describe("Then clicking the open icon", () => {

      beforeEach(() => {
        openIcon().simulate('click');
      });

      it("will make isOpen return true again", () => {
        expect(jsDebugger.props.isOpen).to.be.true;
      });

      it("will again swap out the open/close icons", () => {
        expect(closeIcon()).to.exist;
        expect(openIcon()).not.to.exist;
      });

      it("will expand the debugger by setting the height in the css", () => {
        expect(debugAreaEl().style.height).to.equal('120px');
      });

      it("will call the onSlideOpen prop", () => {
        expect(jsDebugger.props.onSlideOpen).to.have.been.called;
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

  describe("Resizing the debug bar", () => {
    let codeTextbox;
    beforeEach(() => {
      codeTextbox = document.createElement('div');
      codeTextbox.id = 'codeTextbox';
      document.body.appendChild(codeTextbox);
    });

    afterEach(() => {
      document.body.removeChild(codeTextbox);
    });

    it("mouseup and touchend events on document.body are subscribed to", () => {
      expect(addEventSpy.withArgs('mouseup')).to.have.been.called;
      expect(addEventSpy.withArgs('touchend')).to.have.been.called;
    });

    describe("when the mouse is pressed on the resize bar", () => {
      beforeEach(() => {
        resizeBar().simulate('mouseDown');
      });
      it("starts listening to mouse move events on the docment body", () => {
        expect(addEventSpy.withArgs('mousemove')).to.have.been.called;
        expect(addEventSpy.withArgs('touchmove')).to.have.been.called;
      });

      describe("when the mouse is moved", () => {
        const moveTo = (pageY) => {
          const moveEvent = new CustomEvent('touchmove');
          moveEvent.pageY = pageY;
          addEventSpy.withArgs('touchmove').args.forEach(args => args[1](moveEvent));
        };
        it("changes the height of the debugger", () => {
          moveTo(100);
          expect(jsDebugger.root.style.height).to.equal('200px');
        });

        it("and will do so multiple times", () => {
          moveTo(120);
          expect(jsDebugger.root.style.height).to.equal('180px');
        });

        describe("when the mouse is unpressed", () => {
          beforeEach(() => {
            moveTo(120);
            addEventSpy.withArgs('touchend').args.forEach(args => args[1](new CustomEvent('touchend')));
          });

          it("will stop responding to mouse move events", () => {
            expect(removeEventSpy.withArgs('touchmove')).to.have.been.called;
            expect(removeEventSpy.withArgs('mousemove')).to.have.been.called;
          });
        });
      });
    });
  });

  describe("Resizing the watchers bar", () => {
    it("mouseup and touchend events on document.body are subscribed to", () => {
      expect(addEventSpy.withArgs('mouseup')).to.have.been.called;
      expect(addEventSpy.withArgs('touchend')).to.have.been.called;
    });

    describe("when the mouse is pressed on the resize bar", () => {
      beforeEach(() => {
        watchersResizeBar().simulate('mouseDown');
      });

      it("starts listening to mouse move events on the docment body", () => {
        expect(addEventSpy.withArgs('mousemove')).to.have.been.called;
        expect(addEventSpy.withArgs('touchmove')).to.have.been.called;
      });

      it("does not change the position of anything", () => {
        expect(watchersResizeBar().get(0).style.right).to.equal('');
        expect(debugConsole().get(0).style.right).to.equal('');
      });

      describe("when the mouse is moved", () => {
        const moveTo = (clientX) => {
          const moveEvent = new CustomEvent('touchmove');
          moveEvent.clientX = clientX;
          addEventSpy.withArgs('touchmove').args.forEach(args => args[1](moveEvent));
        };
        beforeEach(() => moveTo(-300));

        it("changes the 'right' position of the watchers resize bar", () => {
          expect(watchersResizeBar().get(0).style.right).to.equal('300px');
        });

        it("changes the 'right' style of the debug console", () => {
          expect(debugConsole().get(0).style.right).to.equal('300px');
        });

        it("and will do so multiple times", () => {
          moveTo(-320);
          expect(debugConsole().get(0).style.right).to.equal('320px');
        });

        describe("when the mouse is unpressed", () => {
          beforeEach(() => {
            moveTo(-320);
            addEventSpy.withArgs('touchend').args.forEach(args => args[1](new CustomEvent('touchend')));
          });

          it("will stop responding to mouse move events", () => {
            expect(removeEventSpy.withArgs('touchmove')).to.have.been.called;
            expect(removeEventSpy.withArgs('mousemove')).to.have.been.called;
          });
        });
      });
    });
  });

});
