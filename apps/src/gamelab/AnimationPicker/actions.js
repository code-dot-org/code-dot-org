/** @file Redux action-creators for the AnimationPicker component.
 *  @see http://redux.js.org/docs/basics/Actions.html */
'use strict';

var utils = require('../../utils');

/** @enum {string} */
var AnimationPickerAction = module.exports.AnimationPickerAction = utils.makeEnum(
  'SHOW_ANIMATION_PICKER',
  'HIDE_ANIMATION_PICKER'
);

/**
 * Show the animation picker
 * @returns {{type: AnimationPickerAction}}
 */
module.exports.showAnimationPicker = function () {
  return {
    type: AnimationPickerAction.SHOW_ANIMATION_PICKER
  };
};

/**
 * Hide the animation picker
 * @returns {{type: AnimationPickerAction}}
 */
module.exports.hideAnimationPicker = function () {
  return {
    type: AnimationPickerAction.HIDE_ANIMATION_PICKER
  };
};
