var skinsBase = require('../../skins');

exports.load = function (assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  return skin;
};
