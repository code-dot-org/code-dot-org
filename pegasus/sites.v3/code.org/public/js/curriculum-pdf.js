(function ($, window) {
  // Pre-open all `details` tags in phantomjs browser
  $(window).load(function() {
    $('details').attr('open', 'open');
  });
}(jQuery, window));
