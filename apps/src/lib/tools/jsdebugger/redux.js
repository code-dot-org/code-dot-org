import * as Immutable from 'immutable';
import Observer from '../../../Observer';
import {update as updateWatchExpressions} from '../../../redux/watchedExpressions';
import CommandHistory from './CommandHistory';
import JSInterpreter from '../../../JSInterpreter';
import watchedExpressions from '@cdo/apps/redux/watchedExpressions';

const WATCH_TIMER_PERIOD = 250;
const INITIALIZE = 'jsdebugger/INITIALIZE';
const ATTACH = 'jsdebugger/ATTACH';
const DETACH = 'jsdebugger/DETACH';
const MAP_INTERPRETER_STATE = 'jsdebugger/MAP_INTERPRETER_STATE';
const APPEND_LOG = 'jsdebugger/APPEND_LOG';
const CLEAR_LOG = 'jsdebugger/CLEAR_LOG';

// State model
const JSDebuggerState = Immutable.Record({
  jsInterpreter: null,
  runApp: null,
  observer: null,
  watchIntervalId: null,
  commandHistory: null,
  logOutput: '',
  canRunNext: false,
  isPaused: false,
});

export function getRoot(state) {
  return state.jsdebugger;
}

export function getCommandHistory(state) {
  return getRoot(state).commandHistory;
}

export function getJSInterpreter(state) {
  return getRoot(state).jsInterpreter;
}

function getRunApp(state) {
  return getRoot(state).runApp;
}

export function isPaused(state) {
  return getRoot(state).isPaused;
}

function getObserver(state) {
  return getRoot(state).observer;
}

function getWatchIntervalId(state) {
  return getRoot(state).watchIntervalId;
}

export function isAttached(state) {
  return !!getJSInterpreter(state);
}

export function canRunNext(state) {
  return getRoot(state).canRunNext;
}

export function getLogOutput(state) {
  return getRoot(state).logOutput;
}

export const selectors = {
  getRoot,
  getCommandHistory,
  getJSInterpreter,
  isPaused,
  isAttached,
  canRunNext,
  getLogOutput,
};

// actions
export function initialize({runApp}) {
  return {type: INITIALIZE, runApp};
}

export function appendLog(output) {
  return {type: APPEND_LOG, output};
}

export function clearLog() {
  return {type: CLEAR_LOG};
}

/**
 * We periodically need to update the debugger UI state
 * in response to events emitted by the interpreter.
 * This action triggers that mapping.
 */
function mapInterpreterState(jsInterpreter) {
  return {type: MAP_INTERPRETER_STATE, jsInterpreter};
}

export function attach(jsInterpreter) {
  return (dispatch, getState) => {
    const observer = new Observer();
    observer.observe(
      jsInterpreter.onNextStepChanged,
      () => dispatch(mapInterpreterState(jsInterpreter))
    );
    observer.observe(
      jsInterpreter.onPause,
      () => dispatch(togglePause())
    );
    observer.observe(
      jsInterpreter.onExecutionWarning,
      (output) => dispatch(appendLog(output))
    );

    const watchIntervalId = setInterval(
      () => {
        const jsInterpreter = getJSInterpreter(getState());
        getState().watchedExpressions.forEach(we => {
          const currentValue = jsInterpreter.evaluateWatchExpression(we.get('expression'));
          dispatch(updateWatchExpressions(we.get('expression'), currentValue));
        });
      },
      WATCH_TIMER_PERIOD
    );
    dispatch(clearLog());
    dispatch({
      type: ATTACH,
      observer,
      watchIntervalId,
      jsInterpreter,
    });
  };
}

export function detach() {
  return (dispatch, getState) => {
    const observer = getObserver(getState());
    observer && observer.unobserveAll();
    clearInterval(getWatchIntervalId(getState()));
    dispatch({type: DETACH});
  };
}

export function togglePause() {
  return (dispatch, getState) => {
    const jsInterpreter = getJSInterpreter(getState());
    if (!jsInterpreter) {
      return;
    }
    jsInterpreter.handlePauseContinue();
    dispatch(mapInterpreterState(jsInterpreter));
  };
}

export function stepIn() {
  return (dispatch, getState) => {
    let jsInterpreter = getJSInterpreter(getState());
    if (!jsInterpreter) {
      const runApp = getRunApp(getState());
      if (runApp) {
        runApp();
      } else {
        throw new Error("jsdebugger has not been initialized yet");
      }
      dispatch(togglePause());
      jsInterpreter = getJSInterpreter(getState());
      if (!jsInterpreter) {
        throw new Error("runApp should have attached an interpreter");
      }
    }
    jsInterpreter.handleStepIn();
    dispatch(mapInterpreterState(jsInterpreter));
  };
}

export function stepOver() {
  return (dispatch, getState) => {
    let jsInterpreter = getJSInterpreter(getState());
    if (jsInterpreter) {
      jsInterpreter.handleStepOver();
      dispatch(mapInterpreterState(jsInterpreter));
    } else {
      throw new Error("No interpreter has been attached");
    }
  };
}

export function stepOut() {
  return (dispatch, getState) => {
    let jsInterpreter = getJSInterpreter(getState());
    if (jsInterpreter) {
      jsInterpreter.handleStepOut();
      dispatch(mapInterpreterState(jsInterpreter));
    } else {
      throw new Error("No interpreter has been attached");
    }
  };
}

export const actions = {
  initialize,
  appendLog,
  clearLog,
  attach,
  detach,
  togglePause,
  stepIn,
  stepOver,
  stepOut,
};

// reducer

function appendLogOutput(logOutput, output) {
  if (logOutput.length > 0) {
    logOutput += '\n';
  }
  if (typeof output !== 'string' && !(output instanceof String)) {
    output = JSON.stringify(output);
  }

  logOutput += output;
  return logOutput;
}

export function reducer(state = new JSDebuggerState(), action) {
  if (action.type === INITIALIZE) {
    return state.merge({
      runApp: action.runApp,
      commandHistory: new CommandHistory(),
    });
  } else if (action.type === ATTACH) {
    return state.merge({
      jsInterpreter: action.jsInterpreter,
      observer: action.observer,
      watchIntervalId: action.watchIntervalId,
    });
  } else if (action.type === APPEND_LOG) {
    return state.merge({
      logOutput: appendLogOutput(state.logOutput, action.output)
    });
  } else if (action.type === CLEAR_LOG) {
    return state.merge({logOutput: ''});
  } else if (action.type === DETACH) {
    return state.merge({
      jsInterpreter: null,
      watchIntervalId: 0,
    });
  } else if (action.type === MAP_INTERPRETER_STATE) {
    return state.merge({
      isPaused: action.jsInterpreter.paused,
      canRunNext: (
        action.jsInterpreter.paused &&
        action.jsInterpreter.nextStep === JSInterpreter.StepType.RUN
      )
    });
  } else {
    return state;
  }
}

export const reducers = {
  jsdebugger: reducer,
  watchedExpressions,
};
