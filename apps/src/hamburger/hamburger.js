import $ from 'jquery';
import trackEvent from '../util/trackEvent';

export const initHamburger = function () {
  $(function () {

    $('#hamburger-icon').click(function (e) {
      $(this).toggleClass( 'active' );
      $('#hamburger #hamburger-contents').slideToggle();
      e.preventDefault();
    });

    $(document).on('click',function (e) {
      var hamburger = $('#hamburger');

      // If we didn't click the hamburger itself, and also nothing inside it,
      // then hide it.
      if (!hamburger.is(e.target)
          && hamburger.has(e.target).length === 0) {
        hamburger.children('#hamburger-contents').slideUp();
        $('#hamburger-icon').removeClass('active');
      }
    });

    $(".hamburger-expandable-item").each(function () {
      $(this).click(function (e) {
        $("#" + $(this).attr('id') + "-items").slideToggle();
        $(this).find(".arrow-down").toggle();
        $(this).find(".arrow-up").toggle();
        e.preventDefault();
      });
    });

    $("#hamburger #report-bug").click(function () {
      trackEvent("help_ui", "report-bug", "hamburger");
    });

    $("#hamburger #support").click(function () {
      trackEvent("help_ui", "support", "hamburger");
    });

    // This item is not in the hamburger, but actually in the studio footer.
    $(".footer #support").click(function () {
      trackEvent("help_ui", "support", "studio_footer");
    });

    // This item is not in the hamburger, but actually in the pegasus footers for
    // desktop and mobile.
    $("#pagefooter #support").each(function () {
      $(this).click(function () {
        trackEvent("help_ui", "support", "studio_footer");
      });
    });

  });
};
