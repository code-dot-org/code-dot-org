import sinon from 'sinon';
import {expect} from '../../../../util/configuredChai';
import {getStore, registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import {reducers, selectors, actions} from '@cdo/apps/lib/tools/jsdebugger/redux';
import CommandHistory from '@cdo/apps/lib/tools/jsdebugger/CommandHistory';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import ObservableEvent from '@cdo/apps/ObservableEvent';
import JSInterpreter from '@cdo/apps/JSInterpreter';

class StubInterpreter {
  constructor() {
    this.onNextStepChanged = new ObservableEvent();
    this.onPause = new ObservableEvent();
    this.onExecutionWarning = new ObservableEvent();

    this.handlePauseContinue = sinon.spy();
    this.handleStepIn = sinon.spy();
    this.handleStepOut = sinon.spy();
    this.handleStepOver = sinon.spy();
    this.paused = false;
    this.nextStep = null;
  }

  mockPause() {
    this.paused = true;
    this.onPause.notifyObservers();
  }

  mockExecutionWarning(error, lineNumber) {
    this.onExecutionWarning.notifyObservers(error, lineNumber);
  }

  mockSetNextStep(nextStep) {
    this.nextStep = nextStep;
    this.onNextStepChanged.notifyObservers();
  }
}

describe('The JSDebugger redux duck', () => {
  let store, state;
  beforeEach(() => {
    stubRedux();
    registerReducers(reducers);
    store = getStore();
    state = store.getState();
  });
  afterEach(() => {
    restoreRedux();
  });

  it("exposes state on the jsdebugger key", () => {
    expect(store.getState().jsdebugger).to.be.defined;
  });

  it("the state can be accesed via the getRoot selector", () => {
    expect(selectors.getRoot(state)).to.equal(state.jsdebugger);
  });

  describe("the initial state", () => {
    it("is initially not attached to an interpreter", () => {
      expect(selectors.isAttached(state)).to.be.false;
    });

    it("and therefore has no interpreter", () => {
      expect(selectors.getJSInterpreter(state)).to.be.null;
    });

    it("nor any command history", () => {
      expect(selectors.getCommandHistory(state)).to.be.null;
    });

    it("and no log output", () => {
      expect(selectors.getLogOutput(state)).to.equal('');
    });
  });

  describe("the appendLog action", () => {
    it("will append strings to the log output", () => {
      store.dispatch(actions.appendLog("foo"));
      expect(selectors.getLogOutput(store.getState())).to.equal('foo');
    });

    it("will append rich objects to the log output", () => {
      store.dispatch(actions.appendLog({foo: 'bar'}));
      expect(selectors.getLogOutput(store.getState())).to.equal('{"foo":"bar"}');
    });

    it("will append multiple things to the log output, joined by newlines", () => {
      store.dispatch(actions.appendLog({foo: 'bar'}));
      store.dispatch(actions.appendLog("hello"));
      expect(selectors.getLogOutput(store.getState())).to.equal(
        '{"foo":"bar"}\nhello'
      );
    });
  });

  describe("before being initialized", () => {
    it("will throw an error if you try to step in", () => {
      expect(() => store.dispatch(actions.stepIn())).to.throw(
        "jsdebugger has not been initialized yet"
      );
    });
  });

  describe("after being initialized with a bad runApp implementation", () => {
    let runApp;
    beforeEach(() => {
      runApp = sinon.spy();
      store.dispatch(actions.initialize({runApp}));
      state = store.getState();
    });

    it("will throw an error when you try to stepIn()", () => {
      expect(() => store.dispatch(actions.stepIn())).to.throw(
        "runApp should have attached an interpreter"
      );
      expect(runApp).to.have.been.called;
    });

  });

  describe("after being initialized", () => {
    let runApp;
    beforeEach(() => {
      runApp = sinon.spy(() => {
        store.dispatch(actions.attach(new StubInterpreter()));
      });
      store.dispatch(actions.initialize({runApp}));
      state = store.getState();
    });

    it("you can access a command history object", () => {
      expect(selectors.getCommandHistory(state))
        .to.be.an.instanceOf(CommandHistory);
    });

    it("there is no js interpreter attached yet", () => {
      expect(selectors.getJSInterpreter(state)).to.be.null;
    });

    describe("before a js interpreter is attached", () => {
      it("the stepOut action throws an error", () => {
        expect(() => store.dispatch(actions.stepOut())).to.throw(
          "No interpreter has been attached"
        );
      });

      it("the stepOver action throws an error", () => {
        expect(() => store.dispatch(actions.stepOver())).to.throw(
          "No interpreter has been attached"
        );
      });

      describe("after dispatching the stepIn() action", () => {
        beforeEach(() => {
          store.dispatch(actions.stepIn());
          state = store.getState();
        });

        it("will call whatever runApp function was provided", () => {
          expect(runApp).to.have.been.called;
        });

        it("will immediately call the interpreter's handlePauseContinue method", () => {
          expect(selectors.getJSInterpreter(store.getState()).handlePauseContinue)
            .to.have.been.called;
        });

        it("will call the interpreter's handleStepIn() method", () => {
          expect(selectors.getJSInterpreter(store.getState()).handleStepIn)
            .to.have.been.called;
        });
      });
    });

    describe("after being attached to an interpreter", () => {
      let interpreter;
      beforeEach(() => {
        interpreter = new StubInterpreter();
        store.dispatch(actions.attach(interpreter));
        state = store.getState();
      });

      it("you can get the jsinterpreter instance that was attached", () => {
        expect(selectors.getJSInterpreter(state)).to.equal(interpreter);
      });

      it("the interpreter will trigger pause actions", () => {
        expect(selectors.isPaused(state)).to.be.false;
        interpreter.mockPause();
        expect(selectors.isPaused(store.getState())).to.be.true;
      });

      it("the interpreter will log execution warnings", () => {
        expect(selectors.getLogOutput(state)).to.equal('');
        interpreter.mockExecutionWarning("ouch!", 10);
        expect(selectors.getLogOutput(store.getState())).to.equal('ouch!');
      });

      it("changes to the interpreter's next step will be mirrored", () => {
        expect(selectors.canRunNext(state)).to.be.false;
        interpreter.mockPause();
        expect(selectors.canRunNext(store.getState())).to.be.false;
        interpreter.mockSetNextStep(JSInterpreter.StepType.RUN);
        expect(selectors.canRunNext(store.getState())).to.be.true;
      });

      it("you can dispatch the stepOut action", () => {
        store.dispatch(actions.stepOut());
        expect(selectors.getJSInterpreter(store.getState()).handleStepOut)
          .to.have.been.called;
      });

      it("you can dispatch the stepOver action", () => {
        store.dispatch(actions.stepOver());
        expect(selectors.getJSInterpreter(store.getState()).handleStepOver)
          .to.have.been.called;
      });

      describe("after dispatching the stepIn() action", () => {
        beforeEach(() => {
          store.dispatch(actions.stepIn());
          state = store.getState();
        });

        it("will not call the provided runApp, because an interpreter is already attached", () => {
          expect(runApp).not.to.have.been.called;
        });
      });

      describe("after being detached", () => {
        beforeEach(() => {
          store.dispatch(actions.detach());
          state = store.getState();
        });

        it("will no longer have a jsinterpreter", () => {
          expect(selectors.getJSInterpreter(state)).to.be.null;
        });

        it("will no longer trigger pause actions", () => {
          expect(selectors.isPaused(state)).to.be.false;
          interpreter.mockPause();
          expect(selectors.isPaused(store.getState())).to.be.false;
        });

        it("will no longer log execution warnings", () => {
          expect(selectors.getLogOutput(state)).to.equal('');
          interpreter.mockExecutionWarning("ouch!", 10);
          expect(selectors.getLogOutput(store.getState())).to.equal('');
        });

        it("will no longer mirror changes to the interpreter state", () => {
          expect(selectors.canRunNext(state)).to.be.false;
          interpreter.mockPause();
          expect(selectors.canRunNext(store.getState())).to.be.false;
          interpreter.mockSetNextStep(JSInterpreter.StepType.RUN);
          expect(selectors.canRunNext(store.getState())).to.be.false;
        });
      });
    });
  });

});
