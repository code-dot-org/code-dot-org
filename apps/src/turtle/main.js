window.turtleMain = function(options) {
  options.skinsModule = require('./skins');
  options.blocksModule = require('./blocks');

  var ArtistClass = require('./turtle');
  var artist = new ArtistClass();
  window.__TestInterface.setSpeedSliderValue = function (value) {
    artist.speedSlider.setValue(value);
  };
  artist.injectStudioApp(require('../StudioApp').singleton);
  require('../appMain')(artist, require('./levels'), options);
};
