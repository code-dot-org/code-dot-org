/** @file redux actions and reducers for project animation metadata. */

import _ from 'lodash';
import utils from '../utils';
import {animations as animationsApi} from '../clientApi';
import {reportError} from './errorDialogStackModule';
import {validateAndShapeMetadata} from './animationMetadata';

export const ADD_ANIMATION_AT = 'ADD_ANIMATION_AT';
const SET_INITIAL_ANIMATION_METADATA = 'SET_INITIAL_ANIMATION_METADATA';

/**
 * Push full animation metadata into the store, usually on first load
 * from the sources API.
 *
 * @param {Object} metadata
 * @returns {{type: ActionType, metadata: AnimationMetadata[]}}
 */
export function setInitialAnimationMetadata(metadata) {
  return {
    type: SET_INITIAL_ANIMATION_METADATA,
    metadata: metadata.map(validateAndShapeMetadata)
  };
}

export function addAnimation(animationProps) {
  return function (dispatch, getState) {
    dispatch({
      type: ADD_ANIMATION_AT,
      index: getState().animations.length,
      animationProps: validateAndShapeMetadata(animationProps)
    });
    // TODO: Save project after adding an animation?
  };
}

export function cloneAnimation(animationKey) {
  return function (dispatch, getState) {
    var animations = getState().animations;

    var onCloneError = function (errorMessage) {
      dispatch(reportError(
          'Error copying object ' + animationKey + ': ' + errorMessage));
    };

    // Track down the source animation and its index in the collection
    var sourceIndex = animations.map(function (a) { return a.key; }).indexOf(animationKey);
    if (sourceIndex < 0) {
      onCloneError('Animation not found');
      return;
    }
    var sourceAnimation = animations[sourceIndex];
    var newAnimationKey = utils.createUuid();

    /**
     * Once the cloned asset is ready, call this to add the appropriate metadata.
     * @param {string} [versionId]
     */
    var addClonedAnimation = function (versionId) {
      dispatch({
        type: ADD_ANIMATION_AT,
        index: sourceIndex + 1,
        animationProps: _.assign({}, sourceAnimation, {
          key: newAnimationKey,
          name: sourceAnimation.name + '_copy', // TODO: better generated names
          version: versionId
        })
      });
    };

    // If cloning a library animation, no need to perform a copy request
    if (/^\/blockly\//.test(sourceAnimation.sourceUrl)) {
      addClonedAnimation();
    } else {
      animationsApi.ajax(
          'PUT',
          newAnimationKey + '.png?src=' + animationKey + '.png',
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
