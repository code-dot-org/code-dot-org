import $ from 'jquery';
import trackEvent from '../util/trackEvent';

export const initHamburger = function () {
  $(function () {

    $('#hamburger-icon').click(function (e) {
      $(this).toggleClass( 'active' );
      $('#hamburger ul').slideToggle();
      e.preventDefault();
    });

    $(document).on('click',function (e) {
      var hamburger = $('#hamburger');

      // If we didn't click the hamburger itself, and also nothing inside it,
      // then hide it.
      if (!hamburger.is(e.target)
          && hamburger.has(e.target).length === 0) {
        hamburger.children('ul').slideUp();
        $('#hamburger-icon').removeClass('active');
      }
    });

    $('#about-more').click(function (e) {
      $('#hamburger ul .about-nav').slideToggle();
      $('#about-down').toggle();
      $('#about-up').toggle();
      e.preventDefault();
    });

    $('#educate-more').click(function (e) {
      $('#hamburger ul .educate-nav').slideToggle();
      $('#educate-down').toggle();
      $('#educate-up').toggle();
      e.preventDefault();
    });

    $.ajax({
      type: "GET",
      url: '/dashboardapi/user_menu',
      success: function (data) {
        $('#sign_in_or_user').html(data);
      }
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
