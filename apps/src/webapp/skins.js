/**
 * Load Skin for Webapp.
 */

var skinsBase = require('../skins');

var CONFIGS = {
  webapp: {
  }
};

exports.load = function(assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  return skin;
};
