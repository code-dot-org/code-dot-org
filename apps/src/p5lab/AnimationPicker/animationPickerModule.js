/** @file Redux reducer and actions for the Animation Picker */
import _ from 'lodash';
import {
  addBlankAnimation,
  addAnimation,
  addLibraryAnimation,
  appendBlankFrame,
  appendCustomFrames,
  appendLibraryFrames
} from '../animationListModule';
import {makeEnum} from '@cdo/apps/utils';
import {animations as animationsApi} from '@cdo/apps/clientApi';
var msg = require('@cdo/locale');
import {changeInterfaceMode} from '../actions';
import {P5LabInterfaceMode} from '../constants';
import firehoseClient from '@cdo/apps/lib/util/firehose';

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
  return {type: SHOW, goal: goal};
}

/**
 * Hide the AnimationPicker modal dialog (resetting its state).
 * @returns {{type: string}}
 */
export function hide() {
  return {type: HIDE};
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
  return function(dispatch, getState) {
    const {goal, uploadFilename} = getState().animationPicker;
    const key = result.filename.replace(/\.png$/i, '');
    const sourceUrl = animationsApi.basePath(key + '.png');

    loadImageMetadata(
      sourceUrl,
      metadata => {
        const animation = _.assign({}, metadata, {
          name: uploadFilename,
          sourceUrl: sourceUrl,
          size: result.size,
          version: result.versionId
        });

        if (goal === Goal.NEW_ANIMATION) {
          dispatch(addAnimation(key, animation));
        } else if (goal === Goal.NEW_FRAME) {
          dispatch(appendCustomFrames(animation));
        }
        dispatch(hide());
      },
      () => {
        dispatch(handleUploadError(msg.animationPicker_failedToParseImage()));
      }
    );
  };
}

/**
 * Asynchronously loads an image file as an Image, then derives appropriate
 * animation metadata from that Image and returns the metadata to a callback.
 * @param {!string} sourceUrl - Where to find the image.
 * @param {!function} onComplete
 * @param {!function} onError
 */
function loadImageMetadata(sourceUrl, onComplete, onError) {
  let image = new Image();
  image.addEventListener('load', function() {
    onComplete({
      sourceSize: {x: image.width, y: image.height},
      frameSize: {x: image.width, y: image.height},
      frameCount: 1,
      frameDelay: 4
    });
  });
  image.addEventListener('error', onError);
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
 * The user chose to draw their own animation.  This concludes our picking
 * process.  Dispatch action to add a new image, and then close the animation
 * picker.
 */
export function pickNewAnimation() {
  return (dispatch, getState) => {
    const state = getState();
    const goal = state.animationPicker.goal;
    if (goal === Goal.NEW_ANIMATION) {
      if (state.interfaceMode !== P5LabInterfaceMode.ANIMATION) {
        dispatch(changeInterfaceMode(P5LabInterfaceMode.ANIMATION));
      }
      dispatch(addBlankAnimation());
    } else if (goal === Goal.NEW_FRAME) {
      dispatch(appendBlankFrame());
    }
    dispatch(hide());
  };
}

/**
 * A library animation was selected by the user.  This concludes our picking
 * process. Dispatch root gamelab action to add appropriate metadata and then
 * close the animation picker.
 * @param {!AnimationProps} animation
 * @returns {function}
 */
export function pickLibraryAnimation(animation) {
  firehoseClient.putRecord({
    study: 'sprite-use',
    study_group: 'before-update-v2',
    event: 'select-sprite',
    data_json: JSON.stringify({
      name: animation.name,
      sourceUrl: animation.sourceUrl
    })
  });
  return (dispatch, getState) => {
    const goal = getState().animationPicker.goal;
    if (goal === Goal.NEW_ANIMATION) {
      dispatch(addLibraryAnimation(animation));
    } else if (goal === Goal.NEW_FRAME) {
      dispatch(appendLibraryFrames(animation));
    }
    dispatch(hide());
  };
}
