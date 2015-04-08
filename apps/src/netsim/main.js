window.netsimMain = function(options) {
  options.skinsModule = require('./skins');
  options.isEditorless = true;

  var NetSim = require('./netsim');
  var netSim = new NetSim();
  netSim.injectStudioApp(require('../StudioApp').singleton);
  require('../appMain')(netSim, require('./levels'), options);
};
