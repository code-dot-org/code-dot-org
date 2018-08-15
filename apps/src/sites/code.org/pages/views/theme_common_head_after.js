import 'details-element-polyfill';
import 'lazysizes';
import 'lazysizes/plugins/unveilhooks/ls.unveilhooks';
import {isUnsupportedBrowser} from '@cdo/apps/util/browser-detector';
import {initHamburger} from '@cdo/apps/hamburger/hamburger';
import {loadVideos} from '@cdo/apps/util/loadVideos';
import testImageAccess from '@cdo/apps/code-studio/url_test';

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

$(window).load(function () {
  if (document.getElementsByClassName('insert_video_player').length > 0) {
    loadVideos(window.location.search.indexOf("force_youtube_fallback") !== -1);
  }

  // This code works for both the congrats_share and the more general
  // share_buttons partials.  (Only the former features a share-button-container.)
  $(document).ready(function () {
    testImageAccess(
      'https://facebook.com/favicon.ico' + "?" + Math.random(),
      () => {
        $(".share-button-facebook-link").show();
        $(".share-button-container").show();
      }
    );
    testImageAccess(
      'https://twitter.com/favicon.ico' + "?" + Math.random(),
      () => {
        $(".share-button-twitter-link").show();
        $(".share-button-container").show();
      }
    );
  });
});

