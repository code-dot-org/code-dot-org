/**
 * Load Skin for Applab.
 */

import skinsBase from '../skins';

export function load(assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  return skin;
}
