/* global $ */
function adjustScroll(destination) {
  $('html, body').animate({
    scrollTop: $("#" + destination).offset().top
  }, 1000);
}
