/**
 * @file Redux module for new format for tracking project animations.
 */
import _ from 'lodash';
import {combineReducers} from 'redux';
import {createUuid} from '../utils';
import {
  fetchURLAsBlob,
  blobToDataURI,
  dataURIToSourceSize
} from '../imageUtils';
import {animations as animationsApi} from '../clientApi';
import * as assetPrefix from '../assetManagement/assetPrefix';
import {selectAnimation} from './AnimationTab/animationTabModule';
import {reportError} from './errorDialogStackModule';
import {throwIfSerializedAnimationListIsInvalid} from './shapes';
import {projectChanged} from '../code-studio/initApp/project';
import firehoseClient from '@cdo/apps/lib/util/firehose';

// TODO: Overwrite version ID within session
// TODO: Load exact version ID on project load
// TODO: Piskel needs a "blank" state.  Revert to "blank" state when something
//       is deleted, so nothing is selected.
// TODO: Warn about duplicate-named animations.

// Args: {SerializedAnimationList} animationList
export const SET_INITIAL_ANIMATION_LIST = 'AnimationList/SET_INITIAL_ANIMATION_LIST';
// Args: {AnimationKey} key, {AnimationProps} props
export const ADD_ANIMATION = 'AnimationList/ADD_ANIMATION';
// Args: {number} index, {AnimationKey} key, {AnimationProps} props
export const ADD_ANIMATION_AT = 'AnimationList/ADD_ANIMATION_AT';
// Args: {AnimationKey} key, {AnimationProps} props
export const EDIT_ANIMATION = 'AnimationList/EDIT_ANIMATION';
// Args: {AnimationKey} key, {string} name
const SET_ANIMATION_NAME = 'AnimationList/SET_ANIMATION_NAME';
// Args: {AnimationKey} key, {bool} looping
const SET_ANIMATION_LOOPING = 'AnimationList/SET_ANIMATION_LOOPING';
// Args: {AnimationKey} key, {number} frameDelay
const SET_ANIMATION_FRAME_DELAY = 'AnimationList/SET_ANIMATION_FRAME_DELAY';
// Args: {AnimationKey} key
const DELETE_ANIMATION = 'AnimationList/DELETE_ANIMATION';
// Args: {AnimationKey} key
export const START_LOADING_FROM_SOURCE = 'AnimationList/START_LOADING_FROM_SOURCE';
// Args: {AnimationKey} key, {Blob} blob, {String} dataURI. Version?
export const DONE_LOADING_FROM_SOURCE = 'AnimationList/DONE_LOADING_FROM_SOURCE';
// Args: {AnimationKey} key, {string} version
const ON_ANIMATION_SAVED = 'AnimationList/ON_ANIMATION_SAVED';
// Args: {AnimationKey} key, {!SerializedAnimation} props
const SET_PENDING_FRAMES = 'AnimationList/SET_PENDING_FRAMES';
// Args: none
export const START_LOADING_PENDING_FRAMES_FROM_SOURCE = 'AnimationList/START_LOADING_PENDING_FRAMES_FROM_SOURCE';
// Args: {AnimationKey} key, {Blob} blob, {String} dataURI. Version?
export const DONE_LOADING_PENDING_FRAMES_FROM_SOURCE = 'AnimationList/DONE_LOADING_PENDING_FRAMES_FROM_SOURCE';
// Args: none
export const REMOVE_PENDING_FRAMES = 'AnimationList/REMOVE_PENDING_FRAMES';

export default combineReducers({
  orderedKeys,
  propsByKey,
  pendingFrames
});

/** pendingFrames is used for temporarily storing additional
  * frames before they get added to the animation in Piskel.
  * pendingFrames gets added to animation in PiskelEditor.jsx
  */
function pendingFrames(state, action) {
  state = state || {};
  switch (action.type) {

    case SET_PENDING_FRAMES:
      return {
        key: action.key,
        props: action.props
      };

    case REMOVE_PENDING_FRAMES:
      return {};

    case START_LOADING_PENDING_FRAMES_FROM_SOURCE:
      return Object.assign({}, state, {
        loadedFromSource: false
      });

    case DONE_LOADING_PENDING_FRAMES_FROM_SOURCE:
      return Object.assign({}, state, {
        loadedFromSource: true,
        saved: true,
        loadedProps: action.loadedProps
      });

    default:
      return state;
  }
}

