// used by dashboard/app/views/shared/_user_header.html.haml
import {reset} from '@cdo/apps/code-studio/clientState';
import pairing from '@cdo/apps/code-studio/pairing';

function hideUserOptions() {
  $('.user_options').hide();
  $('.user_menu_glyph').html('&#x25BC;');
  $(document).off('click', hideUserOptions);
}
$('.user_menu').click(function (e) {
  if ($('.user_options').is(':hidden')) {
    e.stopPropagation();
    $('.user_options').show();
    $('.user_menu_glyph').html('&#x25B2;');
    $(document).on('click', hideUserOptions);
  }
});
$('.user_options').click(function (e) {
  e.stopPropagation(); // Clicks inside the popup shouldn't close it
});
$('.user_options a:last').click(function (e) {
  // this partial can be returned in an API call so it's possible for it to be on non-dashboard pages
  if (typeof dashboard !== 'undefined') {
    reset();
  }
});

if (typeof dashboard !== 'undefined') {
  const script = document.querySelector(`script[data-userheader]`);
  const config = JSON.parse(script.dataset.userheader);

  pairing.init(config.pairingUrl, hideUserOptions, config.showPairingDialog);
}
