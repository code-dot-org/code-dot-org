import React from 'react';
import sinon from 'sinon';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import DebugConsole from '@cdo/apps/lib/tools/jsdebugger/DebugConsole';
import {reducers, actions} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import {KeyCodes} from '@cdo/apps/constants';
import JSInterpreter from '@cdo/apps/lib/tools/jsinterpreter/JSInterpreter';

const newJSInterpreter = () => {
  let interpreter = new JSInterpreter({
    shouldRunAtMaxSpeed: () => false,
    studioApp: {hideSource: true}
  });
  const code = '0;\n1;\n2;\n3;\n4;\n5;\n6;\n7;';
  interpreter.calculateCodeInfo({code});
  interpreter.parse({code});
  interpreter.paused = true;
  interpreter.nextStep = JSInterpreter.StepType.IN;
  interpreter.executeInterpreter(true);

  return interpreter;
};

describe('The DebugConsole component when the console is enabled', () => {
  let root, jumpToBottomSpy;

  beforeEach(() => {
    stubRedux();
    registerReducers(reducers);
    getStore().dispatch(actions.initialize(sinon.spy()));
    root = mount(
      <Provider store={getStore()}>
        <DebugConsole debugConsoleDisabled={false} />
      </Provider>
    );
    const debugConsoleInstance = root.find('DebugConsole').instance();
    jumpToBottomSpy = sinon.spy(debugConsoleInstance, 'jumpToBottom');
  });

  afterEach(() => {
    restoreRedux();
  });

  const debugOutput = () => root.find('#debug-output');
  const debugInput = () => root.find('#debug-input');
  const debugInputText = () => debugInput().instance().value;

  it('renders a debug output div', () => {
    expect(debugOutput()).to.exist;
  });

  it('renders a debug input div', () => {
    expect(debugInput()).to.exist;
  });

  it('jumps to bottom on componentDidUpdate if log output has changed', () => {
    expect(jumpToBottomSpy).not.to.have.been.called;
    getStore().dispatch(actions.attach(newJSInterpreter()));
    expect(jumpToBottomSpy).not.to.have.been.called;
    getStore().dispatch(actions.appendLog({output: 1 + 1}));
    expect(jumpToBottomSpy).to.have.been.calledOnce;
  });

  function typeKey(keyCode) {
    debugInput().simulate('keydown', {
      target: debugInput().instance(),
      keyCode: keyCode
    });
  }

  function type(text) {
    for (let i = 0; i < text.length; i++) {
      debugInput().instance().value += text[i];
      typeKey(text[i].charCodeAt(0));
    }
  }

  function submit(text) {
    type(text);
    typeKey(KeyCodes.ENTER);
  }

  describe('Before an interpreter has been attached', () => {
    describe('When typing into the text input and pressing enter,', () => {
      beforeEach(() => submit("console.log('hello');"));

      it('the text gets appended to the output', () => {
        expect(debugOutput().text()).to.contain("> console.log('hello');");
      });

      it('a notice about the interpreter not running gets spit out', () => {
        expect(debugOutput().text()).to.contain('< "(not running)"');
      });

      it('the text gets removed from the input', () => {
        expect(debugInputText()).not.to.contain("console.log('hello');");
      });
    });

    describe('After typing in an expression with the $watch prefix', () => {
      beforeEach(() => submit('$watch a+b'));

      it('the expressions is added to the list of watch expressions', () => {
        expect(
          getStore()
            .getState()
            .watchedExpressions.getIn([0, 'expression'])
        ).to.equal('a+b');
      });

      describe('And then using the $unwatch prefix on the same expression', () => {
        beforeEach(() => submit('$unwatch a+b'));
        it('removes the expression from the watch list', () => {
          expect(getStore().getState().watchedExpressions.size).to.equal(0);
        });
      });
    });
  });

  describe('When using the arrow keys in the debug input', () => {
    beforeEach(() => {
      submit('1+1');
      submit('2+2');
      submit('3+3');
    });

    it('the up arrow cycles up through previous expressions', () => {
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

    it('the down arrow cycles back down through the expressions', () => {
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

  describe('After an interpreter has been attached', () => {
    beforeEach(() => {
      getStore().dispatch(actions.attach(newJSInterpreter()));
    });

    describe('when typing into the text input and pressing enter,', () => {
      beforeEach(() => submit('1+1;'));

      it('the text gets appended to the output', () => {
        expect(debugOutput().text()).to.contain('> 1+1;');
      });

      it('no notice about the interpreter not running gets spit out', () => {
        expect(debugOutput().text()).not.to.contain('< "(not running)"');
      });

      it('the result of evaluating the expression gets spit out', () => {
        expect(debugOutput().text()).to.contain('< 2');
      });

      it('the text gets removed from the input', () => {
        expect(debugInputText()).not.to.contain('1+1;');
      });
    });

    describe('when input originates from code workspace console.logging', () => {
      it('a logged array prints an array with an expander icon', () => {
        getStore().dispatch(
          actions.appendLog({
            output: ['test'],
            fromConsoleLog: true
          })
        );
        expect(debugOutput().text()).to.equal('▶(1) ["test"]');
      });

      it('a logged string prints a string without an arrow', () => {
        getStore().dispatch(
          actions.appendLog({
            output: 'hello world',
            fromConsoleLog: true
          })
        );
        expect(debugOutput().text()).to.equal('"hello world"');
      });

      it('a logged integer or mathematical operation prints an integer without an arrow', () => {
        getStore().dispatch(
          actions.appendLog({
            output: 1 + 1,
            fromConsoleLog: true
          })
        );
        expect(debugOutput().text()).to.equal('2');
      });

      it('a logged object prints an object with an expandable arrow', () => {
        getStore().dispatch(
          actions.appendLog({
            output: {foo: 'bar'},
            fromConsoleLog: true
          })
        );
        expect(debugOutput().text()).to.equal('▶{foo: "bar"}');
      });
    });

    describe('when input originates from the command prompt in the debug console', () => {
      it('the original array is prepended with >, and the interpreted array with an expander icon is prepended with < ', () => {
        getStore().dispatch(
          actions.appendLog({
            input: '["test"]'
          })
        );
        getStore().dispatch(
          actions.appendLog({
            output: ['test']
          })
        );
        expect(debugOutput().text()).to.equal('> ["test"]< ▶(1) ["test"]');
      });

      it('the original string is prepended with >, and the interpreted string is prepended with <', () => {
        var input = 'hello world';
        getStore().dispatch(
          actions.appendLog({
            input: input
          })
        );
        getStore().dispatch(
          actions.appendLog({
            output: input
          })
        );
        expect(debugOutput().text()).to.equal(`> ${input}< "${input}"`);
      });

      it('the original integer or mathematical operation is prepended with >, and the interpreted integer or mathematical operation is prepended with <', () => {
        getStore().dispatch(
          actions.appendLog({
            input: '1 + 1'
          })
        );
        getStore().dispatch(
          actions.appendLog({
            output: 1 + 1
          })
        );
        expect(debugOutput().text()).to.equal('> 1 + 1< 2');
      });

      it('the original object is prepended with >, and the interpreted object with an expander icon is prepended with <', () => {
        getStore().dispatch(
          actions.appendLog({
            input: "{foo: 'bar'}"
          })
        );
        getStore().dispatch(
          actions.appendLog({
            output: {foo: 'bar'}
          })
        );
        expect(debugOutput().text()).to.equal(
          '> {foo: \'bar\'}< ▶{foo: "bar"}'
        );
      });
    });

    describe('when typing bad code into the text input and pressing enter,', () => {
      beforeEach(() => submit('a+b;'));

      it('the text gets appended to the output', () => {
        expect(debugOutput().text()).to.contain('> a+b;');
      });

      it('the error gets appended to the output', () => {
        expect(debugOutput().text()).to.contain(
          '< "ReferenceError: a is not defined"'
        );
      });
    });
  });

  describe('debug output mouse selection behavior', () => {
    let inputEl, selection;

    beforeEach(() => {
      submit('1+1');
      selection = '';
      inputEl = debugInput().instance();
      sinon.spy(inputEl, 'focus');
      sinon.stub(window, 'getSelection').callsFake(() => selection);
    });

    afterEach(() => {
      inputEl.focus.restore();
      window.getSelection.restore();
    });

    it('clicking the debug output window without selecting text will refocus the input', () => {
      debugOutput().simulate('mouseup', {target: debugOutput().instance()});
      expect(inputEl.focus).to.have.been.called;
    });

    it('but if you selected some text, the input will not be refocused', () => {
      selection = 'some selected text';
      debugOutput().simulate('mouseup', {target: debugOutput().instance()});
      expect(inputEl.focus).not.to.have.been.called;
    });
  });

  describe('debug output highlighting behavior', () => {
    it('normal debug output will not change background color', () => {
      getStore().dispatch(actions.appendLog({output: 'test normal text'}));
      expect(debugOutput().instance().style.backgroundColor).to.equal('');
    });

    it('warning debug output will change background color to lightest yellow', () => {
      getStore().dispatch(actions.appendLog({output: 'test normal text'}));
      getStore().dispatch(
        actions.appendLog({output: 'test warning text'}, 'WARNING')
      );
      expect(debugOutput().instance().style.backgroundColor).to.equal(
        'rgb(255, 247, 223)'
      );
    });

    it('error debug output will change background color to lightest red', () => {
      getStore().dispatch(actions.appendLog({output: 'test normal text'}));
      getStore().dispatch(
        actions.appendLog({output: 'test warning text'}, 'WARNING')
      );
      getStore().dispatch(
        actions.appendLog({output: 'test error text'}, 'ERROR')
      );
      expect(debugOutput().instance().style.backgroundColor).to.equal(
        'rgb(255, 204, 204)'
      );
    });
  });
});

describe('The DebugConsole component when the debug console is disabled', () => {
  let root;

  beforeEach(() => {
    stubRedux();
    registerReducers(reducers);
    getStore().dispatch(actions.initialize(sinon.spy()));
    root = mount(
      <Provider store={getStore()}>
        <DebugConsole debugConsoleDisabled={true} />
      </Provider>
    );
  });

  afterEach(() => {
    restoreRedux();
  });

  const debugOutput = () => root.find('#debug-output');
  const debugInput = () => root.find('#debug-input');

  it('renders a debug output div', () => {
    expect(debugOutput()).to.exist;
  });

  it('renders a debug input div', () => {
    expect(debugInput()).to.exist;
    expect(debugInput().instance().disabled).to.equal(true);
  });

  function typeKey(keyCode) {
    debugInput().simulate('keydown', {
      target: debugInput().instance(),
      keyCode: keyCode
    });
  }

  function type(text) {
    for (let i = 0; i < text.length; i++) {
      debugInput().instance().value += text[i];
      typeKey(text[i].charCodeAt(0));
    }
  }

  function submit(text) {
    type(text);
    typeKey(KeyCodes.ENTER);
  }

  describe('After an interpreter has been attached', () => {
    beforeEach(() => {
      getStore().dispatch(actions.attach(newJSInterpreter()));
    });

    describe('When typing into the text input and pressing enter,', () => {
      it('the text does not get appended to the output if the html is unaltered', () => {
        submit('console.log("test")');
        expect(debugOutput().text()).not.to.contain('test');
      });
      it('the text does not get appended to the output if the html is changed to enable the input', () => {
        debugInput().instance().disabled = false;
        submit('console.log("test")');
        expect(debugOutput().text()).not.to.contain('test');
      });
    });
  });
});
