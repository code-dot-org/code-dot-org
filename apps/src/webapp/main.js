var appMain = require('../appMain');
// TODO (br-pair): We're doing this so that other apps can still have
// in the global namespace, while ensuring that we don't. Ultimately nobody
// should have it, and we can remove this.
window.StudioApp = undefined;
window.Webapp = require('./webapp');
if (typeof global !== 'undefined') {
  global.Webapp = window.Webapp;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.webappMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Webapp, levels, options);
};
