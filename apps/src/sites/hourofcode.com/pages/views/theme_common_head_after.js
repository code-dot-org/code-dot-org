import {isUnsupportedBrowser} from '@cdo/apps/util/browser-detector';

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
