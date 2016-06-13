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

const ENGLISH_LOCALE = 'en_us';

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

// HELPERS

/**
 * Given instructions that look something like
 *   '[pufferpig] <b>Puffer Pigs</b> roam around slowly<br/>'
 * Replaces [pufferpig] with the appropriate image html.
 * In most cases, no substitutions will be necessary and this method will just
 * return the passed in htmlText. Substitutions currently only exist for star wars.
 * @param {string} htmlText
 * @param {Object.<string, string>} [substitutions] Dictionary strings (keys) to
 *   replacement values.
 */
export const substituteInstructionImages = (htmlText, substitutions) => {
  if (!htmlText) {
    return htmlText;
  }

  for (let prop in substitutions) {
    const value = substitutions[prop];
    const substitutionHtml = (
      '<span class="instructionsImageContainer">' +
        '<img src="' + value + '" class="instructionsImage"/>' +
      '</span>'
    );
    const re = new RegExp('\\[' + prop + '\\]', 'g');
    htmlText = htmlText.replace(re, substitutionHtml);
  }

  return htmlText;
};


/**
 * Given a particular set of config options, determines what our instructions
 * constants should be
 * @param {AppOptionsConfig} config
 * @param {string} config.level.instructions
 * @param {string} config.level.markdownInstructions
 * @param {array} config.level.inputOutputTable
 * @param {string} config.locale
 * @param {boolean} config.noInstructionsWhenCollapsed
 * @param {boolean} config.showInstructionsInTopPane
 * @param {Object} config.skin.instructions2ImageSubstitutions
 * @returns {Object}
 */
export const determineInstructionsConstants = config => {
  const { level, locale, noInstructionsWhenCollapsed, showInstructionsInTopPane } = config;
  const { instructions, markdownInstructions, inputOutputTable } = level;

  let longInstructions, shortInstructions;
  if (noInstructionsWhenCollapsed) {
    // CSP mode - We dont care about locale, and always want to show English
    longInstructions = markdownInstructions;
    shortInstructions = instructions;

    // Never use short instructions in CSP. If that's all we have, make them
    // our longInstructions instead
    if (shortInstructions && !longInstructions) {
      longInstructions = shortInstructions;
    }
    shortInstructions = undefined;
  } else {
    // CSF mode - For non-English folks, only use the non-markdown instructions
    longInstructions = (!locale || locale === ENGLISH_LOCALE) ? markdownInstructions : undefined;
    shortInstructions = substituteInstructionImages(instructions,
      config.skin.instructions2ImageSubstitutions);

    // In the case that we're in the top pane, if the two sets of instructions
    // are identical, only use the short version (such that we dont end up
    // minimizing/expanding between two identical sets).
    if (showInstructionsInTopPane && shortInstructions === longInstructions) {
      longInstructions = undefined;
    }

    // In the case where we have an input output table, we want to ensure we
    // have long instructions (even if identical to short instructions) since
    // we only show the inputOutputTable in non-collapsed mode.
    if (inputOutputTable) {
      longInstructions = longInstructions || shortInstructions;
    }
  }

  return {
    noInstructionsWhenCollapsed: !!noInstructionsWhenCollapsed,
    shortInstructions,
    longInstructions
  };
};
