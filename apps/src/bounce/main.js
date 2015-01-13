var appMain = require('../appMain');
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
