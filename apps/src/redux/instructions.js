/**
 * A duck module for instructions, particularly instructions that we show in
 * the top pane above the code workspace. This module contains both the actions
 * that are required for this feature, and the reducer that sets state based
 * off of those actions.
 */
const TOGGLE_INSTRUCTIONS_COLLAPSED = 'instructions/TOGGLE_INSTRUCTIONS_COLLAPSED';
const SET_INSTRUCTIONS_HEIGHT = 'instructions/SET_INSTRUCTIONS_HEIGHT';
const SET_INSTRUCTIONS_MAX_HEIGHT = 'instructions/SET_INSTRUCTIONS_MAX_HEIGHT';

const instructionsInitialState = {
  collapsed: false,
  // represents the uncollapsed height
  height: 300,
  maxHeight: 0
};

export default function reducer(state = instructionsInitialState, action) {
  if (action.type === TOGGLE_INSTRUCTIONS_COLLAPSED) {
    return Object.assign({}, state, {
      collapsed: !state.collapsed
    });
  }

  if (action.type === SET_INSTRUCTIONS_HEIGHT &&
      action.height !== state.height) {
    return Object.assign({}, state, {
      height: action.height
    });
  }

  if (action.type === SET_INSTRUCTIONS_MAX_HEIGHT &&
      action.maxHeight !== state.maxHeight) {
    return Object.assign({}, state, {
      maxHeight: action.maxHeight
    });
  }

  return state;
}

/**
 * Toggles whether instructions are currently collapsed.
 */
export const toggleInstructionsCollapsed = () => ({
  type: TOGGLE_INSTRUCTIONS_COLLAPSED
});

/**
 * Set the height of the instructions panel
 * @param {number} height - Height of instructions pane
 */
export const setInstructionsHeight = height => ({
  type: SET_INSTRUCTIONS_HEIGHT,
  height
});

/**
 * Set the max height of the instructions panel
 * @param {number} maxHeight - Don't let user drag instructions pane to be
 *   larger than this number.
 */
export const setInstructionsMaxHeight = maxHeight => ({
  type: SET_INSTRUCTIONS_MAX_HEIGHT,
  maxHeight
});
