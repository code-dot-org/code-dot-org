var appMain = require('../appMain');
// TODO (br-pair): We're doing this so that other apps can still have StudioApp
// in the global namespace, while ensuring that we don't. Ultimately nobody
// should have it, and we can remove this.
window.StudioApp = undefined;
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
