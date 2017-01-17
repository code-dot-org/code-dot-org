// entry point for api that gets exposed.

window.$ = require('jquery');
import '@cdo/apps/sites/studio/pages/code-studio';
// third party dependencies that are provided as globals in code-studio but
// which need to be explicitly required here.
window.React = require('react');
window.Applab = require('./applab');
import {injectErrorHandler} from '../javascriptMode';
import JavaScriptModeErrorHandler from '../JavaScriptModeErrorHandler';
import * as api from './api';
import appStorage from './appStorage';
import Sounds from '../Sounds';
import {singleton as studioApp} from '../StudioApp';
import loadApplab from '@cdo/apps/sites/studio/pages/init/loadApplab';
import {getAppOptions, setAppOptions, setupApp} from '@cdo/apps/code-studio/initApp/loadApp';
import {getStore} from '@cdo/apps/redux';
import {setIsRunning} from '@cdo/apps/redux/runState';
window.CDOSounds = new Sounds();

const noop = function () {};

// TODO: remove the below monkey patches.
window.Applab.JSInterpreter = {
  getNearestUserCodeLine: function () {return 0;},
  deinitialize: noop
};
studioApp.highlight = noop;
Applab.render = noop;

// window.APP_OPTIONS gets generated on the fly by the exporter and appended to this file.
setAppOptions(Object.assign(window.APP_OPTIONS, {isExported: true}));
setupApp(window.APP_OPTIONS);
loadApplab(getAppOptions());
// reset applab turtle manually (normally called when execution begins)
// before the student's code is run.
Applab.resetTurtle();
getStore().dispatch(setIsRunning(true));


// Expose api functions globally, unless they already exist
// in which case they are probably browser apis that we should
// not overwrite.
for (let key in api) {
  if (!window[key]) {
    window[key] = api[key];
  }
}

// disable appStorage
for (let key in appStorage) {
  appStorage[key] = function () {
    console.error("Data APIs are not available outside of code studio.");
  };
}

// Set up an error handler for student errors and warnings.
injectErrorHandler(new JavaScriptModeErrorHandler(
  () => Applab.JSInterpreter,
  Applab
));
