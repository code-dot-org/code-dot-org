/** @file Redux action-creators for WebLab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
import {getStore} from '@cdo/apps/redux';
import * as utils from '@cdo/apps/utils';
import React from 'react';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';

/** @enum {string} */
export const ActionType = utils.makeEnum(
  'CHANGE_FULL_SCREEN_PREVIEW_ON',
  'CHANGE_INSPECTOR_ON',
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
 * Set a dialog to be rendered from <WebLabView/>.
 * @param {Node|null} dialog A dialog (React/HTML element, node, etc) that will
 * be rendered in <WebLabView/>, or null, which will clear the dialog.
 * @returns {{type: ActionType, dialog: Node}}
 */
export function changeDialog(dialog = null) {
  return {
    type: ActionType.CHANGE_DIALOG,
    dialog
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

// Open a configurable <StylizedBaseDialog/>, to be rendered within <WebLabView/>.
export function openDialog(props) {
  const dialog = (
    <StylizedBaseDialog
      isOpen
      handleConfirmation={closeDialog}
      handleClose={closeDialog}
      {...props}
    />
  );
  getStore().dispatch(changeDialog(dialog));
}

export function closeDialog() {
  getStore().dispatch(changeDialog(null));
}
