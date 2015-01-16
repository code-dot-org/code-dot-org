var appMain = require('../appMain');
window.Jigsaw = require('./jigsaw');
if (typeof global !== 'undefined') {
  global.Jigsaw = window.Jigsaw;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.jigsawMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Jigsaw, levels, options);
};
