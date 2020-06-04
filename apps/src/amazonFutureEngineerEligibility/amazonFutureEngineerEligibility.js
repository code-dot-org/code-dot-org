import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {AmazonFutureEngineerEligibility} from '@cdo/apps/templates/amazonFutureEngineerEligibility';

$(document).ready(init);

function showAmazonFutureEngineerEligibility() {
  let options = {};
  const amazonFutureEngineerEligibilityElement = $(
    '.amazon-future-engineer-eligibility-container'
  );

  options = {
    user_name: 'ben',
    email: 'ben@code.org',
    zip: '98105',
    notes: 'zzz'
  };

  ReactDOM.render(
    // Need to update API endpoint and source page ID (not sure if even needed)
    <AmazonFutureEngineerEligibility
      options={options}
      apiEndpoint="/dashboardapi/v1/pd/regional_partner_mini_contacts/"
      sourcePageId="middle-high"
    />,
    amazonFutureEngineerEligibilityElement[0]
  );
}

async function init() {
  showAmazonFutureEngineerEligibility();
}
