/** @file Redux reducer and actions for the Animation Picker */
'use strict';

var _ = require('../../lodash');
var gamelabActions = require('../actions');
var utils = require('../../utils');

/**
 * @enum {string} Export possible targets for animation picker for consumers
 *       to use when calling show().
 */
var Goal = exports.Goal = utils.makeEnum('NEW_ANIMATION', 'NEW_FRAME');

var SHOW = 'AnimationPicker/SHOW';
var HIDE = 'AnimationPicker/HIDE';
var BEGIN_UPLOAD = 'AnimationPicker/BEGIN_UPLOAD';
var HANDLE_UPLOAD_ERROR = 'AnimationPicker/HANDLE_UPLOAD_ERROR';

// Default state, which we reset to any time we hide the animation picker.
var initialState = {
  visible: false,
  goal: null,
  uploadInProgress: false,
  uploadFilename: null,
  uploadError: null
};

exports.default = function reducer(state, action) {
  state = state || initialState;
  switch (action.type) {
    case SHOW:
      if (!state.visible) {
        return _.assign({}, initialState, {
          visible: true,
          goal: action.goal
        });
      }
      return state;

    case HIDE:
      return initialState;

    case BEGIN_UPLOAD:
      return _.assign({}, state, {
        uploadInProgress: true,
        uploadFilename: action.filename
      });

    case HANDLE_UPLOAD_ERROR:
      return _.assign({}, state, {
        uploadInProgress: false,
        uploadError: action.status
      });

    default:
      return state;
  }
};

/**
 * Display the AnimationPicker modal dialog (reset to initial state).
 * @param {!AnimationPicker.Goal} goal - whether we intend to turn the selected
 *        asset(s) into a new animation or new frames in an existing animation.
 * @returns {{type: string, goal: AnimationPicker.Goal }}
 * @throws {TypeError} if a valid goal is not provided
 */
exports.show = function (goal) {
  if ([Goal.NEW_ANIMATION, Goal.NEW_FRAME].indexOf(goal) === -1) {
    throw new TypeError('Must provide a valid goal');
  }
  return { type: SHOW, goal: goal };
};

/**
 * Hide the AnimationPicker modal dialog (resetting its state).
 * @returns {{type: string}}
 */
exports.hide = function () {
  return { type: HIDE };
};

/**
 * We have an upload in progress.  Record the name of the file being uploaded.
 * @param {!string} filename
 * @returns {{type: string, filename: string}}
 */
exports.beginUpload = function (filename) {
  return {
    type: BEGIN_UPLOAD,
    filename: filename
  };
};

/**
 * An upload completed successfully.  This concludes our picking process.
 * Dispatch a root gamelab action to add appropriate metadata and then close
 * the animation picker.
 * @param {!{filename: string, result: number, versionId: string}} result
 * @returns {function}
 */
exports.handleUploadComplete = function (result) {
  return function (dispatch, getState) {
    var state = getState().animationPicker;
    var goal = state.goal;
    var uploadFilename = state.uploadFilename;
    if (goal === Goal.NEW_ANIMATION) {
      dispatch(gamelabActions.addAnimation({
        key: result.filename.replace(/\.png$/i, ''),
        name: uploadFilename,
        size: result.size,
        version: result.versionId
      }));
    } else if (goal === Goal.NEW_FRAME) {
      // TODO (bbuchanan): Implement after integrating Piskel
    }
    dispatch(exports.hide());
  };
};

/**
 * An upload error occurred.  Show it to the student.
 * @param {!string} status
 * @returns {{type: string, status: string}}
 */
exports.handleUploadError = function (status) {
  return {
    type: HANDLE_UPLOAD_ERROR,
    status: status
  };
};

