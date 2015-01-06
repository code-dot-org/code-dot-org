var appMain = require('../appMain');
var turtle = require('./turtle');
var blocks = require('./blocks');
var skins = require('./skins');
var levels = require('./levels');

window.turtleMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(turtle, levels, options);
};
