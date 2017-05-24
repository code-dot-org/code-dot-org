import 'lazysizes';
import 'lazysizes/plugins/unveilhooks/ls.unveilhooks';
import {isUnsupportedBrowser} from '@cdo/apps/util/browser-detector';
import {initHamburger} from '@cdo/apps/hamburger/hamburger';
import {loadVideos} from '@cdo/apps/util/loadVideos';

// Prevent filtered errors from being passed to New Relic.
 if (window.newrelic) {
   window.newrelic.setErrorHandler(function (err) {
     // Remove errors from unsupportenewrelicnd IE versions
     return !!isUnsupportedBrowser();
   });
 }

$(document).ready(function () {
  if (isUnsupportedBrowser()) {
    $("#warning-banner").show();
  }
});

initHamburger();
window.loadVideos = loadVideos;
