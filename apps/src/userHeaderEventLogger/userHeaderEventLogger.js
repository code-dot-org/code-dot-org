import $ from 'jquery';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import getScriptData from '@cdo/apps/util/getScriptData';

const HELP_ICON_OPTION_IDS = ['support', 'report-bug', 'teacher-community'];
const HAMBURGER_OPTION_IDS = [
  'learn',
  'educate_entries',
  'districts',
  'stats',
  'donate',
  'about_entries',
  'legal_entries',
];

// Adds an event to each header or hamburger link
function addClickEventToLinks(selector, eventName, additionalProperties = {}) {
  const links = document.querySelectorAll(`.${selector}`);
  links.forEach(link => {
    link.addEventListener('click', () => {
      analyticsReporter.sendEvent(eventName, {
        [selector]: link.href,
        ...additionalProperties,
      });
    });
  });
}

const addCreateMenuMetrics = (
  headerCreateMenu,
  isSignedIn,
  additionalOptions = {}
) => {
  if (headerCreateMenu) {
    // Log if a signed-out user clicks the "Create" menu dropdown
    if (!isSignedIn) {
      headerCreateMenu.addEventListener('click', () => {
        analyticsReporter.sendEvent(
          EVENTS.SIGNED_OUT_USER_CLICKS_CREATE_DROPDOWN,
          additionalOptions
        );
      });
    }

    // Log if a signed-out user clicks an option in the "Create" menu dropdown
    const createMenuOptions = getScriptData('createMenuOptions');
    createMenuOptions.forEach(option => {
      document
        .getElementById(`create_menu_option_${option}`)
        .addEventListener('click', () => {
          if (!isSignedIn) {
            analyticsReporter.sendEvent(
              EVENTS.SIGNED_OUT_USER_SELECTS_CREATE_DROPDOWN_OPTION,
              {
                option: option,
                ...additionalOptions,
              }
            );
          }
        });
    });
  }
};

const addMenuMetrics = (
  menuElementId,
  options,
  dropdownEventName,
  optionEventName,
  additionalOptions = {}
) => {
  const menu = document.getElementById(menuElementId);
  if (menu) {
    // Log if a signed-out user clicks the "Create" menu dropdown
    menu.addEventListener('click', () => {
      if (dropdownEventName) {
        analyticsReporter.sendEvent(dropdownEventName, additionalOptions);
      }
    });

    // Log if a signed-out user clicks an option in the "Create" menu dropdown
    options.forEach(option => {
      const optionElement = document.getElementById(option);
      if (optionElement) {
        optionElement.addEventListener('click', () => {
          if (optionEventName) {
            analyticsReporter.sendEvent(optionEventName, {
              option: option,
              ...additionalOptions,
            });
          }
        });
      }
    });
  }
};

const addSignedOutMetrics = (pageUrl, headerCreateMenu) => {
  // Log if a header link is clicked
  addClickEventToLinks('headerlink', EVENTS.SIGNED_OUT_USER_CLICKS_HEADER_LINK);

  // Log if a hamburger link is clicked
  addClickEventToLinks(
    'hamburgerlink',
    EVENTS.SIGNED_OUT_USER_CLICKS_HAMBURGER_LINK
  );

  const createAccountButton = document.querySelector('#create_account_button');

  // Log if the Create Account button is clicked
  if (createAccountButton) {
    createAccountButton.addEventListener('click', () => {
      analyticsReporter.sendEvent(EVENTS.CREATE_ACCOUNT_BUTTON_CLICKED, {
        pageUrl: pageUrl,
      });
    });
  }

  // Log if the Help icon menu is clicked
  const helpIcon = document.querySelector('#help-icon');
  helpIcon.addEventListener('click', () => {
    analyticsReporter.sendEvent(EVENTS.SIGNED_OUT_USER_CLICKS_HELP_MENU, {});
  });

  addCreateMenuMetrics(headerCreateMenu, false);
};

const addSignedInMetrics = (pageUrl, headerCreateMenu) => {
  const userType = getScriptData('userType');
  const pageControllerName = getScriptData('pageControllerName');
  const pageActionName = getScriptData('pageActionName');
  const additionalOptions = {
    userType: userType,
    pageUrl: pageUrl,
    pageControllerName: pageControllerName,
    pageActionName: pageActionName,
  };

  // Log if a header link is clicked
  // Intentionally do not log signed-in header link and user menu events.

  addMenuMetrics(
    'help-icon',
    HELP_ICON_OPTION_IDS,
    EVENTS.SIGNED_IN_USER_CLICKS_HELP_MENU,
    EVENTS.SIGNED_IN_USER_CLICKS_HELP_MENU_OPTION,
    additionalOptions
  );

  addMenuMetrics(
    'hamburger-icon',
    HAMBURGER_OPTION_IDS,
    null,
    EVENTS.SIGNED_IN_USER_CLICKS_HAMBURGER_OPTION,
    additionalOptions
  );

  addCreateMenuMetrics(headerCreateMenu, true, additionalOptions);
};

$(document).ready(function () {
  const headerCreateMenu = document.getElementById('header_create_menu');
  const pageUrl = window.location.href;

  if (!pageUrl.includes('/global/')) {
    if (getScriptData('isSignedOut')) {
      addSignedOutMetrics(pageUrl, headerCreateMenu);
    } else {
      addSignedInMetrics(pageUrl, headerCreateMenu);
    }
  }
});
