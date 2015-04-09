window.turtleMain = function(options) {
  options.skinsModule = require('./skins');
  options.blocksModule = require('./blocks');

  var ArtistClass = require('./turtle');
  var artist = new ArtistClass();
  artist.injectStudioApp(require('../StudioApp').singleton);
  var appMain = require('../appMain');
  window.__TestInterface.setSpeedSliderValue = function (value) {
    artist.speedSlider.setValue(value);
  };
  appMain(artist, require('./levels'), options);
};
