/**
 * @file Replacement for application.js.erb in dashboard as much as possible.
 *       Code added here will be loaded for (almost) every page in dashboard,
 *       so use sparingly!
 *
 * Note: This is included _after_ application.js.erb during our transition period,
 * so when moving things preserve the include order as much as possible.
 */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import {getStore} from '@cdo/apps/code-studio/redux';
import {setRtlFromDOM} from '@cdo/apps/code-studio/isRtlRedux';
import initSigninState from '@cdo/apps/code-studio/initSigninState';
import initResponsive from '@cdo/apps/code-studio/responsive';
import GDPRDialog from '@cdo/apps/templates/GDPRDialog';
import getScriptData from '@cdo/apps/util/getScriptData';
import Cookie from 'js-cookie';

import Sounds from '@cdo/apps/Sounds';
import activateReferenceAreaOnLoad from '@cdo/apps/code-studio/reference_area';
import {checkForUnsupportedBrowsersOnLoad} from '@cdo/apps/util/unsupportedBrowserWarning';
import {initHamburger} from '@cdo/apps/hamburger/hamburger.js';

import clientState from '@cdo/apps/code-studio/clientState';
import createCallouts from '@cdo/apps/code-studio/callouts';
import hashEmail from '@cdo/apps/code-studio/hashEmail';
import levelCompletions from '@cdo/apps/code-studio/levelCompletions';
import popupWindow from '@cdo/apps/code-studio/popup-window';
import reporting from '@cdo/apps/code-studio/reporting';
import header from '@cdo/apps/code-studio/header';
import videos from '@cdo/apps/code-studio/videos';
import assets from '@cdo/apps/code-studio/assets';
import pairing from '@cdo/apps/code-studio/pairing';
import project from '@cdo/apps/code-studio/initApp/project';

window.dashboard = window.dashboard || {};
window.dashboard.clientState = clientState;
window.dashboard.createCallouts = createCallouts;
window.dashboard.hashEmail = hashEmail;
window.dashboard.levelCompletions = levelCompletions;
window.dashboard.popupWindow = popupWindow;
window.dashboard.reporting = reporting;
window.dashboard.header = header;
window.dashboard.videos = videos;
window.dashboard.assets = assets;
window.dashboard.pairing = pairing;
window.dashboard.project = project;

// Shim window.console to be safe in IE
import consoleShim from '@cdo/apps/code-studio/consoleShim';
consoleShim(window);

window.React = React;
window.ReactDOM = ReactDOM;

const store = getStore();
store.dispatch(setRtlFromDOM());

// Prevent callstack exceptions when opening multiple dialogs
// http://stackoverflow.com/a/15856139/2506748
if ($.fn.modal) {
  $.fn.modal.Constructor.prototype.enforceFocus = function () {};
}

// only stick the necessary methods onto dashboard.codeStudioLevels
import {
  registerGetResult,
  registerLevel,
  onAnswerChanged,
} from '@cdo/apps/code-studio/levels/codeStudioLevels';
window.dashboard.codeStudioLevels = {
  registerGetResult,
  registerLevel,
  onAnswerChanged,
};

// usages: _dialogHelper.js, frequency.js, text-compression.js, levelGroup.js, multi.js
// arguably each of the above files belongs in code-studio
import Dialog from '@cdo/apps/code-studio/LegacyDialog';
window.Dialog = Dialog;

// When we were in browserify world, all modules in a bundle (i.e. code-studio-common)
// would get preloaded. In webpack, they're only loaded as needed. We were
// depending on these two modules being loaded when code-studio-common was
// included, so force that load here.
import FreeResponse from '@cdo/apps/code-studio/levels/freeResponse';
import Multi from '@cdo/apps/code-studio/levels/multi';
import TextMatch from '@cdo/apps/code-studio/levels/textMatch';
window.FreeResponse = FreeResponse;
window.Multi = Multi;
window.TextMatch = TextMatch;

// Wrap existing window onerror caller with a script error check.  If we have a
// script error and a url, throw that so that we have the info in New Relic.
var windowOnError = window.onerror;

window.onerror = function (msg, url, ln) {
  if (/^Script error/.test(msg) && url) {
    arguments[0] = 'Script Error: ' + url;
  }
  if (windowOnError) {
    return windowOnError.apply(this, arguments);
  }
};

// Prevent escape from canceling page loads.
var KEY_ESCAPE = 27;
$(document).keydown(function (e) {
  if (e.keyCode === KEY_ESCAPE) {
    e.stopPropagation();
    e.preventDefault();
  }
});

setTimeout(function () {
  $('#codeApp .slow_load').show();
}, 10000);

$(document).ready(function () {
  if (document.querySelector(`script[data-gdpr]`)) {
    const gdprData = getScriptData('gdpr');
    if (gdprData.show_gdpr_dialog && gdprData.current_user_id) {
      ReactDOM.render(
        <GDPRDialog
          isDialogOpen={gdprData.show_gdpr_dialog}
          currentUserId={gdprData.current_user_id}
        />,
        document.getElementById('gdpr-dialog')
      );
    }
  }
});

activateReferenceAreaOnLoad();

// CDOSounds is currently used in a few haml files so we need
// to put it on window :(
window.CDOSounds = Sounds.getSingleton();

const userType = document.querySelector(`script[data-usertype]`)
  ? getScriptData('usertype')
  : null;
const under13 = document.querySelector(`script[data-under13]`)
  ? getScriptData('under13')
  : null;
checkForUnsupportedBrowsersOnLoad();
initHamburger();
initSigninState(userType, under13);
initResponsive();

try {
  // Gate the Offline Pilot features using the offline_pilot experiment cookie.
  const offlinePilotCookie = Cookie.get('offline_pilot');
  const offlinePilot = offlinePilotCookie && JSON.parse(offlinePilotCookie);
  if (offlinePilot) {
    // Register the offline service worker.
    if ('serviceWorker' in navigator && window.OFFLINE_SERVICE_WORKER_PATH) {
      navigator.serviceWorker.register(window.OFFLINE_SERVICE_WORKER_PATH);
    }
  }
} catch (e) {
  console.error('Unable to setup the offline pilot experiment', e);
}
