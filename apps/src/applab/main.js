import appMain from '../appMain';
window.Applab = require('./applab');
if (typeof global !== 'undefined') {
  global.Applab = window.Applab;
}
import levels from './levels';
import * as skins from './skins';

window.applabMain = function (options) {
  options.skinsModule = skins;
  appMain(window.Applab, levels, options);
};
