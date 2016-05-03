/**
 * This duck module tracks whether the current app is running or not.
 */
var TOGGLE_RUNNING = 'isRunning/TOGGLE_RUNNING';

module.exports.default = function (state, action) {
  var nextState = state || false;

  if (action.type === TOGGLE_RUNNING) {
    nextState = action.isRunning;
  }
  return nextState;
};

/**
 * @param {boolean} isRunning - Whether the app is currently running or not.
 */
module.exports.setIsRunning = function (isRunning) {
  return {
    type: TOGGLE_RUNNING,
    isRunning: isRunning
  };
};
