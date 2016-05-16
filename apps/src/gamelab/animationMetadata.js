/** @file Helper methods for working with animation metadata */
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
 * @typedef {Object} AnimationMetadata
 * @property {string} key - Uniquely identifies animation within project,
 *           usually a UUID.
 * @property {string} name
 * @property {string} sourceUrl
 * @property {Vector2} sourceSize
 * @property {Vector2} frameSize
 * @property {number} frameCount
 * @property {number} frameRate
 */

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
