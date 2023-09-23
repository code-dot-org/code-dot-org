import skinsBase from '../../skins';

function load(assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  return skin;
}

export default {
  load,
};
