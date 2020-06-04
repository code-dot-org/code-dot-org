/* global appOptions */
import {
  isUnsupportedBrowser,
  isIE11,
  isMobileDevice,
  isStorageAvailable
} from '@cdo/apps/util/browser-detector';
import $ from 'jquery';

export var checkForUnsupportedBrowsersOnLoad = function() {
  $(document).ready(function() {
    let textDivId = null;

    if (isUnsupportedBrowser()) {
      textDivId = '#unsupported-browser';
    } else if (typeof appOptions !== 'undefined') {
      if (isMobileDevice()) {
        if (appOptions.app === 'applab') {
          textDivId = '#applab-unsupported-tablet';
        } else if (appOptions.app === 'gamelab') {
          textDivId = '#gamelab-unsupported-tablet';
        }
      } else if (isIE11() && appOptions.app === 'fish') {
        textDivId = '#oceans-unsupported-browser';
      } else if (isIE11() && appOptions.app === 'weblab') {
        textDivId = '#weblab-unsupported-browser';
      } else if (
        appOptions.app === 'weblab' &&
        !isStorageAvailable('localStorage')
      ) {
        textDivId = '#weblab-unsupported-local-storage';
      }
    }

    if (textDivId) {
      $(textDivId).show();
      $('#warning-icon').show();
      $('#dismiss-icon').show();
      $('#warning-banner').show();
    }
  });
};
