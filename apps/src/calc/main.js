window.calcMain = function(options) {
  options.skinsModule = require('../skins');
  options.blocksModule = require('./blocks');
  require('../appMain')(require('./calc'), require('./levels'), options);
};
