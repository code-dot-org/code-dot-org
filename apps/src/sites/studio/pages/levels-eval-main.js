var appMain = require("../../../appMain");
window.Eval = require('../../../eval/eval');
var blocks = require("../../../eval/blocks");
var skins = require("../../../skins");
var levels = require("../../../eval/levels");

window.evalMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Eval, levels, options);
};
