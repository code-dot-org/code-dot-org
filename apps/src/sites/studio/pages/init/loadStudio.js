import appMain from "@cdo/apps/appMain";
import Studio from '@cdo/apps/studio/studio';
window.Studio = Studio;
if (typeof global !== 'undefined') {
  global.Studio = window.Studio;
}
import blocks from "@cdo/apps/studio/blocks";
import levels from "@cdo/apps/studio/levels";
import skins from "@cdo/apps/studio/skins";

export default function loadStudio(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(Studio, levels, options);
}
