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
import hashEmail from '@cdo/apps/code-studio/hashEmail';
import GDPRDialog from '@cdo/apps/templates/GDPRDialog';
import getScriptData from '@cdo/apps/util/getScriptData';

const store = getStore();
store.dispatch(setRtlFromDOM());

// Shim window.console to be safe in IE
require('@cdo/apps/code-studio/consoleShim')(window);

var Sounds = require('@cdo/apps/Sounds');
var activateReferenceAreaOnLoad = require('@cdo/apps/code-studio/reference_area');
import {checkForUnsupportedBrowsersOnLoad} from '@cdo/apps/util/unsupportedBrowserWarning';
import {initHamburger} from '@cdo/apps/hamburger/hamburger.js';

window.React = require('react');
window.ReactDOM = require('react-dom');
window.Radium = require('radium');

// Prevent callstack exceptions when opening multiple dialogs
// http://stackoverflow.com/a/15856139/2506748
if ($.fn.modal) {
  $.fn.modal.Constructor.prototype.enforceFocus = function() {};
}

window.dashboard = window.dashboard || {};
window.dashboard.clientState = require('@cdo/apps/code-studio/clientState');
window.dashboard.createCallouts = require('@cdo/apps/code-studio/callouts').default;
window.dashboard.hashEmail = hashEmail;
window.dashboard.levelCompletions = require('@cdo/apps/code-studio/levelCompletions');
window.dashboard.popupWindow = require('@cdo/apps/code-studio/popup-window');
window.dashboard.reporting = require('@cdo/apps/code-studio/reporting');
window.dashboard.header = require('@cdo/apps/code-studio/header');
window.dashboard.videos = require('@cdo/apps/code-studio/videos');
window.dashboard.assets = require('@cdo/apps/code-studio/assets');
window.dashboard.pairing = require('@cdo/apps/code-studio/pairing');
window.dashboard.project = require('@cdo/apps/code-studio/initApp/project');

// only stick the necessary methods onto dashboard.codeStudioLevels
import {
  registerGetResult,
  registerLevel,
  onAnswerChanged
} from '@cdo/apps/code-studio/levels/codeStudioLevels';
window.dashboard.codeStudioLevels = {
  registerGetResult,
  registerLevel,
  onAnswerChanged
};

// usages: _dialogHelper.js, frequency.js, text-compression.js, levelGroup.js, multi.js
// arguably each of the above files belongs in code-studio
window.Dialog = require('@cdo/apps/code-studio/LegacyDialog');

// When we were in browserify world, all modules in a bundle (i.e. code-studio-common)
// would get preloaded. In webpack, they're only loaded as needed. We were
// depending on these two modules being loaded when code-studio-common was
// included, so force that load here.
window.FreeResponse = require('@cdo/apps/code-studio/levels/freeResponse');
window.Multi = require('@cdo/apps/code-studio/levels/multi');
window.TextMatch = require('@cdo/apps/code-studio/levels/textMatch');

// Wrap existing window onerror caller with a script error check.  If we have a
// script error and a url, throw that so that we have the info in New Relic.
var windowOnError = window.onerror;

window.onerror = function(msg, url, ln) {
  if (/^Script error/.test(msg) && url) {
    arguments[0] = 'Script Error: ' + url;
  }
  if (windowOnError) {
    return windowOnError.apply(this, arguments);
  }
};

// Prevent escape from canceling page loads.
var KEY_ESCAPE = 27;
$(document).keydown(function(e) {
  if (e.keyCode === KEY_ESCAPE) {
    e.stopPropagation();
    e.preventDefault();
  }
});

setTimeout(function() {
  $('#codeApp .slow_load').show();
}, 10000);

$(document).ready(function() {
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
checkForUnsupportedBrowsersOnLoad();
initHamburger();
initSigninState(userType);
initResponsive();
