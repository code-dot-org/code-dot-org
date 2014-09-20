/**
 * Attaches the debugging behavior.
 */
(function($) {
  Drupal.behaviors.alphaDebug = {
    attach: function (context) {
      $('body', context).once('alpha-debug', function () {
        $('.alpha-grid-toggle').click(function() {
          $('body').toggleClass('alpha-grid-debug');
          return false;
        });
        $('.alpha-block-toggle').click(function() {
          $('body').toggleClass('alpha-region-debug');
          return false;
        });
      });
    }
  };
})(jQuery);
