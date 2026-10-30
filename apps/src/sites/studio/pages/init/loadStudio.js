// Disabling import order in order to maintain window setting order
// This might be safe to remove but needs investigation whether any behavior is changed by order.
/* eslint-disable import/order */
import appMain from '@cdo/apps/appMain';
import Studio from '@cdo/apps/studio/studio';
window.Studio = Studio;
if (typeof global !== 'undefined') {
  global.Studio = window.Studio;
}
import blocks from '@cdo/apps/studio/blocks';
import levels from '@cdo/apps/studio/levels';
import skins from '@cdo/apps/studio/skins';
/* eslint-enable import/order */

export default function loadStudio(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(Studio, levels, options);
}
