$(function () {

  $('#footer-toggle').click(function (e){
    $('#footer-links ul').slideToggle();
  });

  document.querySelector( '#footer-toggle' )
    .addEventListener( "click", function () {
    this.classList.toggle( 'active' );
  });

//Handles cases when user resizes the screen
  addEventListener('resize', function() {
    if (innerWidth >= 600) {
      $('#footer-links ul').show();
    }  else {
      $('#footer-links ul').hide();
    }
  });
});
