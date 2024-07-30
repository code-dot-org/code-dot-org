import $ from 'jquery';

import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import getScriptData from '@cdo/apps/util/getScriptData';

const USER_MENU_OPTION_IDS = ['my-projects', 'user-edit', 'user-signout'];

// Adds an event to each header or hamburger link
function addClickEventToLinks(selector, eventName, additionalProperties = {}) {
  const links = document.querySelectorAll(`.${selector}`);
  links.forEach(link => {
    link.addEventListener('click', () => {
      analyticsReporter.sendEvent(
        eventName,
        {
          [selector]: link.href,
          ...additionalProperties,
        },
        PLATFORMS.STATSIG
      );
    });
  });
}

function getHeaderType(screenWidth) {
  if (screenWidth < 425) return 'mobile';
  if (screenWidth < 1024) return 'tablet';
  if (screenWidth <= 1268) return 'small desktop';
  return 'large desktop';
}

const addSignedOutMetrics = (pageUrl, helpIcon, headerCreateMenu) => {
  const screenWidth = window.innerWidth;
  analyticsReporter.sendEvent(
    EVENTS.SIGNED_OUT_USER_SEES_HEADER,
    {
      pageUrl: pageUrl,
      headerType: getHeaderType(screenWidth),
    },
    PLATFORMS.STATSIG
  );

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
      analyticsReporter.sendEvent(
        EVENTS.CREATE_ACCOUNT_BUTTON_CLICKED,
        {pageUrl: pageUrl},
        PLATFORMS.BOTH
      );
    });
  }

  const signInButton = document.getElementById('signin_button');
  // Log if the Sign in button is clicked
  if (signInButton) {
    signInButton.addEventListener('click', () => {
      analyticsReporter.sendEvent(
        EVENTS.SIGNED_OUT_USER_CLICKS_SIGN_IN,
        {pageUrl: pageUrl},
        PLATFORMS.STATSIG
      );
    });
  }

  // Log if the Help icon menu is clicked
  helpIcon.addEventListener('click', () => {
    analyticsReporter.sendEvent(
      EVENTS.SIGNED_OUT_USER_CLICKS_HELP_MENU,
      {},
      PLATFORMS.STATSIG
    );
  });

  if (headerCreateMenu) {
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
};

const addSignedInMetrics = (pageUrl, helpIcon, headerCreateMenu) => {
  const userType = getScriptData('userType');

  // Log if a header link is clicked
  addClickEventToLinks('headerlink', EVENTS.SIGNED_IN_USER_CLICKS_HEADER_LINK, {
    userType: userType,
    pageUrl: pageUrl,
  });

  // Log if a hamburger link is clicked
  addClickEventToLinks(
    'hamburgerlink',
    EVENTS.SIGNED_IN_USER_CLICKS_HAMBURGER_LINK,
    {
      userType: userType,
      pageUrl: pageUrl,
    }
  );

  // Log if the Help icon menu is clicked
  helpIcon.addEventListener('click', () => {
    analyticsReporter.sendEvent(
      EVENTS.SIGNED_IN_USER_CLICKS_HELP_MENU,
      {
        userType: userType,
        pageUrl: pageUrl,
      },
      PLATFORMS.STATSIG
    );
  });

  const headerUserMenu = document.getElementById('header_user_menu');
  if (headerUserMenu) {
    // Log if a signed-out user clicks the "Create" menu dropdown
    headerUserMenu.addEventListener('click', () => {
      analyticsReporter.sendEvent(
        EVENTS.SIGNED_IN_USER_CLICKS_USER_MENU,
        {
          userType: userType,
          pageUrl: pageUrl,
        },
        PLATFORMS.STATSIG
      );
    });

    // Log if a signed-out user clicks an option in the "Create" menu dropdown
    USER_MENU_OPTION_IDS.forEach(option => {
      document.getElementById(option).addEventListener('click', () => {
        analyticsReporter.sendEvent(
          EVENTS.SIGNED_IN_USER_CLICKS_USER_MENU_OPTION,
          {
            option: option,
            userType: userType,
            pageUrl: pageUrl,
          },
          PLATFORMS.STATSIG
        );
      });
    });
  }

  if (headerCreateMenu) {
    // Log if a signed-out user clicks the "Create" menu dropdown
    headerCreateMenu.addEventListener('click', () => {
      analyticsReporter.sendEvent(
        EVENTS.SIGNED_IN_USER_CLICKS_CREATE_DROPDOWN,
        {
          userType: userType,
          pageUrl: pageUrl,
        },
        PLATFORMS.STATSIG
      );
    });

    // Log if a signed-out user clicks an option in the "Create" menu dropdown
    const createMenuOptions = getScriptData('createMenuOptions');
    createMenuOptions.forEach(option => {
      document
        .getElementById(`create_menu_option_${option}`)
        .addEventListener('click', () => {
          analyticsReporter.sendEvent(
            EVENTS.SIGNED_IN_USER_SELECTS_CREATE_DROPDOWN_OPTION,
            {
              option: option,
              userType: userType,
              pageUrl: pageUrl,
            },
            PLATFORMS.STATSIG
          );
        });
    });
  }
};

$(document).ready(function () {
  const headerCreateMenu = document.getElementById('header_create_menu');
  const pageUrl = window.location.href;
  const helpIcon = document.querySelector('#help-icon');

  if (getScriptData('isSignedOut')) {
    addSignedOutMetrics(pageUrl, helpIcon, headerCreateMenu);
  } else {
    addSignedInMetrics(pageUrl, helpIcon, headerCreateMenu);
  }
});
