import $ from 'jquery';
import trackEvent from '../util/trackEvent';
import {
  getChannelIdFromUrl,
  userAlreadyReportedAbuse
} from '@cdo/apps/reportAbuse';

export const initHamburger = function() {
  $(function() {
    $('#hamburger-icon').click(function(e) {
      $(this).toggleClass('active');
      $('#hamburger #hamburger-contents').slideToggle();
      e.preventDefault();
    });

    $(document).on('click', function(e) {
      var hamburger = $('#hamburger');

      // If we didn't click the hamburger itself, and also nothing inside it,
      // then hide it.
      if (!hamburger.is(e.target) && hamburger.has(e.target).length === 0) {
        hamburger.children('#hamburger-contents').slideUp();
        $('#hamburger-icon').removeClass('active');
      }

      var helpbutton = $('#help-button');

      // If we didn't click the help button itself, and also nothing inside it,
      // then hide it.
      if (!helpbutton.is(e.target) && helpbutton.has(e.target).length === 0) {
        helpbutton.children('#help-contents').slideUp();
        $('#help-icon').removeClass('active');
      }
    });

    $('.hamburger-expandable-item').each(function() {
      $(this).click(function(e) {
        $('#' + $(this).attr('id') + '-items').slideToggle();
        $(this)
          .find('.arrow-down')
          .toggle();
        $(this)
          .find('.arrow-up')
          .toggle();
        e.preventDefault();
      });
    });

    $('#help-icon').click(function(e) {
      $(this).toggleClass('active');
      $('#help-button #help-contents').slideToggle();
      e.preventDefault();
    });

    $('#help-icon #report-bug').click(function() {
      trackEvent('help_ui', 'report-bug', 'hamburger');
    });

    $('#help-icon #support').click(function() {
      trackEvent('help_ui', 'support', 'hamburger');
    });

    // This item is not in the hamburger, but actually in the studio footer.
    $('.footer #support').click(function() {
      trackEvent('help_ui', 'support', 'studio_footer');
    });

    // This item is not in the hamburger, but actually in the pegasus footers for
    // desktop and mobile.
    $('#pagefooter #support').each(function() {
      $(this).click(function() {
        trackEvent('help_ui', 'support', 'studio_footer');
      });
    });

    const channelId = getChannelIdFromUrl(location.href);
    const alreadyReportedAbuse = userAlreadyReportedAbuse(channelId);
    if (alreadyReportedAbuse) {
      let reportAbuseButton = $('#report-abuse');
      if (reportAbuseButton) {
        reportAbuseButton.hide();
      }
    }
  });
};
