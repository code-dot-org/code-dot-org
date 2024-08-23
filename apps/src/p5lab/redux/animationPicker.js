/** @file Redux reducer and actions for the Animation Picker */
import _ from 'lodash';

import {animations as animationsApi} from '@cdo/apps/clientApi';
import harness from '@cdo/apps/lib/util/harness';
import {makeEnum} from '@cdo/apps/utils';

import {changeInterfaceMode} from '../actions';
import {P5LabInterfaceMode} from '../constants';

import {
  addBlankAnimation,
  addAnimation,
  addLibraryAnimation,
  appendBlankFrame,
  appendCustomFrames,
  appendLibraryFrames,
} from './animationList';

var msg = require('@cdo/locale');

/**
 * @enum {string} Export possible targets for animation picker for consumers
 *       to use when calling show().
 */
export const Goal = makeEnum('NEW_ANIMATION', 'NEW_FRAME');

const SHOW = 'AnimationPicker/SHOW';
const SHOW_BACKGROUND = 'AnimationPicker/SHOW_BACKGROUND';
const HIDE = 'AnimationPicker/HIDE';
const BEGIN_UPLOAD = 'AnimationPicker/BEGIN_UPLOAD';
const HANDLE_UPLOAD_ERROR = 'AnimationPicker/HANDLE_UPLOAD_ERROR';
const SELECT_ANIMATION = 'AnimationPicker/SELECT_ANIMATION';
const REMOVE_ANIMATION = 'AnimationPicker/REMOVE_ANIMATION';
const SHOWING_UPLOAD_WARNING = 'AnimationPicker/SHOWING_UPLOAD_WARNING';
const EXITED_UPLOAD_WARNING = 'AnimationPicker/EXITED_UPLOAD_WARNING';

// Default state, which we reset to any time we hide the animation picker.
const initialState = {
  visible: false,
  goal: null,
  uploadInProgress: false,
  uploadFilename: null,
  uploadError: null,
  isSpriteLab: false,
  isBackground: false,
  // List of animations selected to be added through multiselect
  selectedAnimations: {},
  uploadWarningShowing: false,
};

export default function reducer(state, action) {
  state = state || initialState;
  if (action.type === SHOW) {
    if (!state.visible) {
      return _.assign({}, initialState, {
        visible: true,
        goal: action.goal,
        isBackground: false,
        isSpriteLab: action.isSpriteLab,
      });
    }
    return state;
  }
  if (action.type === SHOW_BACKGROUND) {
    if (!state.visible) {
      return _.assign({}, initialState, {
        visible: true,
        goal: action.goal,
        isBackground: true,
        isSpriteLab: true,
      });
    }
    return state;
  }
  if (action.type === HIDE) {
    return initialState;
  }
  if (action.type === SHOWING_UPLOAD_WARNING) {
    return {
      ...state,
      uploadWarningShowing: true,
    };
  }
  if (action.type === EXITED_UPLOAD_WARNING) {
    return {
      ...state,
      uploadWarningShowing: false,
    };
  }
  if (action.type === BEGIN_UPLOAD) {
    return _.assign({}, state, {
      uploadInProgress: true,
      uploadFilename: action.filename,
    });
  }
  if (action.type === HANDLE_UPLOAD_ERROR) {
    return _.assign({}, state, {
      uploadInProgress: false,
      uploadError: action.status,
    });
  }
  if (action.type === SELECT_ANIMATION) {
    return {
      ...state,
      selectedAnimations: {
        ...state.selectedAnimations,
        [action.animation.sourceUrl]: action.animation,
      },
    };
  }
  if (action.type === REMOVE_ANIMATION) {
    const updatedAnimations = {...state.selectedAnimations};
    delete updatedAnimations[action.animation.sourceUrl];
    return {
      ...state,
      selectedAnimations: updatedAnimations,
    };
  }
  return state;
}

/**
 * Display the AnimationPicker modal dialog (reset to initial state).
 * @param {!AnimationPicker.Goal} goal - whether we intend to turn the selected
 *        asset(s) into a new animation or new frames in an existing animation.
 * @returns {{type: string, goal: AnimationPicker.Goal }}
 * @throws {TypeError} if a valid goal is not provided
 */
