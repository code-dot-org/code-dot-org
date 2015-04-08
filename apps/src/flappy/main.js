window.flappyMain = function(options) {
  options.skinsModule = require('./skins');
  options.blocksModule = require('./blocks');
  require('../appMain')(require('./flappy'), require('./levels'), options);
};
