/** @file Game Lab constants */
var utils = require('../utils');

/** @enum {string} */
module.exports.GameLabInterfaceMode = utils.makeEnum(
  'CODE',
  'ANIMATION'
);

module.exports.LocationPickerMode = utils.makeEnum(
  'IDLE',
  'SELECTING',
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

module.exports.AllAnimationsCategory = 'category_all';

module.exports.AnimationCategories = {
	'category_animals': 'Animals',
	'category_backgrounds': 'Backgrounds',
	'category_generic_items': 'Generic items',
	'category_vehicles': 'Vehicles',
	'category_characters': 'Characters',
	'category_environment': 'Environment',
	'category_food': 'Food',
	'category_tools': 'Tools',
	'category_gameplay': 'Board games',
	'category_music': 'Music',
	'category_obstacles': 'Obstacles',
	'category_all': 'All'
};
