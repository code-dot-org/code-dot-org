import $ from 'jquery';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

$(document).ready(() => {
  document
    .getElementById('admin_interest_form')
    .addEventListener('submit', () => {
      analyticsReporter.sendEvent(EVENTS.ADMIN_INTEREST_FORM_SUBMIT_EVENT);
    });
});
