import CommandHistory from '@cdo/apps/lib/tools/jsdebugger/CommandHistory';
import {
  reducers,
  selectors,
  actions,
} from '@cdo/apps/lib/tools/jsdebugger/redux';
import JSInterpreter from '@cdo/apps/lib/tools/jsinterpreter/JSInterpreter';
import Observer from '@cdo/apps/Observer';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';

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
      studioApp,
    });
    jest.spyOn(interpreter, 'handlePauseContinue').mockClear();
    jest.spyOn(interpreter, 'handleStepIn').mockClear();
    jest.spyOn(interpreter, 'handleStepOut').mockClear();
    jest.spyOn(interpreter, 'handleStepOver').mockClear();

    // override evalInCurrentScope so we don't have to set up the full interpreter.
    jest
      .spyOn(interpreter, 'evalInCurrentScope')
      .mockClear()
      // eslint-disable-next-line no-eval
      .mockImplementation(input => eval(input));
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

    interpreter.isBreakpointRow = function (row) {
      return row === 3 || row === 5;
    };
    const observer = new Observer();
    let hitBreakpoint = false;
    observer.observe(interpreter.onPause, function () {
      hitBreakpoint = true;
    });
    interpreter.paused = false;

    for (let i = 0; !hitBreakpoint && i < 100; i++) {
      interpreter.executeInterpreter();
    }
  }

  it('exposes state on the jsdebugger key', () => {
    expect(store.getState().jsdebugger).toBeDefined();
  });

  it('the state can be accesed via the getRoot selector', () => {
    expect(selectors.getRoot(state)).toBe(state.jsdebugger);
  });

  describe('the initial state', () => {
    it('is initially not attached to an interpreter', () => {
      expect(selectors.isAttached(state)).toBe(false);
    });

    it('and therefore has no interpreter', () => {
      expect(selectors.getJSInterpreter(state)).toBeNull();
    });

    it('nor any command history', () => {
      expect(selectors.getCommandHistory(state)).toBeNull();
    });

    it('and no log output', () => {
      expect(selectors.getLogOutput(state)).toEqual([]);
    });

    it('and is closed', () => {
      expect(selectors.isOpen(state)).toBe(false);
    });
  });

  describe('the open and close actions', () => {
    beforeEach(() => store.dispatch(actions.open()));
    it('will open the debugger', () => {
      expect(selectors.isOpen(store.getState())).toBe(true);
    });
    it('and close the debugger', () => {
      store.dispatch(actions.close());
      expect(selectors.isOpen(store.getState())).toBe(false);
    });
  });

  describe('the appendLog action', () => {
    it('will append strings to the log output', () => {
      store.dispatch(
        actions.appendLog({
          output: 'foo',
        })
      );
      var outputs = selectors.getLogOutput(store.getState());
      expect(outputs.toJS()[0].output).toBe('foo');
    });

    it('will append rich objects to the log output', () => {
      store.dispatch(actions.appendLog({output: {foo: 'bar'}}));
      expect(selectors.getLogOutput(store.getState()).toJS()[0].output).toEqual(
        {foo: 'bar'}
      );
    });

    it('will append multiple both input and output to the log output', () => {
      store.dispatch(actions.appendLog({input: '1 + 1'}));
      store.dispatch(actions.appendLog({output: 2}));
      expect(selectors.getLogOutput(store.getState()).toJS()[0].input).toEqual(
        '1 + 1'
      );
      expect(selectors.getLogOutput(store.getState()).toJS()[1].output).toEqual(
        2
      );
    });

    it('will also trigger the open action if the debugger is not already open', () => {
      expect(selectors.isOpen(store.getState())).toBe(false);
      store.dispatch(actions.appendLog({output: 'open sesame'}));
      expect(selectors.isOpen(store.getState())).toBe(true);
    });

    it('will append errors and warnings with note to skip react-inspector', () => {
      store.dispatch(actions.appendLog({output: 'Text'}, 'ERROR'));
      store.dispatch(actions.appendLog({input: 'More text'}, 'WARNING'));
      store.dispatch(actions.appendLog({output: 'Even more text'}));
      expect(
        selectors.getLogOutput(store.getState()).toJS()[0].skipInspector
      ).toBe(true);
      expect(
        selectors.getLogOutput(store.getState()).toJS()[1].skipInspector
      ).toBe(true);
      expect(
        selectors.getLogOutput(store.getState()).toJS()[2].skipInspector
      ).toBe(false);
    });
  });

  describe('before being initialized', () => {
    it('will throw an error if you try to step in', () => {
      expect(() => store.dispatch(actions.stepIn())).toThrow(
        'jsdebugger has not been initialized yet'
      );
    });
  });

  describe('after being initialized with a bad runApp implementation', () => {
    let runApp;
    beforeEach(() => {
      runApp = jest.fn();
      store.dispatch(actions.initialize({runApp}));
      state = store.getState();
    });

    it('will throw an error when you try to stepIn()', () => {
      expect(() => store.dispatch(actions.stepIn())).toThrow(
        'runApp should have attached an interpreter'
      );
      expect(runApp).toHaveBeenCalled();
    });
  });

  describe('after being initialized', () => {
    let runApp;
    beforeEach(() => {
      runApp = jest.fn(() => {
        store.dispatch(actions.attach(interpreter));
      });
      store.dispatch(actions.initialize({runApp}));
      state = store.getState();
    });

    it('you can access a command history object', () => {
      expect(selectors.getCommandHistory(state)).toBeInstanceOf(CommandHistory);
    });

    it('there is no js interpreter attached yet', () => {
      expect(selectors.getJSInterpreter(state)).toBeNull();
    });

    describe('before a js interpreter is attached', () => {
      it('the stepOut action throws an error', () => {
        expect(() => store.dispatch(actions.stepOut())).toThrow(
          'No interpreter has been attached'
        );
      });

      it('the stepOver action throws an error', () => {
        expect(() => store.dispatch(actions.stepOver())).toThrow(
          'No interpreter has been attached'
        );
      });

      it('the evalInCurrentScope action throws an error', () => {
        expect(() => store.dispatch(actions.evalInCurrentScope('1+1'))).toThrow(
          'No interpreter has been attached'
        );
      });

      describe('after dispatching the stepIn() action', () => {
        beforeEach(() => {
          store.dispatch(actions.stepIn());
          state = store.getState();
        });

        it('will call whatever runApp function was provided', () => {
          expect(runApp).toHaveBeenCalled();
        });

        it("will immediately call the interpreter's handlePauseContinue method", () => {
          expect(
            selectors.getJSInterpreter(store.getState()).handlePauseContinue
          ).toHaveBeenCalled();
        });

        it("will call the interpreter's handleStepIn() method", () => {
          expect(
            selectors.getJSInterpreter(store.getState()).handleStepIn
          ).toHaveBeenCalled();
        });
      });
    });

    describe('after being attached to an interpreter', () => {
      beforeEach(() => {
        store.dispatch(actions.attach(interpreter));
        state = store.getState();
      });

      it('you can get the jsinterpreter instance that was attached', () => {
        expect(selectors.getJSInterpreter(state)).toBe(interpreter);
      });

      it('the interpreter will trigger pause actions on breakpoints', () => {
        expect(selectors.isPaused(state)).toBe(false);
        runToBreakpoint();
        expect(selectors.isPaused(store.getState())).toBe(true);
      });

      it('the interpreter will open the debugger on breakpoints', () => {
        expect(selectors.isOpen(state)).toBe(false);
        runToBreakpoint();
        expect(selectors.isOpen(store.getState())).toBe(true);
      });

      it('the interpreter will log execution warnings', () => {
        expect(selectors.getLogOutput(state).toJS()).toEqual([]);
        interpreter.onExecutionWarning.notifyObservers('ouch!', 10);
        expect(selectors.getLogOutput(store.getState()).toJS()[0].output).toBe(
          'ouch!'
        );
      });

      it("changes to the interpreter's next step will be mirrored", () => {
        expect(selectors.canRunNext(state)).toBe(false);
        runToBreakpoint();
        expect(selectors.canRunNext(store.getState())).toBe(true);
      });

      it('you can dispatch the stepOut action', () => {
        store.dispatch(actions.stepOut());
        expect(
          selectors.getJSInterpreter(store.getState()).handleStepOut
        ).toHaveBeenCalled();
      });

      it('you can dispatch the stepOver action', () => {
        store.dispatch(actions.stepOver());
        expect(
          selectors.getJSInterpreter(store.getState()).handleStepOver
        ).toHaveBeenCalled();
      });

      it('you can dispatch the evalInCurrentScope action', () => {
        const result = store.dispatch(actions.evalInCurrentScope('1+1'));
        expect(
          selectors.getJSInterpreter(store.getState()).evalInCurrentScope
        ).toHaveBeenCalled();
        expect(result).toBe(2);
      });

      describe('after dispatching the stepIn() action', () => {
        beforeEach(() => {
          store.dispatch(actions.stepIn());
          state = store.getState();
        });

        it('will not call the provided runApp, because an interpreter is already attached', () => {
          expect(runApp).not.toHaveBeenCalled();
        });
      });

      describe('after being detached', () => {
        beforeEach(() => {
          store.dispatch(actions.detach());
          selectors.getJSInterpreter(state).deinitialize();
          state = store.getState();
        });

        it('will no longer have a jsinterpreter', () => {
          expect(selectors.getJSInterpreter(state)).toBeNull();
        });

        it('will no longer trigger pause actions', () => {
          expect(selectors.isPaused(state)).toBe(false);
          runToBreakpoint();
          expect(selectors.isPaused(store.getState())).toBe(false);
        });

        it('will no longer log execution warnings', () => {
          expect(selectors.getLogOutput(state).toJS()).toEqual([]);
          interpreter.onExecutionWarning.notifyObservers('ouch!', 10);
          expect(selectors.getLogOutput(store.getState()).toJS()).toEqual([]);
        });

        it('will no longer mirror changes to the interpreter state', () => {
          expect(selectors.canRunNext(state)).toBe(false);
          runToBreakpoint();
          expect(selectors.canRunNext(store.getState())).toBe(false);
        });
      });
    });
  });
});
