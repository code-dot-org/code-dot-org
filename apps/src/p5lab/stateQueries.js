/** @file Game Lab pure-functional utility methods that answer questions by
 * looking at the state from the redux store. */

/**
 * Decide whether we should render Animation Mode or any controls that allow
 * access to it.
 * @param {Object} pageConstants
 * @param {Object} pageConstants.showAnimationMode
 * @param {Object} pageConstants.isEmbedView
 * @param {Object} pageConstants.isReadOnlyWorkspace
 * @param {Object} pageConstants.isShareView
 * @returns {boolean}
 */
export function allowAnimationMode({pageConstants}) {
  return (
    pageConstants.showAnimationMode &&
    !pageConstants.isEmbedView &&
    !pageConstants.isReadOnlyWorkspace &&
    !pageConstants.isShareView
  );
}

/**
 * Decide whether we should render Code Mode or any controls that allow
 * access to it.
 * @returns {boolean} (For now, always true!)
 */
function allowCodeMode() {
  return true;
}

/**
 * Count how many modes are allowed in this level.
 * @param {Object} state - Game Lab redux state.
 * @returns {number}
 */
function countAllowedModes(state) {
  return [allowCodeMode(state), allowAnimationMode(state)].reduce(
    (m, n) => m + (n ? 1 : 0)
  );
}

/**
 * Decide whether we should show the visualization header (which, in Game Lab,
 * only contains the mode toggle).
 * @param {Object} state - Game Lab redux state.
 * @returns {boolean}
 */
export function showVisualizationHeader(state) {
  return countAllowedModes(state) > 1;
}

/**
 * Decide whether we should start in the Animation Tab on page load.
 * @param {Object} state - Game Lab redux state.
 * @returns {boolean}
 */
export function startInAnimationTab(state) {
  return state.pageConstants.startInAnimationTab;
}
