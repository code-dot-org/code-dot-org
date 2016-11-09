import appMain from "@cdo/apps/appMain";
import Calc from '@cdo/apps/calc/calc';
window.Calc = Calc;
import blocks from "@cdo/apps/calc/blocks";
import skins from "@cdo/apps/skins";
import levels from "@cdo/apps/calc/levels";

export default function loadCalc(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Calc, levels, options);
}
