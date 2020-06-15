import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import AmazonFutureEngineerEligibilityForm from '@cdo/apps/templates/amazonFutureEngineerEligibility/amazonFutureEngineerEligibilityForm';

$(document).ready(init);

function showAmazonFutureEngineerFormEligibility() {
  const amazonFutureEngineerEligibilityFormElement = $(
    '.amazon-future-engineer-eligibility-form-container'
  );

  ReactDOM.render(
    // TO DO: confirm that there's no case where this might be used
    // where amazonFutureEngineerEligibilityElement could be null or not an array.
    <AmazonFutureEngineerEligibilityForm />,
    amazonFutureEngineerEligibilityFormElement[0]
  );
}

async function init() {
  showAmazonFutureEngineerFormEligibility();
}
