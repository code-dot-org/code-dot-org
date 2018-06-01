/**
 * A duck module for instructions, particularly instructions that we show in
 * the top pane above the code workspace. This module contains both the actions
 * that are required for this feature, and the reducer that sets state based
 * off of those actions.
 */

import experiments from '@cdo/apps/util/experiments';
import { trySetLocalStorage, tryGetLocalStorage } from '../utils';

const SET_CONSTANTS = 'instructions/SET_CONSTANTS';
const TOGGLE_INSTRUCTIONS_COLLAPSED = 'instructions/TOGGLE_INSTRUCTIONS_COLLAPSED';
const SET_INSTRUCTIONS_RENDERED_HEIGHT = 'instructions/SET_INSTRUCTIONS_RENDERED_HEIGHT';
const SET_INSTRUCTIONS_MAX_HEIGHT_NEEDED = 'instructions/SET_INSTRUCTIONS_MAX_HEIGHT_NEEDED';
const SET_INSTRUCTIONS_MAX_HEIGHT_AVAILABLE = 'instructions/SET_INSTRUCTIONS_MAX_HEIGHT_AVAILABLE';
const SET_HAS_AUTHORED_HINTS = 'instructions/SET_HAS_AUTHORED_HINTS';
const SET_FEEDBACK = 'instructions/SET_FEEDBACK';
const HIDE_OVERLAY = 'instructions/HIDE_OVERLAY';

const ENGLISH_LOCALE = 'en_us';

const LOCALSTORAGE_OVERLAY_SEEN_FLAG = 'instructionsOverlaySeenOnce';

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
  hasInlineImages: false,
  shortInstructions: undefined,
  shortInstructions2: undefined,
  longInstructions: undefined,
  teacherMarkdown: undefined,
  hasContainedLevels: false,
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
  overlayVisible: false,
  levelVideos: [],
  mapReference: undefined,
  referenceLinks: []
};

export default function reducer(state = {...instructionsInitialState}, action) {
  if (action.type === SET_CONSTANTS) {
    if (state.shortInstructions || state.longInstructions) {
      throw new Error('instructions constants already set');
    }
    const {
      noInstructionsWhenCollapsed,
      hasInlineImages,
      shortInstructions,
      shortInstructions2,
      longInstructions,
      hasContainedLevels,
      overlayVisible,
      teacherMarkdown,
      levelVideos,
      mapReference,
      referenceLinks
    } = action;
    let collapsed = state.collapsed;
    if (!longInstructions && !hasContainedLevels) {
      // If we only have short instructions, we want to be in collapsed mode
      collapsed = true;
    }
    return Object.assign({}, state, {
      noInstructionsWhenCollapsed,
      hasInlineImages,
      shortInstructions,
      shortInstructions2,
      longInstructions,
      teacherMarkdown,
      hasContainedLevels,
      overlayVisible,
      collapsed,
      levelVideos,
      mapReference,
      referenceLinks
    });
  }

  if (action.type === TOGGLE_INSTRUCTIONS_COLLAPSED) {
    return Object.assign({}, state, {
      collapsed: !state.collapsed
    });
  }

  if (action.type === SET_INSTRUCTIONS_RENDERED_HEIGHT) {
    return Object.assign({}, state, {
      renderedHeight: action.height,
      expandedHeight: !state.collapsed ? action.height : state.expandedHeight
    });
  }

  if (action.type === SET_INSTRUCTIONS_MAX_HEIGHT_NEEDED &&
      action.maxNeededHeight !== state.maxNeededHeight) {
    return Object.assign({}, state, {
      maxNeededHeight: action.maxNeededHeight
    });
  }

  if (action.type === SET_INSTRUCTIONS_MAX_HEIGHT_AVAILABLE &&
      action.maxAvailableHeight !== state.maxAvailableHeight) {
    return Object.assign({}, state, {
      maxAvailableHeight: action.maxAvailableHeight,
      renderedHeight: Math.min(action.maxAvailableHeight, state.renderedHeight),
      expandedHeight: Math.min(action.maxAvailableHeight, state.expandedHeight)
    });
  }

  if (action.type === SET_HAS_AUTHORED_HINTS) {
    return Object.assign({}, state, {
      hasAuthoredHints: action.hasAuthoredHints
    });
  }

  if (action.type === SET_FEEDBACK) {
    return Object.assign({}, state, {
      feedback: action.feedback
    });
  }

  if (action.type === HIDE_OVERLAY) {
    return Object.assign({}, state, {
      overlayVisible: false
    });
  }

  return state;
}

