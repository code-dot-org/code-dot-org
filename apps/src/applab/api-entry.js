// entry point for api that gets exposed.

window.$ = require('jquery');
import '@cdo/apps/sites/studio/pages/code-studio';
// third party dependencies that are provided as globals in code-studio but
// which need to be explicitly required here.
window.React = require('react');
window.Applab = require('./applab');
import {injectErrorHandler} from '../lib/util/javascriptMode';
import JavaScriptModeErrorHandler from '../JavaScriptModeErrorHandler';
import appStorage from './appStorage';
import Sounds from '../Sounds';
import {singleton as studioApp} from '../StudioApp';
import loadApplab from '@cdo/apps/sites/studio/pages/init/loadApplab';
import {getAppOptions, setAppOptions, setupApp} from '@cdo/apps/code-studio/initApp/loadApp';
import {getStore} from '@cdo/apps/redux';
import {setIsRunning} from '@cdo/apps/redux/runState';
import {getExportedGlobals} from './export';
window.CDOSounds = Sounds.getSingleton();

const noop = function () {};

// TODO: remove the below monkey patches.
window.Applab.JSInterpreter = {
  getNearestUserCodeLine: function () {return 0;},
  deinitialize: noop
};
studioApp().highlight = noop;
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
// not overwrite... unless they are in a whitelist of browser
// apis that we really *do* want to override, because our version
// has nothing to do with them...
const globalApi = getExportedGlobals();
const whitelist = {moveTo: true};
for (let key in globalApi) {
  if (!window[key] || whitelist[key]) {
    window[key] = globalApi[key];
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
