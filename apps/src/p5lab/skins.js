var skinBase = require('@cdo/apps/skins');

exports.load = function(assetUrl, id) {
  var skin = skinBase.load(assetUrl, id);

  return skin;
};
