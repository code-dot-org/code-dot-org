import _ from '../lodash';

/**
 * A duck module for instructions, particularly instructions that we show in
 * the top pane above the code workspace. This module contains both the actions
 * that are required for this feature, and the reducer that sets state based
 * off of those actions.
 */
const SET_CONSTANTS = 'instructions/SET_CONSTANTS';
const TOGGLE_INSTRUCTIONS_COLLAPSED = 'instructions/TOGGLE_INSTRUCTIONS_COLLAPSED';
const SET_INSTRUCTIONS_RENDERED_HEIGHT = 'instructions/SET_INSTRUCTIONS_RENDERED_HEIGHT';
const SET_INSTRUCTIONS_HEIGHT = 'instructions/SET_INSTRUCTIONS_HEIGHT';
const SET_INSTRUCTIONS_MAX_HEIGHT = 'instructions/SET_INSTRUCTIONS_MAX_HEIGHT';

/**
 * Some scenarios:
 * (1) Projects level w/o instructions: shortInstructions and longInstructions
 *     will both be undefined
 * (2) CSP level: Just longInstructions
 * (3) CSF level with only one set of instructions: Just shortInstructions
 * (4) CSF level with two sets of instructions: shortInstructiosn and
 *     longInstructions will both be set.
 */
const instructionsInitialState = {
  shortInstructions: undefined,
  longInstructions: undefined,
  collapsed: false,
  renderedHeight: 0, // undefined?
  // TODO - can i get height out of redux? should i?
  expandedHeight: 0,
  maxHeight: 0
};

export default function reducer(state = instructionsInitialState, action) {
  if (action.type === SET_CONSTANTS) {
    if (state.shortInstructions || state.longInstructions) {
      throw new Error('instructions constants already set');
    }
    const { shortInstructions, longInstructions } = action;
    let collapsed = state.collapsed;
    if (!longInstructions) {
      // If we only have short instructions, we want to be in collapsed mode
      collapsed = true;
    }
    return _.assign({}, state, {
      shortInstructions,
      longInstructions,
      collapsed
    });
  }

  if (action.type === TOGGLE_INSTRUCTIONS_COLLAPSED) {
    const longInstructions = state.longInstructions;
    if (!longInstructions) {
      // No longInstructions implies either (a) no instructions or (b) we only
      // have short instructions. In both cases, we should be collapsed.
      throw new Error('Can not toggle instructions collapsed without longInstructions');
    }
    return _.assign({}, state, {
      collapsed: !state.collapsed
    });
  }

  if (action.type === SET_INSTRUCTIONS_RENDERED_HEIGHT) {
    return _.assign({}, state, {
      renderedHeight: action.height,
      expandedHeight: state.collapsed ? state.expandedHeight : action.height
    });
  }

  // TODO
  // if (action.type === SET_INSTRUCTIONS_HEIGHT &&
  //     action.height !== state.height) {
  //   return _.assign({}, state, {
  //     height: action.height
  //   });
  // }
  //
  // if (action.type === SET_INSTRUCTIONS_MAX_HEIGHT &&
  //     action.maxHeight !== state.maxHeight) {
  //   return _.assign({}, state, {
  //     maxHeight: action.maxHeight
  //   });
  // }

  return state;
}

export const setInstructionsConstants = ({shortInstructions, longInstructions}) => ({
  type: SET_CONSTANTS,
  shortInstructions,
  longInstructions
});

export const setInstructionsRenderedHeight = height => ({
  type: SET_INSTRUCTIONS_RENDERED_HEIGHT,
  height
});

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
