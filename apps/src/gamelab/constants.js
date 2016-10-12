/** @file Game Lab constants */
var utils = require('../utils');

/** @enum {string} */
module.exports.GameLabInterfaceMode = utils.makeEnum(
  'CODE',
  'ANIMATION'
);

/** @const {number} */
module.exports.GAME_WIDTH = 400;

/** @const {number} */
module.exports.GAME_HEIGHT = 400;

/**
 * DataURL for a 1x1 transparent gif image.
 * @const {string}
 */
module.exports.EMPTY_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

module.exports.PlayBehavior = utils.makeEnum(
  'ALWAYS_PLAY',
  'NEVER_PLAY'
);

module.exports.AnimationCategories = [
	'category_animals',
	'category_generic_items'
];

module.exports.AnimationCategoryNames = {
	'category_animals': 'Animals',
	'category_generic_items': 'Generic items'
};