function orderedKeys(state, action) {
  state = state || [];
  switch (action.type) {

    case SET_INITIAL_ANIMATION_LIST:
      return action.animationList.orderedKeys;

    case ADD_ANIMATION:
      return [].concat(
          state.slice(0),
          action.key);

    case ADD_ANIMATION_AT:
      return [].concat(
          state.slice(0, action.index),
          action.key,
          state.slice(action.index));

    case DELETE_ANIMATION:
      return state.filter(key => key !== action.key);

    default:
      return state;
  }
}

function propsByKey(state, action) {
  state = state || {};
  var newState;
  switch (action.type) {

    case SET_INITIAL_ANIMATION_LIST:
      return action.animationList.propsByKey;

    case ADD_ANIMATION:
    case ADD_ANIMATION_AT:
    case EDIT_ANIMATION:
    case SET_ANIMATION_NAME:
    case SET_ANIMATION_LOOPING:
    case SET_ANIMATION_FRAME_DELAY:
    case START_LOADING_FROM_SOURCE:
    case DONE_LOADING_FROM_SOURCE:
    case ON_ANIMATION_SAVED:
      return Object.assign({}, state, {
        [action.key]: animationPropsReducer(state[action.key], action)
      });

    case DELETE_ANIMATION:
      newState = Object.assign({}, state);
      delete newState[action.key];
      return newState;

    default:
      return state;
  }
}

/**
 * Reducer for a single animation props item.
 */
function animationPropsReducer(state, action) {
  state = state || {};
  switch (action.type) {

    case ADD_ANIMATION:
    case ADD_ANIMATION_AT:
      return action.props;

    case EDIT_ANIMATION:
      return Object.assign({}, state, action.props, {
        sourceUrl: null, // Once edited this animation is custom.
        saved: false // Dirty, so it'll get saved soon.
      });

    case SET_ANIMATION_NAME:
      return Object.assign({}, state, {
        name: action.name
      });

    case SET_ANIMATION_FRAME_DELAY:
      return Object.assign({}, state, {
        frameDelay: action.frameDelay
      });

    case SET_ANIMATION_LOOPING:
      return Object.assign({}, state, {
        looping: action.looping
      });

    case START_LOADING_FROM_SOURCE:
      return Object.assign({}, state, {
        loadedFromSource: false
      });

    case DONE_LOADING_FROM_SOURCE:
      return Object.assign({}, state, {
        loadedFromSource: true,
        saved: true,
        blob: action.blob,
        dataURI: action.dataURI,
        sourceSize: action.sourceSize
      });

    case ON_ANIMATION_SAVED:
      return Object.assign({}, state, {
        saved: true,
        version: action.version
      });

    default:
      return state;
  }
}

/**
 * Given a name and animationList, determine if the name is unique
 * @param {string} name
 * @param {Object} animationList - object of {AnimationKey} to {AnimationProps}
 */
export function isNameUnique(name, animationListProps) {
  for (let animation in animationListProps) {
    if (animationListProps[animation].name === name) {
      return false;
    }
  }
  return true;
}

/**
 * Given a baseName and a animationList, provide a unique name
 * @param {string} baseName - the original name for the animation (without numbers)
 * @param {Object} animationList - object of {AnimationKey} to {AnimationProps}
 */
function generateAnimationName(baseName, animationList) {
  let unavailableNumbers = [];
  // Match names with the form baseName_#
  for (let animation in animationList) {
    let animationName = animationList[animation].name;
    if (animationName.substring(0, baseName.length) === baseName) {
      animationName = animationName.replace(baseName, '');
      if (animationName[0] === '_') {
        const brokenUpString = animationName.split('_');
        const number = parseInt(brokenUpString.pop());
        unavailableNumbers.push(number);
      }
    }
  }
  unavailableNumbers.sort((a, b) => a - b);
  let availableNumber = 1;
  for (let i = 0; i < unavailableNumbers.length; i++) {
    if (availableNumber === unavailableNumbers[i]) {
      availableNumber++;
    } else {
      break;
    }
  }
  return baseName + '_' + availableNumber.toString();
}

