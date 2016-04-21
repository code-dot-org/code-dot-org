/** @file Redux action-creators for the Game Lab Animation Tab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
'use strict';

var utils = require('../../utils');

/** @enum {string} */
var ActionType = module.exports.ActionType = utils.makeEnum(
  'SELECT_ANIMATION'
);

/**
 * Select an animation in the animation list.
 * @param {!string} animationKey
 * @returns {{type: ActionType, animationFilename: string}}
 */
module.exports.selectAnimation = function (animationKey) {
  return {
    type: ActionType.SELECT_ANIMATION,
    animationKey: animationKey
  };
};
