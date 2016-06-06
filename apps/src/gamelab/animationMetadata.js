/** @file Helper methods for working with animation metadata */
import React from 'react';
import _ from '../lodash';
import { animations as animationsApi } from '../clientApi';

/**
 * @typedef {Object} Vector2
 * @property {number} x
 * @property {number} y
 */

/**
 * React validation shape for an {x,y} pair.
 */
const VECTOR2_SHAPE = {
  x: React.PropTypes.number.isRequired,
  y: React.PropTypes.number.isRequired
};

/**
 * @typedef {string} AnimationKey
 * A string that uniquely identifies an animation within the project, usually
 * a UUID.
 */

/**
 * @typedef {Object} AnimationMetadata
 * @property {!AnimationKey} key - Uniquely identifies animation within project
 * @property {string} name
 * @property {string} sourceUrl
 * @property {Vector2} sourceSize
 * @property {Vector2} frameSize
 * @property {number} frameCount
 * @property {number} frameRate
 * @property {number} [size] - file size (in kB)
 * @property {string} [version] - S3 version key.
 */

/**
 * Given an AnimationMetadata object, attempt to patch it up to include all the
 * properties we expect it to have.  Throw an error if we're unable to do so.
 * @param {AnimationMetadata} animation
 * @returns {AnimationMetadata}
 * @throws {TypeError} if the input animation is invalid and can't be reconciled.
 */
export function validateAndShapeMetadata(animation) {
  let shapedAnimation = _.assign({}, animation);
  if (!shapedAnimation.hasOwnProperty('key')) {
    throw new TypeError('Animations must have a key');
  } else if (typeof shapedAnimation.key !== 'string') {
    shapedAnimation.key = String(shapedAnimation.key);
  }

  if (!shapedAnimation.hasOwnProperty('name')) {
    shapedAnimation.name = '';
  } else if (typeof shapedAnimation.name !== 'string') {
    shapedAnimation.name = String(shapedAnimation.name);
  }

  if (!shapedAnimation.hasOwnProperty('sourceUrl')) {
    shapedAnimation.sourceUrl = undefined;
  }

  if (!shapedAnimation.hasOwnProperty('sourceSize')) {
    shapedAnimation.sourceSize = {x: 1, y: 1};
  }

  if (!shapedAnimation.hasOwnProperty('frameSize')) {
    shapedAnimation.frameSize = {x: 1, y: 1};
  }

  if (!shapedAnimation.hasOwnProperty('frameCount')) {
    shapedAnimation.frameCount = 1;
  }

  if (!shapedAnimation.hasOwnProperty('frameRate')) {
    shapedAnimation.frameRate = 15;
  }

  if (!shapedAnimation.hasOwnProperty('size')) {
    shapedAnimation.size = 0;
  }

  if (!shapedAnimation.hasOwnProperty('version')) {
    shapedAnimation.version = undefined;
  }

  return shapedAnimation;
}

/**
 * React validation shape for animation metadata, appropriate to pass to
 * React.PropTypes.shape.
 *
 * @example
 *   propTypes: {
 *    animation: React.PropTypes.shape(METADATA_SHAPE).isRequired
 *   }
 */
export const METADATA_SHAPE = {
  key: React.PropTypes.string,
  name: React.PropTypes.string.isRequired,
  sourceUrl: React.PropTypes.string.isRequired,
  sourceSize: React.PropTypes.shape(VECTOR2_SHAPE).isRequired,
  frameSize: React.PropTypes.shape(VECTOR2_SHAPE).isRequired,
  frameCount: React.PropTypes.number.isRequired,
  frameRate: React.PropTypes.number.isRequired
};

/**
 * Given animation metadata, generate a 'name (frameCount)' label for the picker.
 * @param {AnimationMetadata} animation
 * @returns {string}
 */
export function getLabel(animation) {
  return `${animation.name} (${animation.frameCount})`;
}

export function getSourceUrl(animation) {
  if (animation.sourceUrl) {
    return animation.sourceUrl;
  }
  return sourceUrlFromKey(animation.key);
}

export function sourceUrlFromKey(key) {
  return animationsApi.basePath(key + '.png');
}
