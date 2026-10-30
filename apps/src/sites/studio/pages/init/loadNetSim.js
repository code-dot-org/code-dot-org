import appMain from '@cdo/apps/appMain';
import levels from '@cdo/apps/netsim/levels';
import NetSim from '@cdo/apps/netsim/netsim';
import skins from '@cdo/apps/netsim/skins';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

export default function loadNetSim(options) {
  options.skinsModule = skins;
  options.isEditorless = true;

  var netSim = new NetSim();
  netSim.injectStudioApp(studioApp());
  appMain(netSim, levels, options);
}
