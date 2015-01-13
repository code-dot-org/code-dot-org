var appMain = require('../appMain');
// TODO (br-pair): We're doing this so that other apps can still have
// in the global namespace, while ensuring that we don't. Ultimately nobody
// should have it, and we can remove this.
window.StudioApp = undefined;
window.Bounce = require('./bounce');
if (typeof global !== 'undefined') {
  global.Bounce = window.Bounce;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.bounceMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Bounce, levels, options);
};
