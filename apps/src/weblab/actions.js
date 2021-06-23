/** @file Redux action-creators for WebLab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
import {getStore} from '@cdo/apps/redux';
import * as utils from '@cdo/apps/utils';

/** @enum {string} */
export const ActionType = utils.makeEnum(
  'CHANGE_FULL_SCREEN_PREVIEW_ON',
  'CHANGE_INSPECTOR_ON',
  'CHANGE_SHOW_ERROR',
  'CHANGE_DIALOG',
  'CHANGE_MAX_PROJECT_CAPACITY',
  'CHANGE_PROJECT_SIZE'
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

export function changeDialog(dialogProps = null) {
  return {
    type: ActionType.CHANGE_DIALOG,
    dialogProps
  };
}

/**
 * Set the maximum project size in bytes.
 * @param {number} bytes
 * @returns {{type: ActionType, bytes: number}}
 */
export function changeMaxProjectCapacity(bytes) {
  return {
    type: ActionType.CHANGE_MAX_PROJECT_CAPACITY,
    bytes
  };
}

/**
 * Set the current project size in bytes.
 * @param {number} bytes
 */
export function changeProjectSize(bytes) {
  return {
    type: ActionType.CHANGE_PROJECT_SIZE,
    bytes
  };
}

/**
 * Helpers
 */

// TODO: comment
export function openDialog(props) {
  // TODO: validate props
  const defaultProps = {
    handleConfirmation: closeDialog,
    handleClose: closeDialog
  };
  getStore().dispatch(changeDialog({...defaultProps, ...props}));
}

function closeDialog() {
  getStore().dispatch(changeDialog(null));
}
