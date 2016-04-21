/** @file Redux action-creators for the AnimationPicker component.
 *  @see http://redux.js.org/docs/basics/Actions.html */
'use strict';

var utils = require('../../utils');

/** @enum {string} */
var ActionType = module.exports.ActionType = utils.makeEnum(
  'BEGIN_UPLOAD',
  'DISPLAY_ERROR',
  'RESET_ANIMATION_PICKER'
);

/** @enum {string} */
module.exports.View = utils.makeEnum(
    'PICKER',
    'UPLOAD_IN_PROGRESS',
    'ERROR'
);

/**
 * Change the Animation Picker back to its default state.
 * Useful each time you open it.
 * @returns {{type: ActionType}}
 */
module.exports.reset = function () {
  return {
    type: ActionType.RESET_ANIMATION_PICKER
  };
};

module.exports.beginUpload = function (originalFileName) {
  return {
    type: ActionType.BEGIN_UPLOAD,
    originalFileName: originalFileName
  };
};

module.exports.displayError = function (status) {
  return {
    type: ActionType.DISPLAY_ERROR,
    status: status
  };
};
