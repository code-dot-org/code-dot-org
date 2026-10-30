import $ from 'jquery';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import SectionCodeEntry from '@cdo/apps/signIn/SectionCodeEntry';
import SignInPage from '@cdo/apps/signIn/SignInPage';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  // Left column: page title + sign-in form, in a single React root.
  const signInMount = document.getElementById('sign-in-page-layout');
  if (signInMount) {
    const data = signInMount.dataset;
    createReactRoot(
      <SignInPage
        title={data.title}
        hashedEmail={data.hashedEmail || ''}
        loginValue={data.loginValue || ''}
        signInPath={data.signInPath}
        loginLabel={data.loginLabel}
        passwordLabel={data.passwordLabel}
        signInLabel={data.signInLabel}
        signUpLabel={data.signUpLabel}
        signUpPath={data.signUpPath}
        showSignUp={data.showSignUp === 'true'}
        forgotPasswordPath={data.forgotPasswordPath || undefined}
        forgotPasswordLabel={data.forgotPasswordLabel}
        userReturnTo={data.userReturnTo || null}
      />,
      signInMount
    );
  }

  // Right column: section-code entry (present only on the sessions page).
  const sectionCodeMount = document.getElementById('section-code-entry-mount');
  if (sectionCodeMount) {
    const data = sectionCodeMount.dataset;
    createReactRoot(
      <SectionCodeEntry
        sectionCodeLabel={data.sectionCodeLabel}
        sectionCodePlaceholder={data.sectionCodePlaceholder}
        defaultSectionCode={data.defaultSectionCode || ''}
        goLabel={data.goLabel}
        formActionUrl={data.formAction}
      />,
      sectionCodeMount
    );
  }

  // Course blocks remain server-rendered HAML for now, so keep their
  // click analytics wiring here until they are migrated separately.
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
