var _ = require('../lodash');

var SET_INSTRUCTIONS_IN_TOP_PANE = 'instructions/SET_INSTRUCTIONS_IN_TOP_PANE';
var TOGGLE_INSTRUCTIONS_COLLAPSED = 'instructions/TOGGLE_INSTRUCTIONS_COLLAPSED';
var SET_INSTRUCTIONS_HEIGHT = 'instructions/SET_INSTRUCTIONS_HEIGHT';
var SET_INSTRUCTIONS_MAX_HEIGHT = 'instructions/SET_INSTRUCTIONS_MAX_HEIGHT';

var instructionsInitialState = {
  collapsed: false,
  // represents the uncollapsed height
  height: 300,
  maxHeight: 0,
  inTopPane: false
};

module.exports.default = function reducer(state, action) {
  state = state || instructionsInitialState;

  if (action.type === SET_INSTRUCTIONS_IN_TOP_PANE &&
      action.inTopPane !== state.inTopPane) {
    return _.assign({}, state, {
      inTopPane: action.inTopPane
    });
  }

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
 */
module.exports.setInstructionsHeight = function (height) {
  return {
    type: SET_INSTRUCTIONS_HEIGHT,
    height: height
  };
};

/**
 * Set the max height of the instructions panel
 */
module.exports.setInstructionsMaxHeight = function (maxHeight) {
  return {
    type: SET_INSTRUCTIONS_MAX_HEIGHT,
    maxHeight: maxHeight
  };
};
