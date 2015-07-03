/**
 * Loads the jQuery details polyfill for <details> elements after page load
 * Adds a class `no-details` to body when details is not supported.
 */

(function ($, window) {
  $(window).load(function () {
    $('html').addClass($.fn.details.support ? 'details' : 'no-details');
    $('details').details();
  });
})(jQuery, window);
