var appMain = require('../appMain');
window.Voxel = require('./voxel');
var blocks = require('./blocks');
var skins = require('../skins');
var levels = require('./levels');

window.voxelMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Voxel, levels, options);
};
