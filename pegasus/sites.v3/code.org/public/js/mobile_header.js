$(function () {
  $('#nav-hamburger').click(function (e){
    $('#nav ul').slideToggle();
    e.preventDefault();
  });

  $('#about-more').click(function (e){
    $('#nav ul span').slideToggle();
    e.preventDefault();
  });

  document.querySelector( '#nav-hamburger' )
    .addEventListener( 'click', function () {
    this.classList.toggle( 'active' );
  });
});
