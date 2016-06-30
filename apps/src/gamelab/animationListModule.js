/**
 * @file Redux module for new format for tracking project animations.
 *
 * MIGRATION NOTES
 *  The old shape of animations is an array of animation metadata.
 *    [
 *      {animation},
 *      {animation}
 *    ]
 *
 *  The new shape is an object with animation and cache components
 *    {
 *     orderedKeys: [ AnimationKey, AnimationKey ],
 *     data: {
 *       AnimationKey: {AnimationData},
 *       AnimationKey: {AnimationData}
 *     }
 *   }
 *
 *  AnimationData should include the actual spritesheet (as blob and dataURI),
 *  dimensions and frame dimensions, framerate, name, last save time, version IDs,
 *  URL to fetch the animation from the API, etc.
 *
 *  We serialize a smaller set of information.
 *
 *  We need to do a migration if the old style gets loaded.
 *  See setInitialAnimationMetadata for how this works.
 */
import _ from 'lodash';
import {combineReducers} from 'redux';
import utils from '../utils';
import {animations as animationsApi} from '../clientApi';
import {selectAnimation} from './AnimationTab/animationTabModule';
import {reportError} from './errorDialogStackModule';
/* global dashboard */

// Args: {SerializedAnimationList} animationList
const SET_INITIAL_ANIMATION_LIST = 'AnimationList/SET_INITIAL_ANIMATION_LIST';
// Args: {AnimationKey} key, {SerializedAnimation} data
export const ADD_ANIMATION = 'AnimationList/ADD_ANIMATION';
// Args: {number} index, {AnimationKey} key, {SerializedAnimation} data
export const ADD_ANIMATION_AT = 'AnimationList/ADD_ANIMATION_AT';
// Args: {AnimationKey} key, {SerializedAnimation} data
export const EDIT_ANIMATION = 'AnimationList/EDIT_ANIMATION';
// Args: {AnimationKey} key
const INVALIDATE_ANIMATION = 'AnimationList/INVALIDATE_ANIMATION';
// Args: {AnimationKey} key, {string} name
const SET_ANIMATION_NAME = 'AnimationList/SET_ANIMATION_NAME';
// Args: {AnimationKey} key
const DELETE_ANIMATION = 'AnimationList/DELETE_ANIMATION';
// Args: {AnimationKey} key
const START_LOADING_FROM_SOURCE = 'AnimationList/START_LOADING_FROM_SOURCE';
// Args: {AnimationKey} key, {Blob} blob, {String} dataURI. Version?
const DONE_LOADING_FROM_SOURCE = 'AnimationList/DONE_LOADING_FROM_SgOURCE';
// Args: {AnimationKey} key, {string} version
const ON_ANIMATION_SAVED = 'AnimationList/ON_ANIMATION_SAVED';

export default combineReducers({
  orderedKeys,
  data
});

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

