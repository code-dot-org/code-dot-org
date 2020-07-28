import $ from 'jquery';
import cookies from 'js-cookie';

$(document).ready(function() {
  var already_shown = !!cookies.get('has_seen_thank_donors');
  if (!already_shown && window.innerWidth > 720) {
    $('#thank-donors-modal').modal('show');
    cookies.set('has_seen_thank_donors', '1');
  }

  $('#dismiss-thank-donors').click(function() {
    $('#thank-donors-modal').modal('hide');
  });
});
