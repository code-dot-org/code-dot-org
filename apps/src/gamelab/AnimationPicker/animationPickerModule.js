/** @file Redux reducer and actions for the Animation Picker */
'use strict';

import _ from '../../lodash';
import {addAnimation} from '../animationModule';
import { makeEnum, createUuid } from '../../utils';
import { sourceUrlFromKey } from '../animationMetadata';

/**
 * @enum {string} Export possible targets for animation picker for consumers
 *       to use when calling show().
 */
export const Goal = makeEnum('NEW_ANIMATION', 'NEW_FRAME');

const SHOW = 'AnimationPicker/SHOW';
const HIDE = 'AnimationPicker/HIDE';
const BEGIN_UPLOAD = 'AnimationPicker/BEGIN_UPLOAD';
const HANDLE_UPLOAD_ERROR = 'AnimationPicker/HANDLE_UPLOAD_ERROR';

// Default state, which we reset to any time we hide the animation picker.
const initialState = {
  visible: false,
  goal: null,
  uploadInProgress: false,
  uploadFilename: null,
  uploadError: null
};

export default function reducer(state, action) {
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
}

/**
 * Display the AnimationPicker modal dialog (reset to initial state).
 * @param {!AnimationPicker.Goal} goal - whether we intend to turn the selected
 *        asset(s) into a new animation or new frames in an existing animation.
 * @returns {{type: string, goal: AnimationPicker.Goal }}
 * @throws {TypeError} if a valid goal is not provided
 */
export function show(goal) {
  if ([Goal.NEW_ANIMATION, Goal.NEW_FRAME].indexOf(goal) === -1) {
    throw new TypeError('Must provide a valid goal');
  }
  return { type: SHOW, goal: goal };
}

/**
 * Hide the AnimationPicker modal dialog (resetting its state).
 * @returns {{type: string}}
 */
export function hide() {
  return { type: HIDE };
}

/**
 * We have an upload in progress.  Record the name of the file being uploaded.
 * @param {!string} filename
 * @returns {{type: string, filename: string}}
 */
export function beginUpload(filename) {
  return {
    type: BEGIN_UPLOAD,
    filename: filename
  };
}

/**
 * An upload completed successfully.  This concludes our picking process.
 * Dispatch a root gamelab action to add appropriate metadata and then close
 * the animation picker.
 * @param {!{filename: string, result: number, versionId: string}} result
 * @returns {function}
 */
export function handleUploadComplete(result) {
  return function (dispatch, getState) {
    const { goal, uploadFilename } = getState().animationPicker;
    const key = result.filename.replace(/\.png$/i, '');
    const sourceUrl = sourceUrlFromKey(key);

    // TODO (bbuchanan): This sequencing feels backwards.  Eventually, we
    // ought to preview and get dimensions from the local filesystem, async
    // with the upload itself, but that will mean refactoring away from the
    // jQuery uploader.
    loadImageMetadata(sourceUrl, metadata => {
      const animation = _.assign({}, metadata, {
        key: key,
        name: uploadFilename,
        sourceUrl: sourceUrl,
        size: result.size,
        version: result.versionId
      });

      if (goal === Goal.NEW_ANIMATION) {
        dispatch(addAnimation(animation));
      } else if (goal === Goal.NEW_FRAME) {
        // TODO (bbuchanan): Implement after integrating Piskel
      }
      dispatch(hide());
    });
  };
}

/**
 * Asynchronously loads an image file as an Image, then derives appropriate
 * animation metadata from that Image and returns the metadata to a callback.
 * @param {!string} sourceUrl - Where to find the image.
 * @param {!function} callback
 */
function loadImageMetadata(sourceUrl, callback) {
  let image  = new Image();
  image.addEventListener('load', function () {
    callback({
      sourceSize: {x: image.width, y: image.height},
      frameSize: {x: image.width, y: image.height},
      frameCount: 1,
      frameRate: 15
    });
  });
  image.src = sourceUrl;
}

/**
 * An upload error occurred.  Show it to the student.
 * @param {!string} status
 * @returns {{type: string, status: string}}
 */
export function handleUploadError(status) {
  return {
    type: HANDLE_UPLOAD_ERROR,
    status: status
  };
}

/**
 * A library animation was selected by the user.  This concludes our picking
 * process. Dispatch root gamelab action to add appropriate metadta and then
 * close the animation picker.
 * @param {!AnimationMetadata} animation
 * @returns {function}
 */
export function pickLibraryAnimation(animation) {
  return (dispatch, getState) => {
    const goal = getState().animationPicker.goal;
    if (goal === Goal.NEW_ANIMATION) {
      dispatch(addAnimation(Object.assign({}, animation, {
        key: createUuid()
      })));
    } else if (goal === Goal.NEW_FRAME) {
      // TODO (bbuchanan): Implement after integrating Piskel
    }
    dispatch(hide());
  };
}
