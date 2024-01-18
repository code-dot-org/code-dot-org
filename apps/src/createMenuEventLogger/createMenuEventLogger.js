import $ from 'jquery';
import getScriptData from '@cdo/apps/util/getScriptData';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

$(document).ready(function () {
  if (getScriptData('isSignedOut')) {
    document
      .getElementById('header_create_menu')
      .addEventListener('click', () => {
        analyticsReporter.sendEvent(
          EVENTS.SIGNED_OUT_USER_CLICKS_CREATE_DROPDOWN
        );
      });
  }
});
