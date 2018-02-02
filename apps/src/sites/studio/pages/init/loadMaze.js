import appMain from "@cdo/apps/appMain";
import Maze from '@cdo/apps/maze/maze';

const maze = new Maze();

window.Maze = maze;
if (typeof global !== 'undefined') {
  global.Maze = window.Maze;
}

import * as blocks from "@cdo/apps/maze/blocks";
import * as levels from "@cdo/apps/maze/levels";
import * as skins from "@cdo/apps/maze/skins";

export default function loadMaze(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;

  appMain(maze, levels, options);
}
