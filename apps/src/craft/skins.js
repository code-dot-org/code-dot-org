var skinsBase = require('../skins');

var CONFIGS = {
  craft: {
  }
};

exports.load = function (assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  return skin;
};
