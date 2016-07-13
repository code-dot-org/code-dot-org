var appMain = require('../appMain');
var studioApp = require('../StudioApp').singleton;
var WebLab = require('./WebLab');
// var blocks = require('./blocks');
var skins = require('../skins');
// var levels = require('./levels');

window.weblabMain = function (options) {
  options.skinsModule = skins;
  options.isEditorless = true;
  // options.blocksModule = blocks;
  var weblab = new WebLab();

  // Bind helper that provides project metadata for gamelab autosave
  // options.getAnimationMetadata = gamelab.getAnimationMetadata.bind(gamelab);

  weblab.injectStudioApp(studioApp);
  appMain(weblab, null /* levels */, options);
};
