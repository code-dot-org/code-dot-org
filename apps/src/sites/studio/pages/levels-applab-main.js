import appMain from "../../../appMain";
window.Applab = require('../../../applab/applab');
if (typeof global !== 'undefined') {
  global.Applab = window.Applab;
}
import levels from "../../../applab/levels";
import * as skins from "../../../applab/skins";

window.applabMain = function (options) {
  options.skinsModule = skins;
  appMain(window.Applab, levels, options);
};