/**
 * @param {!SerializedAnimationList} serializedAnimationList
 * @returns {function()}
 */
export function setInitialAnimationList(serializedAnimationList) {
  // Set default empty animation list if none was provided
  if (!serializedAnimationList) {
    serializedAnimationList = {orderedKeys: [], propsByKey: {}};
  }

  // TODO: Tear out this migration when we don't think we need it anymore.
  if (Array.isArray(serializedAnimationList)) {
    // We got old animation data that needs to be migrated.
    serializedAnimationList = {
      orderedKeys: serializedAnimationList.map(a => a.key),
      propsByKey: serializedAnimationList.reduce((memo, next) => {
        memo[next.key] = next;
        return memo;
      }, {})
    };
  }

  // Convert frameRates to frameDelays.
  for (let key in serializedAnimationList.propsByKey) {
    let animation = serializedAnimationList.propsByKey[key];
    if (!animation.frameDelay) {
      if (typeof animation.frameRate === 'number' && !isNaN(animation.frameRate) && animation.frameRate !== 0) {
        animation.frameDelay = Math.round(30 / animation.frameRate);
      } else {
        animation.frameDelay = 2;
      }
    }
    if (animation.looping === undefined) {
      animation.looping = true;
    }
  }

  // If animations have the same name, rename one.
  const numberAnimations = serializedAnimationList.orderedKeys.length;
  for (let i = 0; i < numberAnimations; i++) {
    const key = serializedAnimationList.orderedKeys[i];
    const name = serializedAnimationList.propsByKey[key].name;
    for (let j = i + 1; j < numberAnimations; j++) {
      const otherKey = serializedAnimationList.orderedKeys[j];
      if (name === serializedAnimationList.propsByKey[otherKey].name) {
        serializedAnimationList.propsByKey[otherKey].name = generateAnimationName(name, serializedAnimationList.propsByKey);
      }
    }
  }

  try {
    throwIfSerializedAnimationListIsInvalid(serializedAnimationList);
  } catch (err) {
    console.error('Unable to load animations:', err);
    return;
  }

  return dispatch => {
    dispatch({
      type: SET_INITIAL_ANIMATION_LIST,
      animationList: serializedAnimationList
    });
    dispatch(selectAnimation(serializedAnimationList.orderedKeys[0] || ''));
    serializedAnimationList.orderedKeys.forEach(key => {
      dispatch(loadAnimationFromSource(key));
    });
  };
}

export function addBlankAnimation() {
  const key = createUuid();
  return (dispatch, getState) => {
    // Special behavior here:
    // By pushing an animation that is "loadedFromSource" but has a null
    // blob and dataURI, Piskel will know to create a new document with
    // the given dimensions.
    dispatch(addAnimationAction(
      key,
      {
        name: generateAnimationName('animation', getState().animationList.propsByKey),
        sourceUrl: null,
        frameSize: {x: 100, y: 100},
        frameCount: 1,
        looping: true,
        frameDelay: 4,
        version: null,
        loadedFromSource: true,
        saved: false,
        blob: null,
        dataURI: null,
        hasNewVersionThisSession: false
      }));
    dispatch(selectAnimation(key));
    projectChanged();
  };
}

/**
 * Add a blank frame to pending frames for the selected animation.
 * @returns {function}
 */
export function appendBlankFrame() {
  return (dispatch, getState) => {
    const selectedAnimationKey = getState().animationTab.selectedAnimation;
    dispatch(setPendingFramesAction(selectedAnimationKey, {blankFrame: true}));
    projectChanged();
  };
}

/**
 * Add an animation to the project (at the end of the list).
 * @param {!AnimationKey} key
 * @param {!SerializedAnimation} props
 */
export function addAnimation(key, props) {
  // TODO: Validate that key is not already in use?
  // TODO: Validate props format?
  return (dispatch, getState) => {
    dispatch(addAnimationAction(key, { ...props, looping: true }));
    dispatch(loadAnimationFromSource(key, () => {
      dispatch(selectAnimation(key));
    }));
    let name = generateAnimationName(props.name, getState().animationList.propsByKey);
    dispatch(setAnimationName(key, name));
    projectChanged();
  };
}

/**
 * Append an animation to the project (at the end of the list of frames).
 * @param {!SerializedAnimation} props
 * @returns {function}
 */
