import $ from 'jquery';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

$(document).ready(() => {
  $('#user_login').placeholder();

  $('#new_user').on('submit', function (e) {
    window.dashboard.hashEmail({
      email_selector: '#user_login',
      hashed_email_selector: '#user_hashed_email',
    });

    window.dashboard.clientState.reset();
  });

  document.getElementById('user_signup').addEventListener('click', () => {
    analyticsReporter.sendEvent(EVENTS.SIGN_UP_STARTED_EVENT);
  });

  if (window.location.href.includes('user_return_to=/catalog')) {
    analyticsReporter.sendEvent(
      EVENTS.CURRICULUM_CATALOG_SIGN_IN_CLICKED_IN_ASSIGN_DIALOG
    );
  }
});
