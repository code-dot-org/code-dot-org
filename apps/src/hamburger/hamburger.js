import statsigReporter from '@cdo/apps/metrics/StatsigReporter';
import {
  getChannelIdFromUrl,
  userAlreadyReportedAbuse,
} from '@cdo/apps/reportAbuse';

export const initHamburger = function () {
  $(document).ready(function () {
    const isInSignupExperiment = statsigReporter.getIsInExperiment(
      'new_sign_up_v1',
      'showNewFlow',
      false
    );
    const signupLinks = document.querySelectorAll('#create_account_button');

    if (isInSignupExperiment) {
      signupLinks.forEach(link => {
        link.href = 'https://studio.code.org/users/new_sign_up/account_type';
      });
    }

    $('#hamburger-icon').click(function (e) {
      $(this).toggleClass('active');
      $('#hamburger').removeClass('user-is-tabbing');
      $('#help-button').removeClass('user-is-tabbing');
      $('#hamburger #hamburger-contents').slideToggle();
      e.preventDefault();
    });

    // allows users to toggle help menu by pressing return
    // while tabbing through elements
    $('#hamburger').on('keypress', function (e) {
      if (
        e.type === 'keypress' &&
        e.which === 13 &&
        e.target.className !== 'hamburger-expandable-item item'
      ) {
        $(this).toggleClass('active');
        $('#hamburger-icon').toggleClass('active');
        $('#hamburger #hamburger-contents').slideToggle();
        e.preventDefault();
      }
    });

    $(document).on('keypress keydown click', function (e) {
      var hamburger = $('#hamburger');

      // If we didn't click the hamburger itself, and also nothing inside it,
      // then hide it.
      if (
        !hamburger.is(e.target) &&
        hamburger.has(e.target).length === 0 &&
        e.target.className !== 'hamburger-expandable-item item'
      ) {
        hamburger.children('#hamburger-contents').slideUp();
        $('#hamburger-icon').removeClass('active');
      }

      var helpButton = $('#help-button');

      // If the user is using the keyboard to navigate,
      // add a class that retains element outline
      if (e.type === 'keydown' && e.which === 9) {
        hamburger.addClass('user-is-tabbing');
        helpButton.addClass('user-is-tabbing');
      }

      // If we didn't click the help button itself, and also nothing inside it,
      // then hide it.
      if (!helpButton.is(e.target) && helpButton.has(e.target).length === 0) {
        helpButton.children('#help-contents').slideUp();
        $('#help-icon').removeClass('active');
      }
    });

    $('.hamburger-expandable-item').each(function () {
      $(this).on('keypress click', function (e) {
        if ((e.type === 'keypress' && e.which === 13) || e.type === 'click') {
          $('#' + $(this).attr('id') + '-items').slideToggle();
          $(this).find('.arrow-down').toggle();
          $(this).find('.arrow-up').toggle();
          e.preventDefault();
        }
      });
    });

    $('#help-icon').click(function (e) {
      $(this).toggleClass('active');
      $('#hamburger').removeClass('user-is-tabbing');
      $('#help-button').removeClass('user-is-tabbing');
      $('#help-button #help-contents').slideToggle();
      e.preventDefault();
    });

    // allows users to toggle help menu by pressing return
    // while tabbing through elements
    $('#help-button').on('keypress', function (e) {
      if (e.type === 'keypress' && e.which === 13) {
        $(this).toggleClass('active');
        $('#help-button #help-contents').slideToggle();
        e.preventDefault();
      }
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