function data(state, action) {
  state = state || {};
  var newState;
  switch (action.type) {

    case SET_INITIAL_ANIMATION_LIST:
      return action.animationList.data;

    case ADD_ANIMATION:
    case ADD_ANIMATION_AT:
    case EDIT_ANIMATION:
    case INVALIDATE_ANIMATION:
    case SET_ANIMATION_NAME:
    case START_LOADING_FROM_SOURCE:
    case DONE_LOADING_FROM_SOURCE:
    case ON_ANIMATION_SAVED:
      return Object.assign({}, state, {
        [action.key]: datum(state[action.key], action)
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
 * Reducer for a single animation data item.
 */
function datum(state, action) {
  state = state || {};
  switch (action.type) {

    case ADD_ANIMATION:
    case ADD_ANIMATION_AT:
      return action.data;

    case EDIT_ANIMATION:
      return Object.assign({}, state, action.data, {
        saved: false // Dirty, so it'll get saved soon.
      });

    case INVALIDATE_ANIMATION:
      return Object.assign({}, state, {
        saved: false // Dirty, so it'll get saved soon.
      });

    case SET_ANIMATION_NAME:
      return Object.assign({}, state, {
        name: action.name
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
        dataURI: action.dataURI
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
 *
 * @param {!SerializedAnimationList} serializedAnimationList
 * @returns {function()}
 */
export function setInitialAnimationList(serializedAnimationList) {
  return dispatch => {
    // TODO: Should I validate here?
    // TODO: Should I add transient properties here?
    dispatch({
      type: SET_INITIAL_ANIMATION_LIST,
      animationList: serializedAnimationList
    });
    serializedAnimationList.orderedKeys.forEach(key => {
      dispatch(loadAnimationFromSource(key));
    });
  };
}

/**
 * Add an animation to the project (at the end of the list).
 * @param {!AnimationKey} key
 * @param {!SerializedAnimation} data
 */
export function addAnimation(key, data) {
  // TODO: Validate that key is not already in use?
  // TODO: Validate data format?
  return dispatch => {
    dispatch({
      type: ADD_ANIMATION,
      key,
      data
    });
    dispatch(loadAnimationFromSource(key, undefined, () => {
      dispatch(selectAnimation(key));
    }));
    dashboard.project.projectChanged();
  };
}

/**
 * Add a library animation to the project.
 * @param {!SerializedAnimation} data
 */
export function addLibraryAnimation(data) {
  return dispatch => {
    const key = utils.createUuid();
    dispatch({
      type: ADD_ANIMATION,
      key,
      data
    });
    dispatch(loadAnimationFromSource(key, data.sourceUrl, () => {
      dispatch(invalidateAnimation(key));
      dispatch(selectAnimation(key));
    }));
    dashboard.project.projectChanged();
  };
}

/**
 * Mark an animation as needing to be saved to S3.
 * @param {AnimationKey} key
 * @returns {{type: ActionType, key: AnimationKey}}
 */
function invalidateAnimation(key) {
  return {
    type: INVALIDATE_ANIMATION,
    key
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
    const state = getState().animationList;
    // Track down the source animation and its index in the collection
    const sourceIndex = state.orderedKeys.indexOf(key);
    if (sourceIndex < 0) {
      throw new Error(`Animation ${key} not found`);
    }

    const sourceAnimation = state.data[key];
    const newAnimationKey = utils.createUuid();
    dispatch({
      type: ADD_ANIMATION_AT,
      index: sourceIndex + 1,
      key: newAnimationKey,
      data: Object.assign({}, sourceAnimation, {
        name: sourceAnimation.name + '_copy', // TODO: better generated names
        version: null,
        saved: false
      })
    });
    dispatch(selectAnimation(newAnimationKey));
    dashboard.project.projectChanged();
  };
}

/**
 * Set the display name of the specified animation.
 * @param {string} key
 * @param {string} name
 * @returns {{type: ActionType, key: string, name: string}}
 */
export function setAnimationName(key, name) {
  return dispatch => {
    dispatch({
      type: SET_ANIMATION_NAME,
      key,
      name
    });
    dashboard.project.projectChanged();
  };
}

/**
 * Modifies the animation data, capturing changes to its spritesheet.
 * @param {!AnimationKey} key
 * @param {object} data - needs a more detailed shape
 */
export function editAnimation(key, data) {
  return dispatch => {
    dispatch({
      type: EDIT_ANIMATION,
      key,
      data
    });
    dashboard.project.projectChanged();
  };
}

/**
 * Delete the specified animation from the project.
 * @param {!AnimationKey} key
 * @returns {function}
 */
export function deleteAnimation(key) {
  return dispatch => {
    dispatch(selectAnimation(null));
    dispatch({type: DELETE_ANIMATION, key});
    dashboard.project.projectChanged();
    animationsApi.ajax('DELETE', key + '.png', () => {}, function error(xhr) {
      dispatch(reportError(`Error deleting object ${key}: ${xhr.status} ${xhr.statusText}`));
    });
  };
}

/**
 * Load the indicated animation (which must already have an entry in the project
 * animation list) from its source, whether that is S3 or the animation library.
 * @param {!AnimationKey} key
 * @param {string} [sourceUrl]
 * @param {function} [callback]
 */
function loadAnimationFromSource(key, sourceUrl, callback) {
  // Figure out URL from animation key
  // TODO: Take version ID into account here...
  sourceUrl = sourceUrl || animationsApi.basePath(key) + '.png';
  callback = callback || function () {};
  return dispatch => {
    dispatch({
      type: START_LOADING_FROM_SOURCE,
      key: key
    });
    fetchUrlAsBlob(sourceUrl, (err, blob) => {
      if (err) {
        console.log('Failed to load animation ' + key, err);
        // Brute-force recovery step: Remove the animation from our redux state;
        // it looks like it's already gone from the server.
        dispatch({
          type: DELETE_ANIMATION,
          key
        });
        return;
      }

      blobToDataURI(blob, dataURI => {
        dispatch({
          type: DONE_LOADING_FROM_SOURCE,
          key,
          blob,
          dataURI
        });
        callback();
      });
    });
  };
}

function fetchUrlAsBlob(url, onComplete) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = e => {
    if (e.target.status === 200) {
      onComplete(null, e.target.response);
    } else {
      onComplete(new Error(`URL ${url} responded with code ${e.target.status}`));
    }
  };
  xhr.onerror = e => onComplete(new Error(`Error ${e.target.status} occurred while receiving the document.`));
  xhr.send();
}

function blobToDataURI(blob, onComplete) {
  let fileReader = new FileReader();
  fileReader.onload = e => onComplete(e.target.result);
  fileReader.readAsDataURL(blob);
}

/**
 * Dispatch to save animations to S3.
 * @param {function} onComplete callback - when all animations are saved
 * @returns {function()}
 */
export function saveAnimations(onComplete) {
  return (dispatch, getState) => {
    const state = getState().animationList;
    const changedAnimationKeys = state.orderedKeys.filter(key => !state.data[key].saved);
    Promise.all(changedAnimationKeys.map(key => {
          return saveAnimation(key, state.data[key])
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
 * @param {Object} animationData // TODO: Better type?
 * @return {Promise} which resolves to a redux action object
 */
function saveAnimation(animationKey, animationData) {
  return new Promise((resolve, reject) => {
    if (typeof animationData.blob === 'undefined') {
      reject(new Error(`Animation ${animationKey} has no loaded content.`));
      return;
    }

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
    xhr.send(animationData.blob);
  });
}

/**
 * @typedef {Object} Vector2
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Animation
 * @property {string} name
 * @property {string} sourceUrl - Remote location where the animation spritesheet
 *           is stored.  Should be replaced soon with more of a 'gallery' concept.
 * @property {Vector2} sourceSize
 * @property {Vector2} frameSize
 * @property {number} frameCount
 * @property {number} frameRate
 * @property {string} [version] - S3 version key
 *
 * @property {boolean} loadedFromSource - False at first, true after load successful.
 * @property {boolean} saved - True if the current blob represents the last thing
 *           we uploaded to the animations API, false if we have a pending change
 *           to save.
 * @property {Blob} blob - The spritesheet as a data blob (can be uploaded
 *           directly to the animations API via PUT).
 * @property {string} dataURI - The spritesheet as a dataURI (can be set as src
 *           on an image).
 * @property {boolean} hasNewVersionThisSession - Whether a new version of the
 *           animation has been created in the current session. If true, we
 *           should continue replacing this version instead of writing new
 *           versions to S3.  If false, any write should generate a new
 *           version and this flag should become true.
 */

/**
 * @typedef {Object} SerializedAnimation
 * @property {string} name
 * @property {string} sourceUrl
 * @property {Vector2} sourceSize
 * @property {Vector2} frameSize
 * @property {number} frameCount
 * @property {number} frameRate
 * @property {string} [version] - S3 version key
 */

/**
 * @param {Animation} animation
 * @return {SerializedAnimation}
 */
function getSerializedAnimation(animation) {
  // Only serialize out properties we need to reconstruct the animation when
  // we load back in - dropping the cached spritesheet, invalidation flags, etc.
  return _.pick(animation, [
    'name',
    'sourceUrl',
    'sourceSize',
    'frameSize',
    'frameCount',
    'frameRate',
    'version'
  ]);
}

/**
 * @typedef {string} AnimationKey
 * A string that uniquely identifies an animation within the project, usually
 * a UUID.
 */

/**
 * @typedef {Object} SerializedAnimationList
 * @property {AnimationKey[]} orderedKeys - Animations in project order
 * @property {Object.<AnimationKey, SerializedAnimation>} data
 */

/**
 * @typedef {Object} AnimationList
 * @property {AnimationKey[]} orderedKeys - Animation keys in project order
 * @property {Object.<AnimationKey, Animation>} data
 */

/**
 * @param {AnimationList} animationList
 * @return {SerializedAnimationList}
 */
export function getSerializedAnimationList(animationList) {
  // Two transformations happen when we serialize animations out.
  // 1. We only save a subset of animation attributes - see getSerializedAnimation
  // 2. We stop saving animation data for any animations not in the project
  //    animation list - we should clean this up on delete, but in case things
  //    get in an inconsistent state we clean it up here.
  return {
    orderedKeys: animationList.orderedKeys,
    data: _.pick(
        _.mapValues(animationList.data, getSerializedAnimation),
        animationList.orderedKeys)
  };
}

// TODO: Don't upload to S3 if an animation is never modified
// TODO: Overwrite version ID within session
// TODO: Load exact version ID on project load
// TODO: Piskel needs a "blank" state.  Revert to "blank" state when something
//       is deleted, so nothing is selected.
// TODO: Enable starting new blank animation
// TODO: Warn about duplicate-named animations.
