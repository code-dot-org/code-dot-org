var appMain = require('../appMain');
var studioApp = require('../StudioApp').singleton;
var GameLab = require('./GameLab');
var blocks = require('./blocks');
var skins = require('./skins');
var levels = require('./levels');

window.gamelabMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  var gamelab = new GameLab();

  // Bind helper that provides project metadata for gamelab autosave
  options.getAnimationMetadata = gamelab.getAnimationMetadata.bind(gamelab);

  gamelab.injectStudioApp(studioApp);
  appMain(gamelab, levels, options);
};
