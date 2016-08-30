/* globals dashboard  */
/**
 * JS used by _teacher.html.haml
 */
import $ from 'jquery';

function resizeScrollable() {
  var newHeight = $('.teacher-panel').innerHeight() -
      $('.teacher-panel h3').outerHeight() -
      15 - // magic..
      $('.non-scrollable-wrapper').outerHeight();
  $('.scrollable-wrapper').css('max-height', newHeight);
}

$(document).ready(() => {
  $(window).resize(dashboard.utils.debounce(resizeScrollable, 250));

  resizeScrollable();

  var submittedTimestamp = $('#submitted .timestamp');
  submittedTimestamp.text((new Date(submittedTimestamp.text())).toLocaleString());

  $('select#sections').change(function (ev) {
    window.location.href = ev.target.value;
  });

  $('#unsubmit').click(function (ev) {
    $.post($(ev.target).attr('data-user-level-url'), {
      "_method": 'PUT',
      user_level: {
        best_result: 1,
        submitted: false
      }
    }, function (data) {
      // Let's just refresh so that the dots are correct, etc.
      location.reload();
    });
  });
});
