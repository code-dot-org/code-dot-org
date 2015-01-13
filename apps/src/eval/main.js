var appMain = require('../appMain');
// TODO (br-pair): We're doing this so that other apps can still have
// in the global namespace, while ensuring that we don't. Ultimately nobody
// should have it, and we can remove this.
window.StudioApp = undefined;
window.Eval = require('./eval');
var blocks = require('./blocks');
var skins = require('../skins');
var levels = require('./levels');

window.evalMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Eval, levels, options);
};
