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
