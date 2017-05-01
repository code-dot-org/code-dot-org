/* global $ */
/* eslint-disable no-unused-vars */

function adjustScroll(destination) {
  $('html, body').animate({
    scrollTop: $("#" + destination).offset().top
  }, 1000);
}
