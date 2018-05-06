/* globals dashboard */
import Cookie from 'js-cookie';

const SHORT_NAME = '_shortName';

const script = document.querySelector('script[data-user-header]');
const { cookieSuffix, pairingUrl, showPairingDialog } = JSON.parse(script.dataset.userHeader);

// Provide current_user.short_name to cached pages via session cookie.
// There is apps code that also depends on this query-selector, so if changes are made
// here we should be sure to also update other locations.
const nameSpan = document.querySelector('.header_button.header_user.user_menu .user_name');
if (nameSpan) {
  const dataName = nameSpan.dataset.shortname;
  const id = nameSpan.dataset.id;
  const storedName = Cookie.get(SHORT_NAME + cookieSuffix);
  if (storedName && !id) {
    nameSpan.innerHTML = nameSpan.innerHTML.replace(dataName, storedName);
  }
}

function hideUserOptions() {
  $('.user_options').slideUp();
  $('.user_menu_arrow_down').show();
  $('.user_menu_arrow_up').hide();
  $(document).off('click', hideUserOptions);
}
$(document).ready(() => {
  $('.user_menu').click(function (e) {
    if ($('.user_options').is(':hidden')) {
      e.stopPropagation();
      $('.user_options').slideDown();
      $('.user_menu_arrow_down').hide();
      $('.user_menu_arrow_up').show();
      $(document).on('click', hideUserOptions);

      $("#hamburger-icon").removeClass('active');
      $('#hamburger #hamburger-contents').slideUp();
    }
  });
  $('.user_options').click(function (e) {
    e.stopPropagation(); // Clicks inside the popup shouldn't close it
  });
  $('.user_options a:last').click(function (e) {
    // this partial can be on non-dashboard pages.
    if (typeof dashboard !== 'undefined') {
      dashboard.clientState.reset();
    } else {
      // Keep in sync with clientState#reset.
      try {
        sessionStorage.clear();
      } catch (e) {}
    }
  });
});

if (typeof dashboard !== 'undefined') {
  dashboard.pairing.init(pairingUrl, hideUserOptions, showPairingDialog);
}
