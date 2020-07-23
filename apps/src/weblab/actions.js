/** @file Redux action-creators for WebLab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
import * as utils from '../utils';

/** @enum {string} */
export const ActionType = utils.makeEnum(
  'CHANGE_FULL_SCREEN_PREVIEW_ON',
  'CHANGE_INSPECTOR_ON',
  'CHANGE_SHOW_ERROR'
);

/**
 * Change the fullScreenPreviewOn state between true or false
 * @param {!Boolean} fullScreenPreviewOn
 * @returns {{type: ActionType, fullScreenPreviewOn: Boolean}}
 */
export function changeFullScreenPreviewOn(fullScreenPreviewOn) {
  return {
    type: ActionType.CHANGE_FULL_SCREEN_PREVIEW_ON,
    fullScreenPreviewOn
  };
}

/**
 * Change the inspectorOn state between true or false
 * @param {!Boolean} inspectorOn
 * @returns {{type: ActionType, inspectorOn: Boolean}}
 */
export function changeInspectorOn(inspectorOn) {
  return {
    type: ActionType.CHANGE_INSPECTOR_ON,
    inspectorOn
  };
}

/**
 * Change the showError state between true or false
 * @param {!Boolean} showError
 * @returns {{type: ActionType, showError: Boolean}}
 */
export function changeShowError(showError) {
  return {
    type: ActionType.CHANGE_SHOW_ERROR,
    showError
  };
}
