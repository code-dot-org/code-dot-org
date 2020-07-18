import $ from 'jquery';

$(document).ready(function() {
  $('#dismiss-thank-donors').click(function() {
    $('#thank-donors-modal').modal('hide');
  });
});

function setCookie(key, value) {
  var expires = new Date();
  // Kill thank donors cookie at midnight every night
  // so the thank donors interstitial pops up once a day.
  expires.setHours(23, 59, 59, 0);
  document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}

$(document).ready(function() {
  var already_shown = !!getCookie('hide_thank_donors');
  if (!already_shown && screen.width > 720) {
    $('#thank-donors-modal').modal('show');
    setCookie('hide_thank_donors', '1');
  }
});
