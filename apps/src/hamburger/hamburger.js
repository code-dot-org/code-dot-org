import $ from 'jquery';

export const initHamburger = function () {
  $(function () {

    $('#hamburger-icon').click(function (e){
      $(this).toggleClass( 'active' );
      $('#hamburger ul').slideToggle();
      e.preventDefault();
    });

    $(document).on('click',function (e) {
      var nav = $('#hamburger');
      if (!nav.is(e.target)
          && nav.has(e.target).length === 0) {
        nav.children('ul').hide();
        $('#hamburger-icon').removeClass('active');
      }
    });

    $('#about-more').click(function (e){
      $('#hamburger ul .about-nav').slideToggle();
      $('#about-down').toggle();
      $('#about-up').toggle();
      e.preventDefault();
    });

    $('#educate-more').click(function (e){
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

  });
};
