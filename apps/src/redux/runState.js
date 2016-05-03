/**
 * This duck module tracks whether the current app's run state.
 */
var _ = require('../lodash');

var SET_IS_RUNNING = 'runState/SET_IS_RUNNING';
var SET_IS_DEBUGGER_PAUSED = 'runState/SET_IS_DEBUGGER_PAUSED';

var initialState = {
  isRunning: false,
  isDebuggerPaused: false
};

/**
 * Reducer for runState. It should be impossible to be debugging if not running.
 */
module.exports.default = function (state, action) {
  state = state || initialState;

  if (action.type === SET_IS_RUNNING) {
    return _.assign({}, {
      isRunning: action.isRunning,
      isDebuggerPaused: action.isRunning === false ? false : state.isDebuggerPaused
    });
  }

  if (action.type === SET_IS_DEBUGGER_PAUSED) {
    return _.assign({}, {
      isRunning: action.isDebuggerPaused ? true : state.isRunning,
      isDebuggerPaused: action.isDebuggerPaused,
    });
  }

  return state;
};

/**
 * @param {boolean} isRunning - Whether the app is currently running or not.
 */
module.exports.setIsRunning = function (isRunning) {
  return {
    type: SET_IS_RUNNING,
    isRunning: isRunning
  };
};

/**
 * @param {boolean} isDebuggerPaused - Whether the app is currently paused in the
 *   debugger
 */

module.exports.setIsDebuggerPaused = function (isDebuggerPaused) {
  return {
    type: SET_IS_DEBUGGER_PAUSED,
    isDebuggerPaused: isDebuggerPaused
  };
};
