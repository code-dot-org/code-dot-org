import $ from 'jquery';

export const initHamburger = function () {
  $(function () {

    $('#hamburger-icon').click(function (e){
      $(this).toggleClass( 'active' );
      $('#hamburger #hamburger-contents').slideToggle();
      e.preventDefault();
    });

    $(document).on('click',function (e) {
      var nav = $('#hamburger');
      if (!nav.is(e.target)
          && nav.has(e.target).length === 0) {
        nav.children('#hamburger-contents').hide();
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

    $.ajax({
      type: "GET",
      url: '/dashboardapi/user_menu',
      success: function (data) {
        $('#sign_in_or_user').html(data);
      }
    });

  });
};
