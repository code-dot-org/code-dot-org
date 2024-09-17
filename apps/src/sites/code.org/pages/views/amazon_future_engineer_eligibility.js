import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AmazonFutureEngineerEligibility from '@cdo/apps/templates/amazonFutureEngineerEligibility/amazonFutureEngineerEligibility';

$(document).ready(init);

function showAmazonFutureEngineerEligibility() {
  const amazonFutureEngineerEligibilityElements = $(
    '.amazon-future-engineer-eligibility-container'
  );

  let signedIn = false;
  let accountInformation = {};

  $.ajax({
    type: 'GET',
    url: '/dashboardapi/v1/users/me/donor_teacher_banner_details',
  })
    .done(results => {
      signedIn = true;
      accountInformation = results;
    })
    .complete(() => {
      analyticsReporter.sendEvent(EVENTS.AFE_START);

      amazonFutureEngineerEligibilityElements.each(
        (index, amazonFutureEngineerEligibilityElement) => {
          ReactDOM.render(
            <AmazonFutureEngineerEligibility
              signedIn={signedIn}
              schoolId={accountInformation.nces_school_id || ''}
              schoolEligible={accountInformation.afe_high_needs || null}
              accountEmail={accountInformation.teacher_email || null}
              isStudentAccount={
                accountInformation.user_type === 'student' ? true : false
              }
            />,
            amazonFutureEngineerEligibilityElement
          );
        }
      );
    });
}

async function init() {
  showAmazonFutureEngineerEligibility();
}
