import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import AmazonFutureEngineerEligibility from '@cdo/apps/templates/amazonFutureEngineerEligibility/amazonFutureEngineerEligibility';

$(document).ready(init);

function showAmazonFutureEngineerEligibility() {
  const amazonFutureEngineerEligibilityElement = $(
    '.amazon-future-engineer-eligibility-container'
  );

  ReactDOM.render(
    // TO DO: confirm that there's no case where this might be used
    // where amazonFutureEngineerEligibilityElement could be null or not an array.
    <AmazonFutureEngineerEligibility />,
    amazonFutureEngineerEligibilityElement[0]
  );
}

async function init() {
  showAmazonFutureEngineerEligibility();
}
