import $ from 'jquery';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {trySetSessionStorage} from '@cdo/apps/utils';

$(document).ready(() => {
  analyticsReporter.sendEvent(EVENTS.SIGN_UP_STARTED_EVENT);

  document
    .getElementById('signup_form_submit')
    .addEventListener('click', () => {
      logUserLoginType('email');
    });
  document
    .getElementById('google_oauth2-sign-in')
    .addEventListener('click', () => {
      logUserLoginType('google');
    });
  document
    .getElementById('microsoft_v2_auth-sign-in')
    .addEventListener('click', () => {
      logUserLoginType('microsoft');
    });
  document.getElementById('facebook-sign-in').addEventListener('click', () => {
    logUserLoginType('facebook');
  });

  $('#new_user').on('submit', function (event) {
    event.preventDefault();

    const emailAddress = $('#user_email').val();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 3);

    const signupFormData = {
      emailAddress,
      expiration: expirationDate.getTime(),
    };

    trySetSessionStorage('signup-form', JSON.stringify(signupFormData));

    this.submit();
  });
});

function logUserLoginType(loginType) {
  analyticsReporter.sendEvent(EVENTS.SIGN_UP_LOGIN_TYPE_PICKED_EVENT, {
    'user login type': loginType,
  });
}
