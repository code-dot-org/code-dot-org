var appMain = require("../../../appMain");
window.Studio = require('../../../studio/studio');
if (typeof global !== 'undefined') {
  global.Studio = window.Studio;
}
var blocks = require("../../../studio/blocks");
var levels = require("../../../studio/levels");
var skins = require("../../../studio/skins");

window.studioMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Studio, levels, options);
};
