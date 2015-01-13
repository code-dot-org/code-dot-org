var appMain = require('../appMain');
// TODO (br-pair): We're doing this so that other apps can still have
// in the global namespace, while ensuring that we don't. Ultimately nobody
// should have it, and we can remove this.
window.StudioApp = undefined;
window.Studio = require('./studio');
if (typeof global !== 'undefined') {
  global.Studio = window.Studio;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.studioMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Studio, levels, options);
};
