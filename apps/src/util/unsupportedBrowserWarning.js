/* global appOptions */
import {isUnsupportedBrowser, isIE11, isMobileDevice, isStorageAvailable} from '@cdo/apps/util/browser-detector';

export var checkForUnsupportedBrowsersOnLoad = function () {
  $(document).ready(function () {
    var textDivId = null;
    var dismissable = false;

    if (isUnsupportedBrowser()) {
      textDivId = '#unsupported-browser';
    } else if (typeof appOptions !== 'undefined') {
      if (isMobileDevice()) {
        if (appOptions.app === 'applab') {
          textDivId = '#applab-unsupported-tablet';
        } else if (appOptions.app === 'gamelab') {
          textDivId = '#gamelab-unsupported-tablet';
        }
        dismissable = true;
      } else if (isIE11() && appOptions.app === 'weblab') {
        textDivId = '#weblab-unsupported-browser';
        dismissable = true;
      } else if (appOptions.app === 'weblab' && !isStorageAvailable('localStorage')) {
        textDivId = '#weblab-unsupported-local-storage';
        dismissable = true;
      }
    }

    if (textDivId) {
      $(textDivId).show();
      if (dismissable) {
        $("#dismiss-icon").show();
      } else {
        $("#warning-icon").show();
      }
      $("#warning-banner").show();
    }
  });
};
