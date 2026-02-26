import $ from 'jquery';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {USER_RETURN_TO_SESSION_KEY} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_VISITED, {});

  const userReturnTo = getScriptData('userReturnTo');

  if (userReturnTo) {
    sessionStorage.setItem(USER_RETURN_TO_SESSION_KEY, userReturnTo);
  }

  document.getElementById('user_signup').addEventListener('click', () => {
    analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_CREATE_ACCOUNT_CLICKED, {});
  });

  document.getElementById('signin-button').addEventListener('click', () => {
    analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_SIGN_IN_CLICKED, {});
  });

  document
    .getElementById('google_oauth2-sign-in')
    .addEventListener('click', () => {
      analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_OAUTH_CLICKED, {
        provider: 'google',
      });
    });

  document.getElementById('facebook-sign-in').addEventListener('click', () => {
    analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_OAUTH_CLICKED, {
      provider: 'facebook',
    });
  });

  document
    .getElementById('microsoft_v2_auth-sign-in')
    .addEventListener('click', () => {
      analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_OAUTH_CLICKED, {
        provider: 'microsoft',
      });
    });

  document.getElementById('clever-sign-in').addEventListener('click', () => {
    analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_OAUTH_CLICKED, {
      provider: 'clever',
    });
  });

  const courseBlocks = document.querySelectorAll('.courseblock-tall');
  courseBlocks.forEach(courseBlock => {
    const courseTitle = courseBlock.querySelector('h3').textContent;
    const courseUrl = courseBlock.querySelector('a').href;
    courseBlock.addEventListener('click', () => {
      analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_COURSE_BLOCK_CLICKED, {
        courseTitle,
        courseUrl,
      });
    });
  });
});
