import appMain from "@cdo/apps/appMain";
import Maze from '@cdo/apps/maze/maze';
window.Maze = Maze;
if (typeof global !== 'undefined') {
  global.Maze = window.Maze;
}
import blocks from "@cdo/apps/maze/blocks";
import levels from "@cdo/apps/maze/levels";
import skins from "@cdo/apps/maze/skins";

window.mazeMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;

  appMain(window.Maze, levels, options);
};
