/**
 * A duck module for instructions, particularly instructions that we show in
 * the top pane above the code workspace. This module contains both the actions
 * that are required for this feature, and the reducer that sets state based
 * off of those actions.
 */
var _ = require('../lodash');

var TOGGLE_INSTRUCTIONS_COLLAPSED = 'instructions/TOGGLE_INSTRUCTIONS_COLLAPSED';
var SET_INSTRUCTIONS_HEIGHT = 'instructions/SET_INSTRUCTIONS_HEIGHT';
var SET_INSTRUCTIONS_MAX_HEIGHT = 'instructions/SET_INSTRUCTIONS_MAX_HEIGHT';

var instructionsInitialState = {
  collapsed: false,
  // represents the uncollapsed height
  height: 300,
  maxHeight: 0
};

module.exports.default = function reducer(state, action) {
  state = state || instructionsInitialState;

  if (action.type === TOGGLE_INSTRUCTIONS_COLLAPSED) {
    return _.assign({}, state, {
      collapsed: !state.collapsed
    });
  }

  if (action.type === SET_INSTRUCTIONS_HEIGHT &&
      action.height !== state.height) {
    return _.assign({}, state, {
      height: action.height
    });
  }

  if (action.type === SET_INSTRUCTIONS_MAX_HEIGHT &&
      action.maxHeight !== state.maxHeight) {
    return _.assign({}, state, {
      maxHeight: action.maxHeight
    });
  }

  return state;
};

/**
 * Toggles whether instructions are currently collapsed.
 */
module.exports.toggleInstructionsCollapsed = function () {
  return {
    type: TOGGLE_INSTRUCTIONS_COLLAPSED
  };
};

/**
 * Set the height of the instructions panel
 * @param {number} height - Height of instructions pane
 */
module.exports.setInstructionsHeight = function (height) {
  return {
    type: SET_INSTRUCTIONS_HEIGHT,
    height: height
  };
};

/**
 * Set the max height of the instructions panel
 * @param {number} maxHeight - Don't let user drag instructions pane to be
 *   larger than this number.
 */
module.exports.setInstructionsMaxHeight = function (maxHeight) {
  return {
    type: SET_INSTRUCTIONS_MAX_HEIGHT,
    maxHeight: maxHeight
  };
};
