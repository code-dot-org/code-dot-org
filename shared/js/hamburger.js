$(function () {

  $('#nav-hamburger').click(function (e){
    $('#nav ul').slideToggle();
    e.preventDefault();
  });

  $(document).on('click',function (e) {
    var nav = $('#nav');
    if (!nav.is(e.target)
        && nav.has(e.target).length === 0){
      nav.children('ul').hide();
      $('#nav-hamburger').removeClass('active');
    }
  });

  $('#about-more').click(function (e){
    $('#nav ul .about-nav').slideToggle();
    $('#about-down').toggle();
    $('#about-up').toggle();
    e.preventDefault();
  });

  $('#educate-more').click(function (e){
    $('#nav ul .educate-nav').slideToggle();
    $('#educate-down').toggle();
    $('#educate-up').toggle();
    e.preventDefault();
  });

  document.querySelector( '#nav-hamburger' )
    .addEventListener( 'click', function () {
    this.classList.toggle( 'active' );
  });

});
