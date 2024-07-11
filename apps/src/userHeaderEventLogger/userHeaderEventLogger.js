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
          [selector]: link.innerText,
        },
        PLATFORMS.STATSIG
      );
    });
  });
}

$(document).ready(function () {
  const headerCreateMenu = document.getElementById('header_create_menu');
  const pageUrl = window.location.href;
  const helpIcon = document.querySelector('#help-icon');
  const createAccountButton = document.querySelector('#create_account_button');

  if (getScriptData('isSignedOut')) {
    analyticsReporter.sendEvent(
      EVENTS.SIGNED_OUT_USER_SEES_HEADER,
      {pageUrl: pageUrl},
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

    // Log if the Create Account button is clicked
    createAccountButton.addEventListener('click', () => {
      analyticsReporter.sendEvent(
        EVENTS.CREATE_ACCOUNT_BUTTON_CLICKED,
        {pageUrl: pageUrl},
        PLATFORMS.BOTH
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