export function appendCustomFrames(props) {
  return (dispatch, getState) => {
    const selectedAnimationKey = getState().animationTab.selectedAnimation;
    dispatch(setPendingFramesAction(selectedAnimationKey, props));
    dispatch(loadPendingFramesFromSource(selectedAnimationKey, props));
    projectChanged();
  };
}

/**
 * Add a library animation to the project.
 * @param {!SerializedAnimation} props
 */
export function addLibraryAnimation(props) {
  return (dispatch, getState) => {
    const key = createUuid();
    dispatch(addAnimationAction(key, props));
    dispatch(loadAnimationFromSource(key, () => {
      dispatch(selectAnimation(key));
    }));
    let name = generateAnimationName(props.name, getState().animationList.propsByKey);
    dispatch(setAnimationName(key, name));
    projectChanged();
  };
}

/**
 * Add a library animation as additional frames to the current animation
 * by adding them to pendingFrames.
 * @param {!SerializedAnimation} props
 * @returns {function}
 */
export function appendLibraryFrames(props) {
  return (dispatch, getState) => {
    const selectedAnimationKey = getState().animationTab.selectedAnimation;
    dispatch(setPendingFramesAction(selectedAnimationKey, props));
    dispatch(loadPendingFramesFromSource(selectedAnimationKey, props));
    projectChanged();
  };
}

/**
 * Clone the requested animation, putting the new one directly after the original
 * in the project animation list.
 * @param {!AnimationKey} key
 * @returns {Function}
 */
export function cloneAnimation(key) {
  return (dispatch, getState) => {
    const animationList = getState().animationList;
    // Track down the source animation and its index in the collection
    const sourceIndex = animationList.orderedKeys.indexOf(key);
    if (sourceIndex < 0) {
      throw new Error(`Animation ${key} not found`);
    }

    const sourceAnimation = animationList.propsByKey[key];
    const newAnimationKey = createUuid();
    dispatch({
      type: ADD_ANIMATION_AT,
      index: sourceIndex + 1,
      key: newAnimationKey,
      props: Object.assign({}, sourceAnimation, {
        name: generateAnimationName(sourceAnimation.name + '_copy', animationList.propsByKey),
        version: null,
        saved: false
      })
    });
    dispatch(selectAnimation(newAnimationKey));
    projectChanged();
  };
}

/**
 * Set the display name of the specified animation.
 * @param {string} key
 * @param {string} name
 * @returns {{type: string, key: string, name: string}}
 */
export function setAnimationName(key, name) {
  return dispatch => {
    dispatch({
      type: SET_ANIMATION_NAME,
      key,
      name
    });
    projectChanged();
  };
}

/**
 * Set the frameDelay of the specified animation.
 * @param {string} key
 * @param {number} frameDelay
 * @returns {{type: string, key: string, frameDelay: number}}
 */
export function setAnimationFrameDelay(key, frameDelay) {
  return dispatch => {
    dispatch({
      type: SET_ANIMATION_FRAME_DELAY,
      key,
      frameDelay
    });
    projectChanged();
  };
}

/**
 * Set the looping value of the specified animation.
 * @param {string} key
 * @param {bool} looping
 * @returns {{type: string, key: string, looping: bool}}
 */
export function setAnimationLooping(key, looping) {
  return dispatch => {
    dispatch({
      type: SET_ANIMATION_LOOPING,
      key,
      looping
    });
    projectChanged();
  };
}

/**
 * Modifies the animation props, capturing changes to its spritesheet.
 * @param {!AnimationKey} key
 * @param {object} props - needs a more detailed shape
 */
export function editAnimation(key, props) {
  return dispatch => {
    dispatch({
      type: EDIT_ANIMATION,
      key,
      props
    });
    projectChanged();
  };
}

/**
 * Delete the specified animation from the project.
 * @param {!AnimationKey} key
 * @returns {function}
 */
