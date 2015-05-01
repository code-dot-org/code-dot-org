window.studioMain = function(options) {
  options.skinsModule = require('./skins');
  options.blocksModule = require('./blocks');
  require('../appMain')(require('./studio'), require('./levels'), options);
};
