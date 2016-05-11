/** @file Helper methods for working with animation metadata */

/**
 * React validation shape for an {x,y} pair.
 */
const VECTOR2_SHAPE = {
  x: React.PropTypes.number.isRequired,
  y: React.PropTypes.number.isRequired
};

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
  sourceUrl: React.PropTypes.string.isRequired,
  sourceSize: React.PropTypes.shape(VECTOR2_SHAPE).isRequired,
  frameSize: React.PropTypes.shape(VECTOR2_SHAPE).isRequired,
  frameCount: React.PropTypes.number.isRequired,
  frameRate: React.PropTypes.number.isRequired
};
