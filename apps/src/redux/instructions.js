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
const SET_INSTRUCTIONS_MAX_HEIGHT_NEEDED = 'instructions/SET_INSTRUCTIONS_MAX_HEIGHT_NEEDED';
const SET_INSTRUCTIONS_MAX_HEIGHT_AVAILABLE = 'instructions/SET_INSTRUCTIONS_MAX_HEIGHT_AVAILABLE';
const SET_HAS_AUTHORED_HINTS = 'instructions/SET_HAS_AUTHORED_HINTS';

/**
 * Some scenarios:
 * (1) Projects level w/o instructions: shortInstructions and longInstructions
 *     will both be undefined
 * (2) CSP level: Just longInstructions
 * (3) CSF level with only one set of instructions: Just shortInstructions
 * (4) CSF level with two sets of instructions: shortInstructions and
 *     longInstructions will both be set.
 * (5) CSF level with just long instructions
 */
const instructionsInitialState = {
  noInstructionsWhenCollapsed: false,
  shortInstructions: undefined,
  longInstructions: undefined,
  collapsed: false,
  // The amount of vertical space consumed by the TopInstructions component
  renderedHeight: 0,
  // The amount of vertical space consumed by the TopInstructions component
  // when it is not collapsed
  expandedHeight: 0,
  // The maximum amount of vertical space needed by the TopInstructions component.
  maxNeededHeight: Infinity,
  // The maximum height we'll allow the resizer to drag to. This is based in
  // part off of the size of the code workspace.
  maxAvailableHeight: Infinity,

  // TODO - may eventually belong in its own module
  hasAuthoredHints: false,
};

export default function reducer(state = instructionsInitialState, action) {
  if (action.type === SET_CONSTANTS) {
    if (state.shortInstructions || state.longInstructions) {
      throw new Error('instructions constants already set');
    }
    const { noInstructionsWhenCollapsed, shortInstructions, longInstructions } = action;
    let collapsed = state.collapsed;
    if (!longInstructions) {
      // If we only have short instructions, we want to be in collapsed mode
      collapsed = true;
    }
    return _.assign({}, state, {
      noInstructionsWhenCollapsed,
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
      expandedHeight: !state.collapsed ? action.height : state.expandedHeight
    });
  }

  if (action.type === SET_INSTRUCTIONS_MAX_HEIGHT_NEEDED &&
      action.maxNeededHeight !== state.maxNeededHeight) {
    return _.assign({}, state, {
      maxNeededHeight: action.maxNeededHeight
    });
  }

  if (action.type === SET_INSTRUCTIONS_MAX_HEIGHT_AVAILABLE &&
      action.maxAvailableHeight !== state.maxAvailableHeight) {
    return _.assign({}, state, {
      maxAvailableHeight: action.maxAvailableHeight,
      renderedHeight: Math.min(action.maxAvailableHeight, state.renderedHeight),
      expandedHeight: Math.min(action.maxAvailableHeight, state.expandedHeight)
    });
  }

  if (action.type === SET_HAS_AUTHORED_HINTS) {
    return _.assign({}, state, {
      hasAuthoredHints: action.hasAuthoredHints
    });
  }

  return state;
}

export const setInstructionsConstants = ({noInstructionsWhenCollapsed,
    shortInstructions, longInstructions}) => ({
  type: SET_CONSTANTS,
  noInstructionsWhenCollapsed,
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
 * Sets the maximum amount of height need by our instructions component if it
 * were to render itself with no scrollbars
 */
export const setInstructionsMaxHeightNeeded = height => ({
  type: SET_INSTRUCTIONS_MAX_HEIGHT_NEEDED,
  maxNeededHeight: height
});


/**
 * Set the max height of the instructions panel
 * @param {number} maxAvailableHeight - Don't let user drag instructions pane to be
 *   larger than this number.
 */
export const setInstructionsMaxHeightAvailable = height => ({
  type: SET_INSTRUCTIONS_MAX_HEIGHT_AVAILABLE,
  maxAvailableHeight: height
});

export const setHasAuthoredHints = hasAuthoredHints => ({
  type: SET_HAS_AUTHORED_HINTS,
  hasAuthoredHints
});
