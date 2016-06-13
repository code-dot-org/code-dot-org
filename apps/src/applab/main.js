var appMain = require('../appMain');
window.Applab = require('./applab');
if (typeof global !== 'undefined') {
  global.Applab = window.Applab;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.applabMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Applab, levels, options);
};

// TODO: don't do this global nonsense, at least not here.
require('../templates/StyleGuide');
