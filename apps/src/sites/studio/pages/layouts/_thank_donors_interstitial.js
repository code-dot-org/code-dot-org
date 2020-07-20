import $ from 'jquery';

$(document).ready(function() {
  $('#dismiss-thank-donors').click(function() {
    $('#thank-donors-modal').modal('hide');
  });
});

function setCookie(key, value) {
  document.cookie = key + '=' + value;
}

function getCookie(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}

$(document).ready(function() {
  var already_shown = !!getCookie('hide_thank_donors');
  if (!already_shown && window.innerWidth > 720) {
    $('#thank-donors-modal').modal('show');
    setCookie('hide_thank_donors', '1');
  }
});
