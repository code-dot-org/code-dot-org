// TODO - can/should this duck module contain other state too?

var TOGGLE_RUNNING = 'isRunning/TOGGLE_RUNNING';

module.exports.default = function (state, action) {
  var nextState = state || false;

  if (action.type === TOGGLE_RUNNING) {
    nextState = !nextState;
  }
  return nextState;
};

module.exports.toggleRunning = function () {
  return {
    type: TOGGLE_RUNNING
  };
};
