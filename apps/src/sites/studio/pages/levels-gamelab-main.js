var appMain = require("../../../appMain");
var studioApp = require('../../../StudioApp').singleton;
var GameLab = require("../../../gamelab/GameLab");
var skins = require("../../../gamelab/skins");
var levels = require("../../../gamelab/levels");

window.gamelabMain = function (options) {
  options.skinsModule = skins;
  var gamelab = new GameLab();

  // Bind helper that provides project metadata for gamelab autosave
  options.getAnimationList = gamelab.getSerializedAnimationList.bind(gamelab);

  gamelab.injectStudioApp(studioApp);
  appMain(gamelab, levels, options);
};
