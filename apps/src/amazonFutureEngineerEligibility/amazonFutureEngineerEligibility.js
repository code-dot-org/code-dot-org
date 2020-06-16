import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import AmazonFutureEngineerEligibility from '@cdo/apps/templates/amazonFutureEngineerEligibility/amazonFutureEngineerEligibility';

$(document).ready(init);

function showAmazonFutureEngineerEligibility() {
  const amazonFutureEngineerEligibilityElement = $(
    '.amazon-future-engineer-eligibility-container'
  );

  let signedIn = false;
  let schoolData = {};

  $.ajax({
    type: 'GET',
    url: '/dashboardapi/v1/users/me/donor_teacher_banner_details'
  })
    .done(results => {
      // This request returns a 403 if the user isn't signed in.
      signedIn = true;

      if (results) {
        schoolData = results;
        console.log(results);
      }
    })
    .complete(() => {
      // TO DO: confirm that there's no case where this might be used
      // where amazonFutureEngineerEligibilityElement could be null or not an array.
      ReactDOM.render(
        // Need to update API endpoint and source page ID (not sure if even needed)
        <AmazonFutureEngineerEligibility
          signedIn={signedIn}
          schoolId={schoolData.nces_school_id || ''}
          schoolEligible={schoolData.afe_high_needs || null}
        />,
        amazonFutureEngineerEligibilityElement[0]
      );
    });
}

async function init() {
  showAmazonFutureEngineerEligibility();
}
