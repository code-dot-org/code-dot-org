/** @file Type definitions (React and otherwise) specific to Gamelab */

import _ from 'lodash';
import React from 'react';

/**
 * @typedef {Object} Vector2
 * @property {number} x
 * @property {number} y
 */
const Vector2 = React.PropTypes.shape({
  x: React.PropTypes.number.isRequired,
  y: React.PropTypes.number.isRequired
});

/*
 * MIGRATION NOTES - 30 June 2016 bbuchanan
 *  The old shape of animations is an array of animation metadata.
 *    [
 *      {animation},
 *      {animation}
 *    ]
 *
 *  The new shape is an object with animation and cache components
 *    {
 *     orderedKeys: [ AnimationKey, AnimationKey ],
 *     propsByKey: {
 *       AnimationKey: {AnimationProps},
 *       AnimationKey: {AnimationProps}
 *     }
 *   }
 *
 *  AnimationProps should include the actual spritesheet (as blob and dataURI),
 *  dimensions and frame dimensions, framerate, name, last save time, version IDs,
 *  URL to fetch the animation from the API, etc.
 *
 *  We serialize a smaller set of information {SerializedAnimationProps}.
 *
 *  We need to do a migration if the old style gets loaded.
 *  See setInitialAnimationList for how this works.
 */

/**
 * @typedef {string} AnimationKey
 * A string that uniquely identifies an animation within the project, usually
 * a UUID.
 */
export const AnimationKey = React.PropTypes.string;

/**
 * @typedef {Object} AnimationProps
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
export const AnimationProps = React.PropTypes.shape({
  name: React.PropTypes.string.isRequired,
  sourceUrl: React.PropTypes.string,
  sourceSize: Vector2.isRequired,
  frameSize: Vector2.isRequired,
  version: React.PropTypes.string,
  loadedFromSource: React.PropTypes.bool,
  saved: React.PropTypes.bool,
  blob: React.PropTypes.object,
  dataURI: React.PropTypes.string,
  hasNewVersionThisSession: React.PropTypes.bool
});

/**
 * A subset of AnimationProps that gets saved with the project JSON.
 * @typedef {Object} SerializedAnimationProps
 * @property {string} name
 * @property {string} sourceUrl
 * @property {Vector2} sourceSize
 * @property {Vector2} frameSize
 * @property {number} frameCount
 * @property {number} frameRate
 * @property {string} [version] - S3 version key
 */

/**
 * @param {AnimationProps} animation
 * @return {SerializedAnimationProps}
 */
function getSerializedAnimationProps(animation) {
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
 * @typedef {Object} AnimationList
 * @property {AnimationKey[]} orderedKeys - Animation keys in project order
 * @property {Object.<AnimationKey, AnimationProps>} propsByKey
 */
export const AnimationList = React.PropTypes.shape({
  orderedKeys: React.PropTypes.arrayOf(AnimationKey).isRequired,
  propsByKey: React.PropTypes.objectOf(AnimationProps).isRequired
});

/**
 * @typedef {Object} SerializedAnimationList
 * @property {AnimationKey[]} orderedKeys - Animations in project order
 * @property {Object.<AnimationKey, SerializedAnimationProps>} propsByKey
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
    propsByKey: _.pick(
        _.mapValues(animationList.propsByKey, getSerializedAnimationProps),
        animationList.orderedKeys)
  };
}
