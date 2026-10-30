// Disabling import order in order to maintain window setting order
// This might be safe to remove but needs investigation whether any behavior is changed by order.
/* eslint-disable import/order */
import appMain from '@cdo/apps/appMain';
import Jigsaw from '@cdo/apps/jigsaw/jigsaw';
window.Jigsaw = Jigsaw;
if (typeof global !== 'undefined') {
  global.Jigsaw = window.Jigsaw;
}
import blocks from '@cdo/apps/jigsaw/blocks';
import levels from '@cdo/apps/jigsaw/levels';
import skins from '@cdo/apps/jigsaw/skins';
/* eslint-enable import/order */

export default function loadJigsaw(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(Jigsaw, levels, options);
}
