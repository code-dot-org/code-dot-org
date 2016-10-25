var appMain = require("../../../appMain");
window.Jigsaw = require('../../../jigsaw/jigsaw');
if (typeof global !== 'undefined') {
  global.Jigsaw = window.Jigsaw;
}
var blocks = require("../../../jigsaw/blocks");
var levels = require("../../../jigsaw/levels");
var skins = require("../../../jigsaw/skins");

window.jigsawMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Jigsaw, levels, options);
};
