import $ from 'jquery';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {USER_RETURN_TO_SESSION_KEY} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const userReturnTo = getScriptData('userReturnTo');

  if (userReturnTo) {
    sessionStorage.setItem(USER_RETURN_TO_SESSION_KEY, userReturnTo);
  }

  document.getElementById('user_signup').addEventListener('click', () => {
    analyticsReporter.sendEvent(EVENTS.LOGIN_PAGE_CREATE_ACCOUNT_CLICKED, {});
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
