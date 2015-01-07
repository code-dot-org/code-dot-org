var appMain = require('../appMain');
var Artist = require('./turtle');
var blocks = require('./blocks');
var skins = require('./skins');
var levels = require('./levels');

window.turtleMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  var artist = new Artist();
  // TODO - do we need to depend on StudioApp being global here?
  artist.injectStudioApp(StudioApp);
  appMain(artist, levels, options);
};
