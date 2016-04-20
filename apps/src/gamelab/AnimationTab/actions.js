/** @file Redux action-creators for the Game Lab Animation Tab.
 *  @see http://redux.js.org/docs/basics/Actions.html */
'use strict';

var animationPickerActions = require('../AnimationPicker/actions');
var gamelabActions = require('../actions');
var utils = require('../../utils');

/** @enum {string} */
var ActionType = module.exports.ActionType = utils.makeEnum('SELECT_ANIMATION');

module.exports.pickNewAnimation = function () {
  return function (dispatch, getState) {
    dispatch(animationPickerActions.showAnimationPicker(function onComplete(result) {
      console.log(result);
      dispatch(animationPickerActions.hideAnimationPicker());
      dispatch(gamelabActions.addAnimation({
        key: result.filename.replace(/\.png$/i, ''),
        name: result.originalFileName,
        size: result.size,
        version: result.versionId
        // TODO: Populate image metadata as appropriate
        // May require some awesome preprocessing.
        // "frameRate": 10,
        // "frameWidth": 400,
        // "frameHeight": 200,
        // "frameCount": 8,
        // "framesPerRow": 5
      }));
    }, function onCancel() {
      dispatch(animationPickerActions.hideAnimationPicker());
    }));
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
