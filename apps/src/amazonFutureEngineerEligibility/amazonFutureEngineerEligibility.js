import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import AmazonFutureEngineerEligibility from '@cdo/apps/templates/AmazonFutureEngineerEligibility';

$(document).ready(init);

function showAmazonFutureEngineerEligibility() {
  const amazonFutureEngineerEligibilityElement = $(
    '.amazon-future-engineer-eligibility-container'
  );

  ReactDOM.render(
    // Need to update API endpoint and source page ID (not sure if even needed)
    <AmazonFutureEngineerEligibility />,
    amazonFutureEngineerEligibilityElement[0]
  );
}

async function init() {
  showAmazonFutureEngineerEligibility();
}
