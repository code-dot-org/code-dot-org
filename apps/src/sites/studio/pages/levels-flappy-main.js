import appMain from "@cdo/apps/appMain";
import Flappy from '@cdo/apps/flappy/flappy';
window.Flappy = Flappy;
if (typeof global !== 'undefined') {
  global.Flappy = window.Flappy;
}
import blocks from "@cdo/apps/flappy/blocks";
import levels from "@cdo/apps/flappy/levels";
import skins from "@cdo/apps/flappy/skins";

window.flappyMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Flappy, levels, options);
};
