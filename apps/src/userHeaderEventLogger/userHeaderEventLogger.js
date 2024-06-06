import $ from 'jquery';

import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const headerCreateMenu = document.getElementById('header_create_menu');
  const pageUrl = document.querySelector('meta[property="og:url"]')?.content;

  if (getScriptData('isSignedOut')) {
    analyticsReporter.sendEvent(
      EVENTS.SIGNED_OUT_USER_SEES_HEADER,
      {pageUrl: pageUrl},
      PLATFORMS.STATSIG
    );
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
