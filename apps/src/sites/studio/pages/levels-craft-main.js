import appMain from "@cdo/apps/appMain";
import Craft from '@cdo/apps/craft/craft';
window.Craft = Craft;
if (typeof global !== 'undefined') {
  global.Craft = window.Craft;
}
import blocks from "@cdo/apps/craft/blocks";
import levels from "@cdo/apps/craft/levels";
import skins from "@cdo/apps/craft/skins";

window.craftMain = function (options) {
  options.skinsModule = skins;

  options.blocksModule = blocks;
  options.maxVisualizationWidth = 600;
  var appWidth = 434;
  var appHeight = 477;
  options.nativeVizWidth = appWidth;
  options.vizAspectRatio = appWidth / appHeight;

  appMain(window.Craft, levels, options);
};
