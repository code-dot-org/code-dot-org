var appMain = require('../appMain');
var studioAppSingleton = require('../base');
var Artist = require('./turtle');
var blocks = require('./blocks');
var skins = require('./skins');
var levels = require('./levels');

window.turtleMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  var artist = new Artist();
  artist.injectStudioApp(studioAppSingleton);
  appMain(artist, levels, options);
};
