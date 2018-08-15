import appMain from "@cdo/apps/appMain";
import Applab from "@cdo/apps/applab/applab";
window.Applab = Applab;
if (typeof global !== "undefined") {
  global.Applab = window.Applab;
}
import levels from "@cdo/apps/applab/levels";
import * as skins from "@cdo/apps/applab/skins";

export default function loadApplab(options) {
  options.skinsModule = skins;
  options.blocksModule = {};
  appMain(Applab, levels, options);
}
