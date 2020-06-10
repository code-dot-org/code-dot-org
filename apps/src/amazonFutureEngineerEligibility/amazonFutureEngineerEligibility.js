import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import AmazonFutureEngineerEligibility from '@cdo/apps/templates/amazonFutureEngineerEligibility';

$(document).ready(init);

function showAmazonFutureEngineerEligibility() {
  const amazonFutureEngineerEligibilityElement = $(
    '.amazon-future-engineer-eligibility-container'
  );

  let signedIn = false;
  $.ajax({
    type: 'GET',
    url: '/dashboardapi/v1/users/me/contact_details'
  })
    .done(results => {
      if (results) {
        signedIn = true;
      }
    })
    .complete(() => {
      ReactDOM.render(
        // Need to update API endpoint and source page ID (not sure if even needed)
        <AmazonFutureEngineerEligibility signedIn={signedIn} />,
        amazonFutureEngineerEligibilityElement[0]
      );
    });
}

async function init() {
  showAmazonFutureEngineerEligibility();
}
