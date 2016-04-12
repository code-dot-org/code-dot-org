/**
 * Load Skin for Applab.
 */

var skinsBase = require('../skins');

var CONFIGS = {
  applab: {
  }
};

exports.load = function (assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  return skin;
};