export function deleteAnimation(key) {
  return (dispatch, getState) => {
    const orderedKeys = getState().animationList.orderedKeys;
    const currentSelectionIndex = orderedKeys.indexOf(key);
    let keyToSelect = (currentSelectionIndex === 0) ? 1 : (currentSelectionIndex - 1);
    dispatch(selectAnimation(orderedKeys[keyToSelect] || null));

    dispatch({type: DELETE_ANIMATION, key});
    projectChanged();
    animationsApi.ajax('DELETE', key + '.png', () => {}, function error(xhr) {
      dispatch(reportError(`Error deleting object ${key}: ${xhr.status} ${xhr.statusText}`));
    });
  };
}

/**
 * Load the indicated animation (which must already have an entry in the project
 * animation list) from its source, whether that is S3 or the animation library.
 * @param {!AnimationKey} key
 * @param {function} [callback]
 */
function loadAnimationFromSource(key, callback) {
  callback = callback || function () {};
  return (dispatch, getState) => {
    const state = getState().animationList;
    const sourceUrl = animationSourceUrl(key, state.propsByKey[key]);
    dispatch({
      type: START_LOADING_FROM_SOURCE,
      key: key
    });
    fetchURLAsBlob(sourceUrl, (err, blob) => {
      if (err) {
        console.log('Failed to load animation ' + key, err);
        // Brute-force recovery step: Remove the animation from our redux state;
        // it looks like it's already gone from the server.

        // Log data about when this scenario occurs
        firehoseClient.putRecord(
         'analysis-events',
            {
              study: 'animation_no_load',
              study_group: 'animation_no_load_with_buttons',
              event: 'animation_not_loaded',
              data_json: JSON.stringify({'sourceUrl': sourceUrl, 'version': state.propsByKey[key].version,
                'animationName': state.propsByKey[key].name, 'error': err.message})
            }
        );

        dispatch(reportError(`Sorry, we couldn't load animation "${state.propsByKey[key].name}".`, "anim_load", key));
        return;
      }

      blobToDataURI(blob, dataURI => {
        dataURIToSourceSize(dataURI).then(sourceSize => {
          dispatch({
            type: DONE_LOADING_FROM_SOURCE,
            key,
            blob,
            dataURI,
            sourceSize
          });
          callback();
        });
      });
    });
  };
}

/**
 * Action creator for adding an animation.
 * @param {!AnimationKey} key
 * @param {SerializedAnimation} props
 * @returns {{type: string, key: AnimationKey, props: SerializedAnimation}}
 */
export function addAnimationAction(key, props) {
  return {
    type: ADD_ANIMATION,
    key,
    props
  };
}

/**
 * Action creator for when a user selects new frames to add to the animation.
 * Set these as pending before loading them into Piskel.
 * @param {!AnimationKey} key
 * @param {SerializedAnimation} props
 * @returns {{type: string, key: AnimationKey, props: SerializedAnimation}}
 */
function setPendingFramesAction(key, props) {
  return {
    type: SET_PENDING_FRAMES,
    key,
    props
  };
}

/**
 * Action creator for removing pending frames.
 * @returns {{type: string}}
 */
export function removePendingFramesAction() {
  return {
    type: REMOVE_PENDING_FRAMES
  };
}

/**
 * Action creator for when pending frames are done loading from the source url.
 * @returns {{type: string, key: AnimationKey, props: SerializedAnimation}}
 */
function doneLoadingPendingFramesFromSourceAction(key, loadedProps) {
  return {
    type: DONE_LOADING_PENDING_FRAMES_FROM_SOURCE,
    key,
    loadedProps
  };
}

/**
 * Action creator for when pending frames will start loading from the source url.
 * @returns {{type: string}}
 */
function startLoadingPendingFramesFromSourceAction() {
  return {
    type: START_LOADING_PENDING_FRAMES_FROM_SOURCE
  };
}

/**
 * Load the indicated animation from its source, whether that is S3 or the animation library.
 * From this function we'll need the dataURI and sourceSize to send to Piskel.
 * @param {!AnimationKey} key
 * @param {SerializedAnimation} props
 * @param {function} [callback]
 */
function loadPendingFramesFromSource(key, props, callback) {
  callback = callback || function () {};
  return (dispatch, getState) => {
    const sourceUrl = animationSourceUrl(key, props);
    dispatch(startLoadingPendingFramesFromSourceAction());
    fetchURLAsBlob(sourceUrl, (err, blob) => {
      if (err) {
        console.log('Failed to load pending animation frames' + key, err);
        dispatch(removePendingFramesAction());
        return;
      }
      blobToDataURI(blob, dataURI => {
        dataURIToSourceSize(dataURI).then(sourceSize => {
          dispatch(doneLoadingPendingFramesFromSourceAction(key, {blob, dataURI, sourceSize}));
          callback();
        });
      });
    });
  };
}