export const setInstructionsConstants = ({noInstructionsWhenCollapsed,
    shortInstructions, shortInstructions2, longInstructions,
    hasContainedLevels, hasInlineImages, overlayVisible, teacherMarkdown, levelVideos,
    mapReference, referenceLinks}) => ({
  type: SET_CONSTANTS,
  noInstructionsWhenCollapsed,
  hasInlineImages,
  shortInstructions,
  shortInstructions2,
  longInstructions,
  hasContainedLevels,
  overlayVisible,
  teacherMarkdown,
  levelVideos,
  mapReference,
  referenceLinks
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

export const setFeedback = feedback => ({
  type: SET_FEEDBACK,
  feedback
});

export const hideOverlay = () => ({
  type: HIDE_OVERLAY
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
    const imageUrl = substitutions[prop];
    const substitutionHtml = (
      '<span class="instructionsImageContainer">' +
        `<img src="${imageUrl}" class="instructionsImage"/>` +
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
 * @param {string} config.level.instructions2
 * @param {string} config.level.markdownInstructions
 * @param {array} config.level.inputOutputTable
 * @param {array} config.level.levelVideos
 * @param {stirng} config.level.mapReference,
 * @param {array} config.level.referenceLinks,
 * @param {string} config.locale
 * @param {boolean} config.noInstructionsWhenCollapsed
 * @param {boolean} config.hasContainedLevels
 * @param {Object} config.skin.instructions2ImageSubstitutions
 * @returns {Object}
 */
export const determineInstructionsConstants = config => {
  const {
    level,
    locale,
    noInstructionsWhenCollapsed,
    hasContainedLevels,
    teacherMarkdown} = config;
  const {
    instructions,
    instructions2,
    markdownInstructions,
    inputOutputTable,
    levelVideos,
    mapReference,
    referenceLinks,
  } = level;

  let longInstructions, shortInstructions, shortInstructions2;
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
    if (experiments.isEnabled('i18nMarkdownInstructions')) {
      longInstructions = markdownInstructions;
    } else {
      // CSF mode - For non-English folks, only use the non-markdown instructions
      longInstructions = (!locale || locale === ENGLISH_LOCALE) ? markdownInstructions : undefined;
    }
    shortInstructions = instructions;
    shortInstructions2 = instructions2;

    // if the two sets of instructions are identical, only use the short
    // version (such that we dont end up minimizing/expanding between
    // two identical sets).
    if (shortInstructions === longInstructions) {
      longInstructions = undefined;
    }

    // In the case where we have an input output table, we want to ensure we
    // have long instructions (even if identical to short instructions) since
    // we only show the inputOutputTable in non-collapsed mode.
    if (inputOutputTable) {
      longInstructions = longInstructions || shortInstructions;
    }

    if (config.skin.instructions2ImageSubstitutions) {
      longInstructions = substituteInstructionImages(longInstructions,
        config.skin.instructions2ImageSubstitutions);
      shortInstructions = substituteInstructionImages(shortInstructions,
        config.skin.instructions2ImageSubstitutions);
      shortInstructions2 = substituteInstructionImages(shortInstructions2,
        config.skin.instructions2ImageSubstitutions);
    }

    if (config.skin.replaceInstructions) {
      longInstructions = config.skin.replaceInstructions(longInstructions);
      shortInstructions = config.skin.replaceInstructions(shortInstructions);
    }
  }

  // If the level has instructions to show, we will in some situations
  // want to show an overlay.
  let hasInstructionsToShow = shortInstructions || longInstructions;
  // If the level is specifically flagged as having important
  // instructions or if it is the first level in the stage, always show
  // the overlay. Otherwise, show it exactly once on the very first
  // level a user looks at.
  let overlaySeen = tryGetLocalStorage(LOCALSTORAGE_OVERLAY_SEEN_FLAG, false);
  let shouldShowOverlay = hasInstructionsToShow && !hasContainedLevels &&
      (config.level.instructionsImportant || config.levelPosition === 1 || !overlaySeen);
  if (shouldShowOverlay) {
    trySetLocalStorage(LOCALSTORAGE_OVERLAY_SEEN_FLAG, true);
  }

  return {
    noInstructionsWhenCollapsed: !!noInstructionsWhenCollapsed,
    hasInlineImages: !!config.skin.instructions2ImageSubstitutions,
    overlayVisible: !!shouldShowOverlay,
    shortInstructions,
    shortInstructions2,
    longInstructions,
    teacherMarkdown,
    hasContainedLevels,
    levelVideos,
    mapReference,
    referenceLinks
  };
};
