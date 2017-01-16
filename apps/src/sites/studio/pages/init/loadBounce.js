import appMain from "@cdo/apps/appMain";
import Bounce from "@cdo/apps/bounce/bounce";
window.Bounce = Bounce;
if (typeof global !== "undefined") {
  global.Bounce = window.Bounce;
}
import blocks from "@cdo/apps/bounce/blocks";
import levels from "@cdo/apps/bounce/levels";
import skins from "@cdo/apps/bounce/skins";

export default function loadBounce(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(Bounce, levels, options);
}
