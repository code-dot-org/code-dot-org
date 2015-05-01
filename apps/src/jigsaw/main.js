window.jigsawMain = function(options) {
  options.skinsModule = require('./skins');
  options.blocksModule = require('./blocks');
  require('../appMain')(require('./jigsaw'), require('./levels'), options);
};
