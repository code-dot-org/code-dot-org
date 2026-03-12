/* global $ */
/* eslint-disable no-unused-vars */

function adjustScroll(destination) {
  $("html, body").animate(
    {
      scrollTop: $("#" + destination).offset().top,
    },
    1000
  );
}

/**
 * A focus trap is a common accessibility feature that ensures that the keyboard focus remains
 * within a certain container (like a modal dialog), and does not move to other parts of the
 * page.
 *
 * @param {string} modalId The element ID of modal dialog container, e.g. * "#promotion-video-modal"
 * @return {function} Function meant to be run once the given modal is visible.
 */
function focusTrap(modalId) {
  return () => {
    var focusableEls = $(modalId).find('a[href], button, textarea, input:not([disabled]), select');
    var firstFocusableEl = focusableEls.first()[0];
    var lastFocusableEl = focusableEls.last()[0];
    var KEYCODE_TAB = 9;

    firstFocusableEl.focus();

    $(modalId).on('keydown', function(e) {
      var isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB);

      if (!isTabPressed) {
        return;
      }

      if (e.shiftKey) { // if shift key pressed for shift + tab combination
        if (document.activeElement === firstFocusableEl) {
          lastFocusableEl.focus();
          e.preventDefault();
        }
      } else { // if tab key is pressed
        if (document.activeElement === lastFocusableEl) { // if focused has reached to last item then focus first item after tab
          firstFocusableEl.focus();
          e.preventDefault();
        }
      }
    });
  }
}
