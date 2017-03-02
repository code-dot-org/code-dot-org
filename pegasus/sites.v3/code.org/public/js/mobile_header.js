$(function () {

  $('#nav-hamburger').click(function (e){
    $('#nav ul').slideToggle();
  });

  $('#about-more').click(function (e){
    $('#nav ul span').slideToggle();
    e.preventDefault();
  });

  $(document).click(function (e) {
    if (!$(e.target).closest('#nav').length) {
      $('#nav ul').addClass('hide-responsive-menu');
    }
  });

  document.querySelector( "#nav-hamburger" )
    .addEventListener( "click", function () {
    this.classList.toggle( "active" );
  });
});
