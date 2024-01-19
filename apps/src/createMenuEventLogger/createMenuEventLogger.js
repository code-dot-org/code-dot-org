import $ from 'jquery';
import getScriptData from '@cdo/apps/util/getScriptData';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

$(document).ready(function () {
  if (getScriptData('isSignedOut')) {
    // Log if a signed-out user clicks the "Create" menu dropdown
    document
      .getElementById('header_create_menu')
      .addEventListener('click', () => {
        analyticsReporter.sendEvent(
          EVENTS.SIGNED_OUT_USER_CLICKS_CREATE_DROPDOWN
        );
      });

    // Log if a signed-out user clicks an option in the "Create" menu dropdown
    const createMenuOptions = getScriptData('options');
    createMenuOptions.forEach(option => {
      document
        .getElementById(`create_menu_option_${option}`)
        .addEventListener('click', () => {
          analyticsReporter.sendEvent(
            EVENTS.SIGNED_OUT_USER_SELECTS_CREATE_DROPDOWN_OPTION,
            {
              option: option,
            }
          );
        });
    });
  }
});
