var appMain = require('../appMain');
window.Minecraft = require('./minecraft');
var blocks = require('./blocks');
var skins = require('../skins');
var levels = require('./levels');

window.minecraftMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Minecraft, levels, options);
};
