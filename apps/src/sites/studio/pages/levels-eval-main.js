import appMain from "@cdo/apps/appMain";
import Eval from '@cdo/apps/eval/eval';
window.Eval = Eval;
import blocks from "@cdo/apps/eval/blocks";
import skins from "@cdo/apps/skins";
import levels from "@cdo/apps/eval/levels";

window.evalMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Eval, levels, options);
};
