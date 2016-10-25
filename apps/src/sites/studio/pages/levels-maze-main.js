var appMain = require("../../../appMain");
window.Maze = require('../../../maze/maze');
if (typeof global !== 'undefined') {
  global.Maze = window.Maze;
}
var blocks = require("../../../maze/blocks");
var levels = require("../../../maze/levels");
var skins = require("../../../maze/skins");

window.mazeMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;

  appMain(window.Maze, levels, options);
};