/**
 * Given a key/serialized-props pair for an animation, work out where to get
 * the spritesheet.
 * @param {!AnimationKey} key
 * @param {!SerializedAnimationProps} props
 * @param {boolean} withVersion - Whether to request a specific version of the
 *        animation if pulling from the local project.
 * @returns {string}
 */
export function animationSourceUrl(key, props, withVersion = false) {
  // TODO: (Brad) We want to get to where the client doesn't know much about
  //       animation versions, by switching to Chris' new Files API.
  //       in the meantime, be able to request versions only when we export
  //       JSON for levelbuilders to use.

  // 1. If the animation has a sourceUrl it's external (from the library
  //    or some other outside source, not the animation API) - and we may need
  //    to run it through the media proxy.
  if (props.sourceUrl) {
    return assetPrefix.fixPath(props.sourceUrl);
  }

  // 2. Otherwise it's local to this project, and we should use the animation
  //    key to look it up in the animations API.
  return animationsApi.basePath(key) + '.png' +
      ((withVersion && props.version) ? '?version=' + props.version : '');
}

/**
 * Static helper for converting a serialized animation list to an exportable one
 * with absolute sourceUrls for the animations.
 * Only used for a levelbuilder utility.
 * @param {SerializedAnimationList} serializedList
 * @return {SerializedAnimationList} with aboslute sourceUrls for every animation.
 */
export function withAbsoluteSourceUrls(serializedList) {
  let list = _.cloneDeep(serializedList);
  list.orderedKeys.forEach(key => {
    let props = list.propsByKey[key];

    const relativeUrl = animationSourceUrl(key, props, true);
    const sourceLocation = document.createElement('a');
    sourceLocation.href = relativeUrl;
    props.sourceUrl = sourceLocation.href;
  });
  return list;
}

/**
 * Dispatch to save animations to S3.
 * @param {function} onComplete callback - when all animations are saved
 * @returns {function()}
 */
export function saveAnimations(onComplete) {
  return (dispatch, getState) => {
    const state = getState().animationList;
    // Animations with a sourceUrl are referencing an external spritesheet and
    // should not be saved - until an edit operation clears the sourceUrl.
    // Also check the saved flag, so we only upload animations that have changed.
    const changedAnimationKeys = state.orderedKeys.filter(key =>
        !state.propsByKey[key].sourceUrl && state.propsByKey[key].blob &&
        !state.propsByKey[key].saved);
    Promise.all(changedAnimationKeys.map(key => {
          return saveAnimation(key, state.propsByKey[key])
              .then(action => { dispatch(action); });
        }))
        .then(() => {
          onComplete();
        })
        .catch(err => {
          // TODO: What should we really do in this case?
          console.log('Failed to save animations', err); // TODO: Remove?
          onComplete();
        });
  };
}

/**
 *
 * @param {AnimationKey} animationKey
 * @param {AnimationProps} animationProps
 * @return {Promise} which resolves to a redux action object
 */
export function saveAnimation(animationKey, animationProps) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();

    const onError = function () {
      reject(new Error(`${xhr.status} ${xhr.statusText}`));
    };

    const onSuccess = function () {
      if (xhr.status >= 400) {
        onError();
        return;
      }

      try {
        const response = JSON.parse(xhr.responseText);
        resolve({
          type: ON_ANIMATION_SAVED,
          key: animationKey,
          version: response.versionId
        });
      } catch (e) {
        reject(e);
      }
    };

    xhr.addEventListener('load', onSuccess);
    xhr.addEventListener('error', onError);
    xhr.open('PUT', animationsApi.basePath(animationKey + '.png'), true);
    xhr.setRequestHeader("Content-type", "image/png");
    xhr.send(animationProps.blob);
  });
}

/**
  * Selector for allAnimationsSingleFrame
  */
export function allAnimationsSingleFrameSelector(state) {
  return state.pageConstants.allAnimationsSingleFrame;
}
