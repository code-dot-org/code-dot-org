var appMain = require("../../../appMain");
window.Calc = require('../../../calc/calc');
var blocks = require("../../../calc/blocks");
var skins = require("../../../skins");
var levels = require("../../../calc/levels");

window.calcMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Calc, levels, options);
};
