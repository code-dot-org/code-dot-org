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
 *     list: [ AnimationKey, AnimationKey ],
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
import {reportError} from './errorDialogStackModule';
/* global dashboard */

// Args: {SerializedAnimationList} animationList
const SET_INITIAL_ANIMATION_LIST = 'SET_INITIAL_ANIMATION_LIST';
// Args: {AnimationKey} key, {SerializedAnimation} data
export const ADD_ANIMATION = 'ADD_ANIMATION';
// Args: {number} index, {AnimationKey} key, {SerializedAnimation} data
export const ADD_ANIMATION_AT = 'ADD_ANIMATION_AT';
// Args: {AnimationKey} key, {SerializedAnimation} data
export const EDIT_ANIMATION = 'EDIT_ANIMATION';
// Args: {AnimationKey} key, {string} name
const SET_ANIMATION_NAME = 'SET_ANIMATION_NAME';
// Args: {AnimationKey} key
const DELETE_ANIMATION = 'DELETE_ANIMATION';

// const SET_ANIMATION_NAME = 'SET_ANIMATION_NAME';

// Args: {AnimationKey} key
const START_LOADING_FROM_SOURCE = 'START_LOADING_FROM_SOURCE';
// Args: {AnimationKey} key, {Blob} blob, {String} dataURI. Version?
const DONE_LOADING_FROM_SOURCE = 'DONE_LOADING_FROM_SgOURCE';
// Args: {AnimationKey} key, {string} version
const ON_ANIMATION_SAVED = 'ON_ANIMATION_SAVED';

export default combineReducers({
  list,
  data
});

function list(state, action) {
  state = state || [];
  switch (action.type) {

    case SET_INITIAL_ANIMATION_LIST:
      return action.animationList.list;

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
    case SET_ANIMATION_NAME:
    case START_LOADING_FROM_SOURCE:
    case DONE_LOADING_FROM_SOURCE:
    case ON_ANIMATION_SAVED:
      newState = Object.assign({}, state);
      newState[action.key] = datum(newState[action.key], action);
      return newState;

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
    serializedAnimationList.list.forEach(key => {
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
    dispatch(loadAnimationFromSource(key));
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
    dispatch(loadAnimationFromSource(key, data.sourceUrl));
    dashboard.project.projectChanged();
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

    var onCloneError = function (errorMessage) {
      dispatch(reportError(`Error copying object ${key}: ${errorMessage}`));
    };

    // Track down the source animation and its index in the collection
    var sourceIndex = state.list.indexOf(key);
    if (sourceIndex < 0) {
      onCloneError('Animation not found');
      return;
    }
    var sourceAnimation = state.data[key];
    var newAnimationKey = utils.createUuid();

    /**
     * Once the cloned asset is ready, call this to add the appropriate metadata.
     * @param {string} [versionId]
     */
    var addClonedAnimation = function (versionId) {
      dispatch({
        type: ADD_ANIMATION_AT,
        index: sourceIndex + 1,
        key: newAnimationKey,
        data: Object.assign({}, sourceAnimation, {
          name: sourceAnimation.name + '_copy', // TODO: better generated names
          version: versionId
        })
      });
      dashboard.project.projectChanged();
    };

    // If cloning a library animation, no need to perform a copy request
    if (/^\/blockly\//.test(sourceAnimation.sourceUrl)) {
      addClonedAnimation();
    } else {
      animationsApi.ajax(
          'PUT',
          newAnimationKey + '.png?src=' + key + '.png',
          function success(xhr) {
            try {
              var response = JSON.parse(xhr.responseText);
              addClonedAnimation(response.versionId);
            } catch (e) {
              onCloneError(e.message);
            }
          },
          function error(xhr) {
            onCloneError(xhr.status + ' ' + xhr.statusText);
          });
    }
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
    animationsApi.ajax(
        'DELETE',
        key + '.png',
        function success() {
          dispatch({
            type: DELETE_ANIMATION,
            key
          });
          dashboard.project.projectChanged();
        },
        function error(xhr) {
          dispatch(reportError(`Error deleting object ${key}: ${xhr.status} ${xhr.statusText}`));
        }
    );
  };
}

/**
 * Load the indicated animation (which must already have an entry in the project
 * animation list) from its source, whether that is S3 or the animation library.
 * @param {!AnimationKey} key
 * @param {string} [sourceUrl]
 */
function loadAnimationFromSource(key, sourceUrl) {
  sourceUrl = sourceUrl || animationsApi.basePath(key) + '.png';
  return (dispatch, getState) => {
    dispatch({
      type: START_LOADING_FROM_SOURCE,
      key: key
    });
    // Figure out URL from animation key
    // TODO: Take version ID into account here...
    fetchUrlAsBlob(sourceUrl, (err, blob) => {
      if (err) {
        return;
      }

      // TODO: Handle error gracefully
      blobToDataURI(blob, dataURI => {
        dispatch({
          type: DONE_LOADING_FROM_SOURCE,
          key,
          blob,
          dataURI
        });
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
 * Dispatch on an interval to autosave animations to S3.
 * @returns {function()}
 */
export function autosaveAnimations() {
  return (dispatch, getState) => {
    console.log('Autosaving animations');
    const state = getState().animationList;
    const changedAnimationKeys = state.list.filter(key => !state.data[key].saved);
    // If nothing changed, no action necessary.
    if (0 === changedAnimationKeys.length) {
      console.log("No animations to save right now.");
      return;
    }

    const onError = message => {
      console.log('Error saving animation: ', message);
    };

    // Blockly.fireUiEvent(window, 'workspaceChange');
    // $(window).trigger('appModeChanged');
    // Could we hook into the normal autosave loop instead?

    changedAnimationKeys.forEach(key => {
      animationsApi.ajax(
          'PUT',
          key + '.png',
          function success(xhr) {
            try {
              var response = JSON.parse(xhr.responseText);
              console.log('Saved animation: ', response);
              dispatch({
                type: ON_ANIMATION_SAVED,
                key: key,
                version: response.versionId
              });
              dashboard.project.projectChanged();
            } catch (e) {
              onError(e.message);
            }
          },
          function error(xhr) {
            onError(xhr.status + ' ' + xhr.statusText);
          },
          state.data[key].blob);
    });
  };
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
 * @property {AnimationKey[]} list - Animations in project order
 * @property {Object.<AnimationKey, SerializedAnimation>} data
 */

/**
 * @typedef {Object} AnimationList
 * @property {AnimationKey[]} list - Animation keys in project order
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
    list: animationList.list,
    data: _.pick(
        _.mapValues(animationList.data, getSerializedAnimation),
        animationList.list)
  };
}

// TODO: Enable starting new blank animation
// TODO: Don't upload to S3 on selection if an animation is never modified
// TODO: Save uploaded animation version ID to metadata
// TODO: Overwrite version ID within session
// TODO: Save project source on animation update.
// TODO: Handle slow Piskel initialization gracefully.
// TODO: Piskel needs a "blank" state.  Revert to "blank" state when something
//       is deleted, so nothing is selected.
// TODO: Piskel load breaks when adding from gallery due to delay getting full image data
// TODO: Warn about duplicate-named animations.
