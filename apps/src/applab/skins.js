/**
 * Load Skin for Applab.
 */

import skinsBase from '../skins';

var CONFIGS = {
  applab: {
  }
};

export function load(assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  return skin;
}
