window.evalMain = function(options) {
  options.skinsModule = require('../skins');
  options.blocksModule = require('./blocks');
  require('../appMain')(require('./eval'), require('./levels'), options);
};
