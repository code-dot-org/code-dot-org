var appMain = require("../../../appMain");
var studioApp = require('../../../StudioApp').singleton;
var NetSim = require("../../../netsim/netsim");

var levels = require("../../../netsim/levels");
var skins = require("../../../netsim/skins");

window.netsimMain = function (options) {
  options.skinsModule = skins;
  options.isEditorless = true;

  var netSim = new NetSim();
  netSim.injectStudioApp(studioApp);
  appMain(netSim, levels, options);
};
