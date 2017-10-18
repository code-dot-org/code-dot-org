import skinsBase from '../../skins';

exports.load = function (assetUrl, id) {
  const skin = skinsBase.load(assetUrl, id);
  return skin;
};
