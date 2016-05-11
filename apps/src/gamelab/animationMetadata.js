/** @file Helper methods for working with animation metadata */

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
  sourceWidth: React.PropTypes.number.isRequired,
  sourceHeight: React.PropTypes.number.isRequired,
  frameWidth: React.PropTypes.number.isRequired,
  frameHeight: React.PropTypes.number.isRequired,
  frameCount: React.PropTypes.number.isRequired,
  frameRate: React.PropTypes.number.isRequired
};
