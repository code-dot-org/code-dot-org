(function ($) {

$(document).ready(function() {
  $('#region-header-second .webform-client-form').submit(function() {
    var nameVal = $('#webform-component-name input').val();
    var emailVal = $('#webform-component-email input').val();

    if (nameVal == 'Enter your name' || nameVal == '' || emailVal == 'Enter your email address' || emailVal == '') {
      $('#region-header-second .form-error').text('Name and email address are required');
      return false;
    }
  });

  $('#region-footer-extra-first .webform-client-form').submit(function() {
    var nameVal = $('#webform-component-name--footer input').val();
    var emailVal = $('#webform-component-email--footer input').val();

    if (nameVal == 'Enter your name' || nameVal == '' || emailVal == 'Enter your email address' || emailVal == '') {
      $('#region-footer-extra-first .form-error').text('Name and email address are required');
      return false;
    }
  });
});

}) (jQuery);
;
(function ($) {

$(document).ready(function() {
  $('a.window-popup').bind('click', function() {
    // Don't open a new window for Facebook on the mobile front page.
    if ($('body').hasClass('mobile-front') && $(this).hasClass('btn-facebook')) {
      return false;
    }

    var url = $(this).attr('href');
    var width = 580;
    var height = 400;
    var left = (screen.width/2)-(width/2);
    var top = (screen.height/2)-(height/2);

    shareVideo = window.open(url,'ShareVideo', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
    if (window.focus) { shareVideo.focus() }
    return false;
  });
});

}) (jQuery);
;
