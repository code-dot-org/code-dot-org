// entry point for api that gets exposed.

// third party dependencies that are provided as globals in code-studio but
// which need to be explicitly required here.
window.$ = require('jquery');

window.Applab = require('@cdo/apps/applab/applab');
import applabCommands from '@cdo/apps/applab/commands';
import * as api from '@cdo/apps/applab/api';
import appStorage from '@cdo/apps/applab/appStorage';
import Sounds from '@cdo/apps/Sounds';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
studioApp.cdoSounds = new Sounds();

// TODO: remove the below two monkey patches.
window.Applab.JSInterpreter = {getNearestUserCodeLine: function () {return 0;}};

window.Applab.callCmd = function (cmd) {
  var retVal = false;
  if (applabCommands[cmd.name] instanceof Function) {
    retVal = applabCommands[cmd.name](cmd.opts);
  }
  return retVal;
};

// Expose api functions globally
for (let key in api) {
  window[key] = api[key];
}

// disable appStorage
for (let key in appStorage) {
  appStorage[key] = function () {
    console.error("Data APIs are not available outside of code studio.");
  };
}
