/** @file Redux action-creators for WebLab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
import * as utils from '../utils';

/** @enum {string} */
export const ActionType = utils.makeEnum(
  'CHANGE_INSPECTOR_ON'
);

/**
 * Change the inspectorOn state between true or false
 * @param {!Boolean} inspectorOn
 * @returns {{type: ActionType, inspectorOn: Boolean}}
 */
export function changeInspectorOn(inspectorOn) {
  return {
    type: ActionType.CHANGE_INSPECTOR_ON,
    inspectorOn: inspectorOn
  };
}
