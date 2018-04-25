import $ from 'jquery';
import testImageAccess from '@cdo/apps/code-studio/url_test';

$(document).ready(function () {
  testImageAccess(
    'https://facebook.com/favicon.ico' + "?" + Math.random(),
    () => {
      $("#share-fb").css('display', 'inline-block');
      $("#congrats-share-buttons").show();
    }
  );
  testImageAccess(
    'https://twitter.com/favicon.ico' + "?" + Math.random(),
    () => {
      $("#share-twitter").css('display', 'inline-block');
      $("#congrats-share-buttons").show();
    }
  );
});
