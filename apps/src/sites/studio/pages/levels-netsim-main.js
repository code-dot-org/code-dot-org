import appMain from "@cdo/apps/appMain";
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import NetSim from "@cdo/apps/netsim/netsim";
import levels from "@cdo/apps/netsim/levels";
import skins from "@cdo/apps/netsim/skins";

window.netsimMain = function (options) {
  options.skinsModule = skins;
  options.isEditorless = true;

  var netSim = new NetSim();
  netSim.injectStudioApp(studioApp);
  appMain(netSim, levels, options);
};
