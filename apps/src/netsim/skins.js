/* eslint-disable import/order */
var skinBase = require('../skins');

exports.load = function (assetUrl, id) {
  var skin = skinBase.load(assetUrl, id);
  return skin;
};
