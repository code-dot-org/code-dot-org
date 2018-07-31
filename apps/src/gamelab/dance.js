/* Entry point for Dance Lab dependencies. */

import GIF from 'gif.js';
import getScriptData from '@cdo/apps/util/getScriptData';

window.createGifCapture = function () {
  return new GIF({workers: 4, workerScript: getScriptData('worker').href});
};
