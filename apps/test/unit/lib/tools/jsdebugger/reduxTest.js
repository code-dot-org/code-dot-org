import sinon from 'sinon';
import {expect} from '../../../../util/deprecatedChai';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import {
  reducers,
  selectors,
  actions
} from '@cdo/apps/lib/tools/jsdebugger/redux';
import CommandHistory from '@cdo/apps/lib/tools/jsdebugger/CommandHistory';
import Observer from '@cdo/apps/Observer';
import JSInterpreter from '@cdo/apps/lib/tools/jsinterpreter/JSInterpreter';

describe('The JSDebugger redux duck', () => {
  let store, state, studioApp, interpreter;
  beforeEach(() => {
    stubRedux();
    registerReducers(reducers);
    store = getStore();
    state = store.getState();
    studioApp = {hideSource: true};
    interpreter = new JSInterpreter({
      shouldRunAtMaxSpeed: () => false,
      studioApp
    });
    sinon.spy(interpreter, 'handlePauseContinue');
    sinon.spy(interpreter, 'handleStepIn');
    sinon.spy(interpreter, 'handleStepOut');
    sinon.spy(interpreter, 'handleStepOver');

    // override evalInCurrentScope so we don't have to set up the full interpreter.
    sinon
      .stub(interpreter, 'evalInCurrentScope')
      // eslint-disable-next-line no-eval
      .callsFake(input => eval(input));
  });
  afterEach(() => {
    restoreRedux();
  });

  function runToBreakpoint() {
    const code = '0;\n1;\n2;\n3;\n4;\n5;\n6;\n7;';
    interpreter.calculateCodeInfo({code});
    interpreter.parse({code});
    interpreter.paused = true;
    interpreter.nextStep = JSInterpreter.StepType.IN;
    interpreter.executeInterpreter(true);

    interpreter.isBreakpointRow = function(row) {
      return row === 3 || row === 5;
    };
    const observer = new Observer();
    let hitBreakpoint = false;
    observer.observe(interpreter.onPause, function() {
      hitBreakpoint = true;
    });
    interpreter.paused = false;

    for (let i = 0; !hitBreakpoint && i < 100; i++) {
      interpreter.executeInterpreter();
    }
  }

  it('exposes state on the jsdebugger key', () => {
    expect(store.getState().jsdebugger).to.not.be.undefined;
  });

  it('the state can be accesed via the getRoot selector', () => {
    expect(selectors.getRoot(state)).to.equal(state.jsdebugger);
  });

  describe('the initial state', () => {
    it('is initially not attached to an interpreter', () => {
      expect(selectors.isAttached(state)).to.be.false;
    });

    it('and therefore has no interpreter', () => {
      expect(selectors.getJSInterpreter(state)).to.be.null;
    });

    it('nor any command history', () => {
      expect(selectors.getCommandHistory(state)).to.be.null;
    });

    it('and no log output', () => {
      expect(selectors.getLogOutput(state)).to.deep.equal([]);
    });

    it('and is closed', () => {
      expect(selectors.isOpen(state)).to.be.false;
    });
  });

  describe('the open and close actions', () => {
    beforeEach(() => store.dispatch(actions.open()));
    it('will open the debugger', () => {
      expect(selectors.isOpen(store.getState())).to.be.true;
    });
    it('and close the debugger', () => {
      store.dispatch(actions.close());
      expect(selectors.isOpen(store.getState())).to.be.false;
    });
  });

  describe('the appendLog action', () => {
    it('will append strings to the log output', () => {
      store.dispatch(
        actions.appendLog({
          output: 'foo'
        })
      );
      var outputs = selectors.getLogOutput(store.getState());
      expect(outputs.toJS()[0].output).to.equal('foo');
    });

    it('will append rich objects to the log output', () => {
      store.dispatch(actions.appendLog({output: {foo: 'bar'}}));
      expect(
        selectors.getLogOutput(store.getState()).toJS()[0].output
      ).to.deep.equal({foo: 'bar'});
    });

    it('will append multiple both input and output to the log output', () => {
      store.dispatch(actions.appendLog({input: '1 + 1'}));
      store.dispatch(actions.appendLog({output: 2}));
      expect(
        selectors.getLogOutput(store.getState()).toJS()[0].input
      ).to.deep.equal('1 + 1');
      expect(
        selectors.getLogOutput(store.getState()).toJS()[1].output
      ).to.deep.equal(2);
    });

    it('will also trigger the open action if the debugger is not already open', () => {
      expect(selectors.isOpen(store.getState())).to.be.false;
      store.dispatch(actions.appendLog({output: 'open sesame'}));
      expect(selectors.isOpen(store.getState())).to.be.true;
    });

    it('will append errors and warnings with note to skip react-inspector', () => {
      store.dispatch(actions.appendLog({output: 'Text'}, 'ERROR'));
      store.dispatch(actions.appendLog({input: 'More text'}, 'WARNING'));
      store.dispatch(actions.appendLog({output: 'Even more text'}));
      expect(
        selectors.getLogOutput(store.getState()).toJS()[0].skipInspector
      ).to.equal(true);
      expect(
        selectors.getLogOutput(store.getState()).toJS()[1].skipInspector
      ).to.equal(true);
      expect(
        selectors.getLogOutput(store.getState()).toJS()[2].skipInspector
      ).to.equal(false);
    });
  });

  describe('before being initialized', () => {
    it('will throw an error if you try to step in', () => {
      expect(() => store.dispatch(actions.stepIn())).to.throw(
        'jsdebugger has not been initialized yet'
      );
    });
  });

  describe('after being initialized with a bad runApp implementation', () => {
    let runApp;
    beforeEach(() => {
      runApp = sinon.spy();
      store.dispatch(actions.initialize({runApp}));
      state = store.getState();
    });

    it('will throw an error when you try to stepIn()', () => {
      expect(() => store.dispatch(actions.stepIn())).to.throw(
        'runApp should have attached an interpreter'
      );
      expect(runApp).to.have.been.called;
    });
  });

  describe('after being initialized', () => {
    let runApp;
    beforeEach(() => {
      runApp = sinon.spy(() => {
        store.dispatch(actions.attach(interpreter));
      });
      store.dispatch(actions.initialize({runApp}));
      state = store.getState();
    });

    it('you can access a command history object', () => {
      expect(selectors.getCommandHistory(state)).to.be.an.instanceOf(
        CommandHistory
      );
    });

    it('there is no js interpreter attached yet', () => {
      expect(selectors.getJSInterpreter(state)).to.be.null;
    });

    describe('before a js interpreter is attached', () => {
      it('the stepOut action throws an error', () => {
        expect(() => store.dispatch(actions.stepOut())).to.throw(
          'No interpreter has been attached'
        );
      });

      it('the stepOver action throws an error', () => {
        expect(() => store.dispatch(actions.stepOver())).to.throw(
          'No interpreter has been attached'
        );
      });

      it('the evalInCurrentScope action throws an error', () => {
        expect(() =>
          store.dispatch(actions.evalInCurrentScope('1+1'))
        ).to.throw('No interpreter has been attached');
      });

      describe('after dispatching the stepIn() action', () => {
        beforeEach(() => {
          store.dispatch(actions.stepIn());
          state = store.getState();
        });

        it('will call whatever runApp function was provided', () => {
          expect(runApp).to.have.been.called;
        });

        it("will immediately call the interpreter's handlePauseContinue method", () => {
          expect(
            selectors.getJSInterpreter(store.getState()).handlePauseContinue
          ).to.have.been.called;
        });

        it("will call the interpreter's handleStepIn() method", () => {
          expect(selectors.getJSInterpreter(store.getState()).handleStepIn).to
            .have.been.called;
        });
      });
    });

    describe('after being attached to an interpreter', () => {
      beforeEach(() => {
        store.dispatch(actions.attach(interpreter));
        state = store.getState();
      });

      it('you can get the jsinterpreter instance that was attached', () => {
        expect(selectors.getJSInterpreter(state)).to.equal(interpreter);
      });

      it('the interpreter will trigger pause actions on breakpoints', () => {
        expect(selectors.isPaused(state)).to.be.false;
        runToBreakpoint();
        expect(selectors.isPaused(store.getState())).to.be.true;
      });

      it('the interpreter will open the debugger on breakpoints', () => {
        expect(selectors.isOpen(state)).to.be.false;
        runToBreakpoint();
        expect(selectors.isOpen(store.getState())).to.be.true;
      });

      it('the interpreter will log execution warnings', () => {
        expect(selectors.getLogOutput(state).toJS()).to.deep.equal([]);
        interpreter.onExecutionWarning.notifyObservers('ouch!', 10);
        expect(
          selectors.getLogOutput(store.getState()).toJS()[0].output
        ).to.equal('ouch!');
      });

      it("changes to the interpreter's next step will be mirrored", () => {
        expect(selectors.canRunNext(state)).to.be.false;
        runToBreakpoint();
        expect(selectors.canRunNext(store.getState())).to.be.true;
      });

      it('you can dispatch the stepOut action', () => {
        store.dispatch(actions.stepOut());
        expect(selectors.getJSInterpreter(store.getState()).handleStepOut).to
          .have.been.called;
      });

      it('you can dispatch the stepOver action', () => {
        store.dispatch(actions.stepOver());
        expect(selectors.getJSInterpreter(store.getState()).handleStepOver).to
          .have.been.called;
      });

      it('you can dispatch the evalInCurrentScope action', () => {
        const result = store.dispatch(actions.evalInCurrentScope('1+1'));
        expect(selectors.getJSInterpreter(store.getState()).evalInCurrentScope)
          .to.have.been.called;
        expect(result).to.equal(2);
      });

      describe('after dispatching the stepIn() action', () => {
        beforeEach(() => {
          store.dispatch(actions.stepIn());
          state = store.getState();
        });

        it('will not call the provided runApp, because an interpreter is already attached', () => {
          expect(runApp).not.to.have.been.called;
        });
      });

      describe('after being detached', () => {
        beforeEach(() => {
          store.dispatch(actions.detach());
          selectors.getJSInterpreter(state).deinitialize();
          state = store.getState();
        });

        it('will no longer have a jsinterpreter', () => {
          expect(selectors.getJSInterpreter(state)).to.be.null;
        });

        it('will no longer trigger pause actions', () => {
          expect(selectors.isPaused(state)).to.be.false;
          runToBreakpoint();
          expect(selectors.isPaused(store.getState())).to.be.false;
        });

        it('will no longer log execution warnings', () => {
          expect(selectors.getLogOutput(state).toJS()).to.deep.equal([]);
          interpreter.onExecutionWarning.notifyObservers('ouch!', 10);
          expect(selectors.getLogOutput(store.getState()).toJS()).to.deep.equal(
            []
          );
        });

        it('will no longer mirror changes to the interpreter state', () => {
          expect(selectors.canRunNext(state)).to.be.false;
          runToBreakpoint();
          expect(selectors.canRunNext(store.getState())).to.be.false;
        });
      });
    });
  });
});
