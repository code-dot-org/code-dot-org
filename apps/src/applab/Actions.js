/** @file Redux action-creators for App Lab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
'use strict';

/** @enum {string} */
var ActionType = module.exports.ActionType = {
  SET_LEVEL_PROPS: 'SET_LEVEL_PROPS'
};

/**
 * Push lots of view properties of the level into the store.
 * Should be called during level init.
 *
 * @param {!Object} levelProps
 * @param {function} levelProps.assetUrl - Helper function for retrieving assets
 *        for this particular level type.
 *
 * @returns {{type: string, levelProps: Object}}
 */
module.exports.setLevelProps = function (levelProps) {
  return {
    type: ActionType.SET_LEVEL_PROPS,
    levelProps: levelProps
  };
};
