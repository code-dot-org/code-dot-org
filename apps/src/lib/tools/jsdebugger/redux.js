import * as Immutable from 'immutable';
import Observer from '../../../Observer';
import {update as updateWatchExpressions} from '../../../redux/watchedExpressions';
import CommandHistory from './CommandHistory';
import JSInterpreter from '../jsinterpreter/JSInterpreter';
import watchedExpressions from '@cdo/apps/redux/watchedExpressions';
import runState from '@cdo/apps/redux/runState';

const WATCH_TIMER_PERIOD = 250;
const INITIALIZE = 'jsdebugger/INITIALIZE';
const ATTACH = 'jsdebugger/ATTACH';
const DETACH = 'jsdebugger/DETACH';
const APPEND_LOG = 'jsdebugger/APPEND_LOG';
const CLEAR_LOG = 'jsdebugger/CLEAR_LOG';
const OPEN = 'jsdebugger/OPEN';
const CLOSE = 'jsdebugger/CLOSE';

// State model
const JSDebuggerState = Immutable.Record({
  jsInterpreter: null,
  runApp: null,
  observer: null,
  watchIntervalId: null,
  commandHistory: null,
  logOutput: [],
  maxLogLevel: '',
  isOpen: false
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
  return state.runState.isDebuggerPaused;
}

export function isEditWhileRun(state) {
  return state.runState.isEditWhileRun;
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

export function isOpen(state) {
  return getRoot(state).isOpen;
}

export function canRunNext(state) {
  return (
    state.runState.isDebuggerPaused &&
    state.runState.nextStep === JSInterpreter.StepType.RUN
  );
}

export function getLogOutput(state) {
  return getRoot(state).logOutput;
}

export function getMaxLogLevel(state) {
  return getRoot(state).maxLogLevel;
}

export const selectors = {
  getRoot,
  getCommandHistory,
  getJSInterpreter,
  isPaused,
  isEditWhileRun,
  isAttached,
  canRunNext,
  getLogOutput,
  getMaxLogLevel,
  isOpen
};

// actions
export function initialize({runApp}) {
  return {type: INITIALIZE, runApp};
}

/**
 * Append to log.
 * @param {object} output
 * @param {string} level optional text: 'ERROR', 'WARNING', or nothing
 */
export function appendLog(output, level) {
  return (dispatch, getState) => {
    // Errors and warnings should circumvent the react-inspector because they have
    // their own styling
    output['skipInspector'] = level === 'ERROR' || level === 'WARNING';
    const logLevel = level && level.toLowerCase();
    dispatch({type: APPEND_LOG, output, logLevel});
    if (!isOpen(getState())) {
      dispatch(open());
    }
  };
}

export function clearLog() {
  return {type: CLEAR_LOG};
}

export function attach(jsInterpreter) {
  return (dispatch, getState) => {
    const observer = new Observer();
    observer.observe(jsInterpreter.onPause, () => {
      dispatch(togglePause());
      dispatch(open());
    });
    observer.observe(jsInterpreter.onExecutionWarning, output =>
      dispatch(appendLog({output: output}, 'WARNING'))
    );

    const watchIntervalId = setInterval(() => {
      const jsInterpreter = getJSInterpreter(getState());
      getState().watchedExpressions.forEach(we => {
        const currentValue = jsInterpreter.evaluateWatchExpression(
          we.get('expression')
        );
        dispatch(updateWatchExpressions(we.get('expression'), currentValue));
      });
    }, WATCH_TIMER_PERIOD);
    dispatch(clearLog());
    dispatch({
      type: ATTACH,
      observer,
      watchIntervalId,
      jsInterpreter
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

export function open() {
  return {type: OPEN};
}

export function close() {
  return {type: CLOSE};
}

export function togglePause() {
  return (dispatch, getState) => {
    const jsInterpreter = getJSInterpreter(getState());
    if (!jsInterpreter) {
      return;
    }
    jsInterpreter.handlePauseContinue();
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
        throw new Error('jsdebugger has not been initialized yet');
      }
      dispatch(togglePause());
      jsInterpreter = getJSInterpreter(getState());
      if (!jsInterpreter) {
        throw new Error('runApp should have attached an interpreter');
      }
    }
    jsInterpreter.handleStepIn();
  };
}

export function stepOver() {
  return (dispatch, getState) => {
    let jsInterpreter = getJSInterpreter(getState());
    if (jsInterpreter) {
      jsInterpreter.handleStepOver();
    } else {
      throw new Error('No interpreter has been attached');
    }
  };
}

export function stepOut() {
  return (dispatch, getState) => {
    let jsInterpreter = getJSInterpreter(getState());
    if (jsInterpreter) {
      jsInterpreter.handleStepOut();
    } else {
      throw new Error('No interpreter has been attached');
    }
  };
}

export function evalInCurrentScope(input) {
  return (dispatch, getState) => {
    let jsInterpreter = getJSInterpreter(getState());
    if (jsInterpreter) {
      return jsInterpreter.evalInCurrentScope(input);
    } else {
      throw new Error('No interpreter has been attached');
    }
  };
}

export const actions = {
  initialize,
  appendLog,
  clearLog,
  attach,
  detach,
  open,
  close,
  togglePause,
  stepIn,
  stepOver,
  stepOut,
  evalInCurrentScope
};

// reducer

function appendLogOutput(logOutput, output, type) {
  logOutput = logOutput || [];
  switch (type) {
    case APPEND_LOG:
      return [...logOutput, output];

    default:
      return logOutput;
  }
}

function computeNewMaxLogLevel(prevMaxLogLevel, newLogLevel) {
  if (newLogLevel === 'error' || prevMaxLogLevel === 'error') {
    return 'error';
  } else if (newLogLevel === 'warning' || prevMaxLogLevel === 'warning') {
    return 'warning';
  } else {
    return '';
  }
}

export function reducer(state, action) {
  if (!state) {
    state = new JSDebuggerState({
      isOpen: false
    });
  }
  if (action.type === INITIALIZE) {
    return state.merge({
      runApp: action.runApp,
      commandHistory: new CommandHistory()
    });
  } else if (action.type === ATTACH) {
    return state.merge({
      jsInterpreter: action.jsInterpreter,
      observer: action.observer,
      watchIntervalId: action.watchIntervalId
    });
  } else if (action.type === APPEND_LOG) {
    return state.merge({
      logOutput: appendLogOutput(state.logOutput, action.output, action.type),
      maxLogLevel: computeNewMaxLogLevel(state.maxLogLevel, action.logLevel)
    });
  } else if (action.type === CLEAR_LOG) {
    return state.merge({
      logOutput: [],
      maxLogLevel: ''
    });
  } else if (action.type === DETACH) {
    return state.merge({
      jsInterpreter: null,
      watchIntervalId: 0
    });
  } else if (action.type === CLOSE) {
    return state.set('isOpen', false);
  } else if (action.type === OPEN) {
    return state.set('isOpen', true);
  } else {
    return state;
  }
}

export const reducers = {
  jsdebugger: reducer,
  watchedExpressions,
  runState
};
