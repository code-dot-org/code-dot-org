// Disabling import order in order to maintain window setting order
// This might be safe to remove but needs investigation whether any behavior is changed by order.
/* eslint-disable import/order */
import appMain from '@cdo/apps/appMain';
import Flappy from '@cdo/apps/flappy/flappy';
window.Flappy = Flappy;
if (typeof global !== 'undefined') {
  global.Flappy = window.Flappy;
}
import blocks from '@cdo/apps/flappy/blocks';
import levels from '@cdo/apps/flappy/levels';
import skins from '@cdo/apps/flappy/skins';
/* eslint-enable import/order */

export default function loadFlappy(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Flappy, levels, options);
}
