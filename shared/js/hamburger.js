$(function () {

/*  var mainHeaderAreaAvailable;

  if (typeof appOptions !== 'undefined') {
    console.log(appOptions);
    mainHeaderAreaAvailable = false;
  } else {
    console.log('no appOptions');
    mainHeaderAreaAvailable = true;
  }

  if (!mainHeaderAreaAvailable) {
    // we are going to force the show-always options to show.
    // and we are going to disable the show-mobile options because they will be duplicates.
    //$(".show-always").show();
    //$(".show-mobile").hide();

    $('.show-mobile').removeClass('show-mobile').addClass('show-always');

  } else {
    $('.headerlinks').animate({opacity: 1});
  } */

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

  var hamburger = document.querySelector( '#nav-hamburger' );

  if (hamburger) {
    hamburger.addEventListener( 'click', function () {
      this.classList.toggle( 'active' );
    });
  }

});
