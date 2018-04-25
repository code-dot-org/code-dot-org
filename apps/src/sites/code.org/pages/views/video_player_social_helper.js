import $ from 'jquery';
import testImageAccess from '@cdo/apps/code-studio/url_test';

$(document).ready(function () {
  // Hide the buttons first.  We don't start them hidden in the HAML because
  // the share_buttons view is used on more pages than we include this code.
  $(".share-button-facebook-link, .share-button-twitter-link").hide();

  testImageAccess(
    'https://facebook.com/favicon.ico' + "?" + Math.random(),
    () => $(".share-button-facebook-link").show()
  );
  testImageAccess(
    'https://twitter.com/favicon.ico' + "?" + Math.random(),
    () => $(".share-button-twitter-link").show()
  );
});
