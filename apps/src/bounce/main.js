window.bounceMain = function(options) {
  options.skinsModule = require('./skins');
  options.blocksModule = require('./blocks');
  require('../appMain')(require('./bounce'), require('./levels'), options);
};
