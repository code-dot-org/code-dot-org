/** @file Redux action-creators for App Lab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
import * as utils from '../utils';

/** @enum {string} */
export const ActionType = utils.makeEnum(
  'CHANGE_INTERFACE_MODE'
);

/**
 * Change the interface mode between Design Mode and Code Mode
 * @param {!ApplabInterfaceMode} interfaceMode
 * @returns {{type: ActionType, interfaceMode: ApplabInterfaceMode}}
 */
export function changeInterfaceMode(interfaceMode) {
  if (!interfaceMode) {
    throw new Error("Expected an interace mode!");
  }
  return {
    type: ActionType.CHANGE_INTERFACE_MODE,
    interfaceMode: interfaceMode
  };
}
