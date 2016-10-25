var appMain = require("../../../appMain");
var studioApp = require('../../../StudioApp').singleton;
var Artist = require("../../../turtle/turtle");
var blocks = require("../../../turtle/blocks");
var skins = require("../../../turtle/skins");
var levels = require("../../../turtle/levels");

window.turtleMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  var artist = new Artist();

  window.__TestInterface.setSpeedSliderValue = function (value) {
    artist.speedSlider.setValue(value);
  };
  artist.injectStudioApp(studioApp);
  appMain(artist, levels, options);
};
