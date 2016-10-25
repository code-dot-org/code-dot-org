var appMain = require("../../../appMain");
window.Bounce = require('../../../bounce/bounce');
if (typeof global !== 'undefined') {
  global.Bounce = window.Bounce;
}
var blocks = require("../../../bounce/blocks");
var levels = require("../../../bounce/levels");
var skins = require("../../../bounce/skins");

window.bounceMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Bounce, levels, options);
};
