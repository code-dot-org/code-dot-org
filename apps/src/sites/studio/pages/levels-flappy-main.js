var appMain = require("../../../appMain");
window.Flappy = require('../../../flappy/flappy');
if (typeof global !== 'undefined') {
  global.Flappy = window.Flappy;
}
var blocks = require("../../../flappy/blocks");
var levels = require("../../../flappy/levels");
var skins = require("../../../flappy/skins");

window.flappyMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Flappy, levels, options);
};
