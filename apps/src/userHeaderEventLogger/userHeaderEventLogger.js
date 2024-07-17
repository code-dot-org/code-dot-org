import $ from 'jquery';

import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import getScriptData from '@cdo/apps/util/getScriptData';

// Adds an event to each header or hamburger link
function addClickEventToLinks(selector, eventName) {
  const links = document.querySelectorAll(`.${selector}`);
  links.forEach(link => {
    link.addEventListener('click', () => {
      analyticsReporter.sendEvent(
        eventName,
        {
          [selector]: link.href,
        },
        PLATFORMS.STATSIG
      );
    });
  });
}

$(document).ready(function () {
  const signInButton = document.getElementById('signin_button');
  const headerCreateMenu = document.getElementById('header_create_menu');
  const pageUrl = window.location.href;
  const helpIcon = document.querySelector('#help-icon');
  const screenWidth = window.innerWidth;

  function getHeaderType(screenWidth) {
    if (screenWidth < 425) {
      return 'mobile';
    } else if (screenWidth < 1024) {
      return 'tablet';
    } else if (screenWidth > 1024 && screenWidth < 1268) {
      return 'small desktop';
    } else {
      return 'large desktop';
    }
  }

  if (getScriptData('isSignedOut')) {
    analyticsReporter.sendEvent(
      EVENTS.SIGNED_OUT_USER_SEES_HEADER,
      {
        pageUrl: pageUrl,
        headerType: getHeaderType(screenWidth),
      },
      PLATFORMS.STATSIG
    );

    // Log if a header link is clicked
    addClickEventToLinks(
      'headerlink',
      EVENTS.SIGNED_OUT_USER_CLICKS_HEADER_LINK
    );

    // Log if a hamburger link is clicked
    addClickEventToLinks(
      'hamburgerlink',
      EVENTS.SIGNED_OUT_USER_CLICKS_HAMBURGER_LINK
    );

    // Log if the Sign in button is clicked
    signInButton.addEventListener('click', () => {
      analyticsReporter.sendEvent(
        EVENTS.SIGNED_OUT_USER_CLICKS_SIGN_IN,
        {pageUrl: pageUrl},
        PLATFORMS.STATSIG
      );
    });

    // Log if the Help icon menu is clicked
    helpIcon.addEventListener('click', () => {
      analyticsReporter.sendEvent(
        EVENTS.SIGNED_OUT_USER_CLICKS_HELP_MENU,
        {},
        PLATFORMS.STATSIG
      );
    });
  }

  if (getScriptData('isSignedOut') && headerCreateMenu) {
    // Log if a signed-out user clicks the "Create" menu dropdown
    headerCreateMenu.addEventListener('click', () => {
      analyticsReporter.sendEvent(
        EVENTS.SIGNED_OUT_USER_CLICKS_CREATE_DROPDOWN,
        {},
        PLATFORMS.BOTH
      );
    });

    // Log if a signed-out user clicks an option in the "Create" menu dropdown
    const createMenuOptions = getScriptData('createMenuOptions');
    createMenuOptions.forEach(option => {
      document
        .getElementById(`create_menu_option_${option}`)
        .addEventListener('click', () => {
          analyticsReporter.sendEvent(
            EVENTS.SIGNED_OUT_USER_SELECTS_CREATE_DROPDOWN_OPTION,
            {
              option: option,
            },
            PLATFORMS.BOTH
          );
        });
    });
  }
});
