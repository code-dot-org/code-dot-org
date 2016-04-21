/** @file Redux action-creators for the Game Lab Animation Tab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
'use strict';

var gamelabActions = require('../actions');
var utils = require('../../utils');

/** @enum {string} */
var ActionType = module.exports.ActionType = utils.makeEnum(
  'BEGIN_PICKING_ANIMATION',
  'FINISH_PICKING_ANIMATION',
  'CANCEL_PICKING_ANIMATION',
  'REPORT_ERROR',
  'DISMISS_ERROR',
  'SELECT_ANIMATION'
);

var AnimationPickerDestination = module.exports.AnimationPickerDestination = utils.makeEnum(
  'NEW_ANIMATION',
  'ADD_FRAMES'
);

module.exports.beginPickingAnimation = function () {
  return {
    type: ActionType.BEGIN_PICKING_ANIMATION,
    destination: AnimationPickerDestination.NEW_ANIMATION
  };
};

module.exports.finishPickingAnimation = function (result) {
  return function (dispatch, getState) {
    var destination = getState().animationTab.animationPickerFlow.destination;
    if (destination === AnimationPickerDestination.NEW_ANIMATION) {
      dispatch(gamelabActions.addAnimation({
        key: result.filename.replace(/\.png$/i, ''),
        name: result.originalFileName,
        size: result.size,
        version: result.versionId
      }));
    } else if (destination === AnimationPickerDestination.ADD_FRAMES) {
      // TODO (bbuchanan): Implement after integrating Piskel
    }

    dispatch({ type: ActionType.FINISH_PICKING_ANIMATION });
  };
};

module.exports.cancelPickingAnimation = function () {
  return {
    type: ActionType.CANCEL_PICKING_ANIMATION
  };
};

module.exports.reportError = function (message) {
  return {
    type: ActionType.REPORT_ERROR,
    message: message
  };
};

module.exports.dismissError = function (message) {
  return {
    type: ActionType.DISMISS_ERROR
  };
};

/**
 * Select an animation in the animation sequence list.
 * @param {!string} animationKey
 * @returns {{type: ActionType, animationFilename: string}}
 */
module.exports.selectAnimation = function (animationKey) {
  return {
    type: ActionType.SELECT_ANIMATION,
    animationKey: animationKey
  };
};
