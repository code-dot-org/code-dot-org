import React from 'react';
import sinon from 'sinon';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../../util/configuredChai';
import DebugConsole from '@cdo/apps/lib/tools/jsdebugger/DebugConsole';
import {reducers, actions} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {getStore, registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import {KeyCodes} from '@cdo/apps/constants';
import JSInterpreter from '@cdo/apps/lib/tools/jsinterpreter/JSInterpreter';

describe('The DebugConsole component', () => {
  let root;

  beforeEach(() => {
    stubRedux();
    registerReducers(reducers);
    getStore().dispatch(actions.initialize(sinon.spy()));
    root = mount(
      <Provider store={getStore()}>
        <DebugConsole />
      </Provider>
    );
  });

  afterEach(() => {
    restoreRedux();
  });

  const debugOutput = () => root.find('#debug-output');
  const debugInput = () => root.find('#debug-input');
  const debugInputText = () => debugInput().get(0).value;

  it("renders a debug output div", () => {
    expect(debugOutput()).to.exist;
  });

  it("renders a debug input div", () => {
    expect(debugInput()).to.exist;
  });

  function typeKey(keyCode) {
    debugInput().simulate(
      'keydown',
      {
        target: debugInput().get(0),
        keyCode: keyCode,
      }
    );
  }
  function type(text) {
    for (let i = 0; i < text.length; i++) {
      debugInput().get(0).value += text[i];
      typeKey(text[i]);
    }
  }

  function submit(text) {
    type(text);
    typeKey(KeyCodes.ENTER);
  }

  describe("Before an interpreter has been attached", () => {

    describe("When typing into the text input and pressing enter,", () => {
      beforeEach(() => submit("console.log('hello');"));

      it("the text gets appended to the output", () => {
        expect(debugOutput().text()).to.contain("> console.log('hello');");
      });

      it("a notice about the interpreter not running gets spit out", () => {
        expect(debugOutput().text()).to.contain("< (not running)");
      });

      it("the text gets removed from the input", () => {
        expect(debugInputText()).not.to.contain("console.log('hello');");
      });
    });

    describe("After typing in an expression with the $watch prefix", () => {
      beforeEach(() => submit('$watch a+b'));

      it("the expressions is added to the list of watch expressions", () => {
        expect(getStore().getState().watchedExpressions.getIn([0, 'expression'])).to.equal('a+b');
      });

      describe("And then using the $unwatch prefix on the same expression", () => {
        beforeEach(() => submit('$unwatch a+b'));
        it("removes the expression from the watch list", () => {
          expect(getStore().getState().watchedExpressions.size).to.equal(0);
        });
      });
    });

  });

  describe("When using the arrow keys in the debug input", () => {
    beforeEach(() => {
      submit('1+1');
      submit('2+2');
      submit('3+3');
    });

    it("the up arrow cycles up through previous expressions", () => {
      expect(debugInputText()).to.equal('');
      typeKey(KeyCodes.UP);
      expect(debugInputText()).to.equal('3+3');
      typeKey(KeyCodes.UP);
      expect(debugInputText()).to.equal('2+2');
      typeKey(KeyCodes.UP);
      expect(debugInputText()).to.equal('1+1');
      typeKey(KeyCodes.UP);
      expect(debugInputText()).to.equal('1+1');
    });

    it("the down arrow cycles back down through the expressions", () => {
      for (let i = 0; i < 3; i++) {
        // first go back three
        typeKey(KeyCodes.UP);
      }
      expect(debugInputText()).to.equal('1+1');
      typeKey(KeyCodes.DOWN);
      expect(debugInputText()).to.equal('2+2');
      typeKey(KeyCodes.DOWN);
      expect(debugInputText()).to.equal('3+3');
      typeKey(KeyCodes.DOWN);
      expect(debugInputText()).to.equal('');
    });
  });

  describe("After an interpreter has been attached", () => {
    beforeEach(() => {
      let interpreter = new JSInterpreter({
        shouldRunAtMaxSpeed: () => false,
        studioApp: {hideSource: true}
      });
      const code = '0;\n1;\n2;\n3;\n4;\n5;\n6;\n7;';
      interpreter.calculateCodeInfo(code);
      interpreter.parse({code});
      interpreter.paused = true;
      interpreter.nextStep = JSInterpreter.StepType.IN;
      interpreter.executeInterpreter(true);

      getStore().dispatch(actions.attach(interpreter));
    });

    describe("When typing into the text input and pressing enter,", () => {
      beforeEach(() => submit("1+1;"));

      it("the text gets appended to the output", () => {
        expect(debugOutput().text()).to.contain("> 1+1;");
      });

      it("no notice about the interpreter not running gets spit out", () => {
        expect(debugOutput().text()).not.to.contain("< (not running)");
      });

      it("the result of evaluating the expression gets spit out", () => {
        expect(debugOutput().text()).to.contain("< 2");
      });

      it("the text gets removed from the input", () => {
        expect(debugInputText()).not.to.contain("1+1;");
      });
    });

    describe("When typing bad code into the text input and pressing enter,", () => {
      beforeEach(() => submit("a+b;"));

      it("the text gets appended to the output", () => {
        expect(debugOutput().text()).to.contain("> a+b;");
      });

      it("the error gets appended to the output", () => {
        expect(debugOutput().text()).to.contain("< ReferenceError: a is not defined");
      });

    });
  });

  describe("debug output mouse selection behavior", () => {
    let inputEl, selection;

    beforeEach(() => {
      submit("1+1");
      selection = '';
      inputEl = debugInput().get(0);
      sinon.spy(inputEl, 'focus');
      sinon.stub(window, 'getSelection').callsFake(() => selection);
    });

    afterEach(() => {
      inputEl.focus.restore();
      window.getSelection.restore();
    });

    it("clicking the debug output window without selecting text will refocus the input", () => {
      debugOutput().simulate('mouseup', {target: debugOutput().get(0)});
      expect(inputEl.focus).to.have.been.called;
    });

    it("but if you selected some text, the input will not be refocused", () => {
      selection = 'some selected text';
      debugOutput().simulate('mouseup', {target: debugOutput().get(0)});
      expect(inputEl.focus).not.to.have.been.called;
    });
  });

  describe("debug output highlighting behavior", () => {

    it("normal debug output will not change background color", () => {
      getStore().dispatch(actions.appendLog('test normal text'));
      expect(debugOutput().get(0).style.backgroundColor).to.equal('');
    });

    it("warning debug output will change background color to lightest yellow", () => {
      getStore().dispatch(actions.appendLog('test normal text'));
      getStore().dispatch(actions.appendLog('test warning text', 'WARNING'));
      expect(debugOutput().get(0).style.backgroundColor).to.equal('rgb(255, 247, 223)');
    });

    it("error debug output will change background color to lightest red", () => {
      getStore().dispatch(actions.appendLog('test normal text'));
      getStore().dispatch(actions.appendLog('test warning text', 'WARNING'));
      getStore().dispatch(actions.appendLog('test error text', 'ERROR'));
      expect(debugOutput().get(0).style.backgroundColor).to.equal('rgb(255, 204, 204)');
    });
  });

});
