window.mazeMain = function(options) {
  options.skinsModule = require('./skins');
  options.blocksModule = require('./blocks');
  require('../appMain')(require('./maze'), require('./levels'), options);
};
