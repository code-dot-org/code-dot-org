$(function () {

  $('#footer-toggle').click(function (e){
    $('#footer-links ul').slideToggle();
  });

  document.querySelector( "#footer-toggle" )
    .addEventListener( "click", function () {
    this.classList.toggle( "active" );
  });
});
