/** @file P5 Lab constants */
var utils = require('@cdo/apps/utils');

/** @enum {string} */
module.exports.P5LabInterfaceMode = utils.makeEnum('CODE', 'ANIMATION');

/** @const {number} */
module.exports.APP_WIDTH = 400;

/** @const {number} */
module.exports.APP_HEIGHT = 400;

/**
 * DataURL for a 1x1 transparent gif image.
 * @const {string}
 */
module.exports.EMPTY_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

module.exports.PlayBehavior = utils.makeEnum('ALWAYS_PLAY', 'NEVER_PLAY');
