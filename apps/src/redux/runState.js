/**
 * This duck module tracks whether the current app's run state.
 */
var _ = require('../lodash');

var SET_IS_RUNNING = 'runState/SET_IS_RUNNING';
var SET_IS_DEBUGGING = 'runState/SET_IS_DEBUGGING';

var initialState = {
  isRunning: false,
  isDebugging: false
};

/**
 * Reducer for runState. It should be impossible to be debugging if not running.
 */
module.exports.default = function (state, action) {
  state = state || initialState;

  if (action.type === SET_IS_RUNNING) {
    return _.assign({}, {
      isRunning: action.isRunning,
      isDebugging: action.isRunning === false ? false : state.isDebugging
    });
  }

  if (action.type === SET_IS_DEBUGGING) {
    return _.assign({}, {
      isRunning: action.isDebugging ? true : state.isRunning,
      isDebugging: action.isDebugging,
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
 * @param {boolean} isDebugging - Whether the app is currently paused in the
 *   debugger
 */

module.exports.setIsDebugging = function (isDebugging) {
  return {
    type: SET_IS_DEBUGGING,
    isDebugging: isDebugging
  };
};
