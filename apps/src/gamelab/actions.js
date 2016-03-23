/** @file Redux action-creators for Game Lab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
'use strict';

/** @enum {string} */
var ActionType = module.exports.ActionType = {
  SET_INITIAL_LEVEL_PROPS: 'SET_INITIAL_LEVEL_PROPS',
  CHANGE_INTERFACE_MODE: 'CHANGE_INTERFACE_MODE'
};

/**
 * Change the interface mode between Code Mode and the Animation Tab
 * @param {!GameLabInterfaceMode} interfaceMode
 * @returns {{type: ActionType, interfaceMode: GameLabInterfaceMode}}
 */
module.exports.changeInterfaceMode = function (interfaceMode) {
  return {
    type: ActionType.CHANGE_INTERFACE_MODE,
    interfaceMode: interfaceMode
  };
};

/**
 * Push lots of view properties of the level into the store.
 * Should be called during level init.
 * Any properties omitted from the props argument are not set in the state.
 *
 * @param {!Object} props
 * @param {function} [props.assetUrl] - Helper function for retrieving
 *        assets for this particular level type.
 * @param {boolean} [props.isEmbedView] - Whether the level is being embedded
 *        in an iFrame.
 * @param {boolean} [props.isShareView] - Whether we are displaying the level
 *        on a share page.
 *
 * @returns {{type: ActionType, props: Object}}
 */
module.exports.setInitialLevelProps = function (props) {
  return {
    type: ActionType.SET_INITIAL_LEVEL_PROPS,
    props: props
  };
};