export function show(goal, isSpriteLab) {
  if ([Goal.NEW_ANIMATION, Goal.NEW_FRAME].indexOf(goal) === -1) {
    throw new TypeError('Must provide a valid goal');
  }
  return {type: SHOW, goal: goal, isSpriteLab: isSpriteLab};
}

export function showBackground(goal) {
  if (goal !== Goal.NEW_ANIMATION) {
    throw new TypeError('Must provide a valid goal');
  }
  return {type: SHOW_BACKGROUND, goal: goal};
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
    filename: filename,
  };
}

/**
 * We are showing the pre-upload warning.
 * @returns  {{type: string}}
 */
export function showingUploadWarning() {
  return {
    type: SHOWING_UPLOAD_WARNING,
  };
}

/**
 * The user exited the upload warning.
 * @returns  {{type: string}}
 */
export function exitedUploadWarning() {
  return {
    type: EXITED_UPLOAD_WARNING,
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
  harness.trackAnalytics({
    study: 'animation-library',
    study_group: 'control-2020',
    event: 'upload',
    data_json: JSON.stringify({
      size: result.size,
    }),
  });

  return function (dispatch, getState) {
    const isBackgroundMode =
      getState().interfaceMode === P5LabInterfaceMode.BACKGROUND;
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
          version: result.versionId,
          categories: [isBackgroundMode ? 'backgrounds' : ''],
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
  image.addEventListener('load', function () {
    onComplete({
      sourceSize: {x: image.width, y: image.height},
      frameSize: {x: image.width, y: image.height},
      frameCount: 1,
      frameDelay: 4,
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
    status: status,
  };
}

/**
 * An animation has been selected to be added to the list to save later.
 * @param {!AnimationProps} animation
 * @returns {{type: string, animation: AnimationProps}}
 */
export function addSelectedAnimation(animation) {
  return {
    type: SELECT_ANIMATION,
    animation: animation,
  };
}

/**
 * Remove an animation that was selected has been selected to save later.
 * @param {!AnimationProps} animation
 * @returns {{type: string, animation: AnimationProps}}
 */
export function removeSelectedAnimation(animation) {
  return {
    type: REMOVE_ANIMATION,
    animation: animation,
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
      if (
        ![P5LabInterfaceMode.ANIMATION, P5LabInterfaceMode.BACKGROUND].includes(
          state.interfaceMode
        )
      ) {
        dispatch(changeInterfaceMode(P5LabInterfaceMode.ANIMATION));
      }
      dispatch(addBlankAnimation(state.interfaceMode));
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
  harness.trackAnalytics({
    study: 'sprite-use',
    study_group: 'before-update-v2',
    event: 'select-sprite',
    data_json: JSON.stringify({
      name: animation.name,
      sourceUrl: animation.sourceUrl,
    }),
  });
  return (dispatch, getState) => {
    const goal = getState().animationPicker.goal;
    const selectedAnimations = getState().animationPicker.selectedAnimations;
    if (goal === Goal.NEW_ANIMATION) {
      if (!!selectedAnimations[animation.sourceUrl]) {
        dispatch(removeSelectedAnimation(animation));
      } else {
        dispatch(addSelectedAnimation(animation));
      }
    } else if (goal === Goal.NEW_FRAME) {
      dispatch(appendLibraryFrames(animation));
      dispatch(hide());
    }
  };
}

/**
 * The user wants to save the selected animations to their project. This concludes our picking
 * process. Loop through all selectedAnimations and save each individually to the project.
 * Only triggered at the end of multiselect.
 * @returns {function}
 */
export function saveSelectedAnimations() {
  return (dispatch, getState) => {
    const animations = Object.values(
      getState().animationPicker.selectedAnimations
    );
    const isSpriteLab = getState().animationPicker.isSpriteLab;
    animations.map(animation => {
      dispatch(addLibraryAnimation(animation, isSpriteLab));
    });
    dispatch(hide());
  };
}
