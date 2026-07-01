import $ from 'jquery';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import SectionCodeEntry from '@cdo/apps/signIn/SectionCodeEntry';
import SignInForm from '@cdo/apps/signIn/SignInForm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  const signInMount = document.getElementById('sign-in-page-layout');
  if (signInMount) {
    const data = signInMount.dataset;
    createReactRoot(
      <SignInForm
        hashedEmail={data.hashedEmail || ''}
        loginValue={data.loginValue || ''}
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
      signInMount,
      {legacyReactDomRender: true}
    );
  }

  // Only present on the sessions (sign-in) page.
  const sectionCodeMount = document.getElementById('section-code-entry-mount');
  if (sectionCodeMount) {
    const data = sectionCodeMount.dataset;
    createReactRoot(
      <SectionCodeEntry
        sectionCodeHeading={data.sectionCodeHeading}
        sectionCodeLabel={data.sectionCodeLabel}
        sectionCodePlaceholder={data.sectionCodePlaceholder}
        defaultSectionCode={data.defaultSectionCode || ''}
        goLabel={data.goLabel}
        formAction={data.formAction}
      />,
      sectionCodeMount,
      {legacyReactDomRender: true}
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
