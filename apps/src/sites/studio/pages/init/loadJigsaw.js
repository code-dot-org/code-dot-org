import appMain from "@cdo/apps/appMain";
import Jigsaw from '@cdo/apps/jigsaw/jigsaw';
window.Jigsaw = Jigsaw;
if (typeof global !== 'undefined') {
  global.Jigsaw = window.Jigsaw;
}
import blocks from "@cdo/apps/jigsaw/blocks";
import levels from "@cdo/apps/jigsaw/levels";
import skins from "@cdo/apps/jigsaw/skins";

export default function loadJigsaw(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(Jigsaw, levels, options);
}
