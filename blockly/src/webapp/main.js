var appMain = require('../appMain');
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
