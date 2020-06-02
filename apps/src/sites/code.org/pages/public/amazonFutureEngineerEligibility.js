import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import RegionalPartnerMiniContact from '@cdo/apps/templates/amazonFutureEngineerEligibility';

$(document).ready(init);

function showAmazonFutureEngineerEligibility() {
  let options = {};
  const amazonFutureEngineerEligibilityElement = $(
    '.amazon-future-engineer-eligibility-container'
  );

  $.ajax({
    type: 'GET',
    url: '/dashboardapi/v1/users/me/donor_teacher_banner_details'
  })
    .done(results => {
      if (results) {
        options = {
          tbd: 'tbd'
        };
      }
    })
    .complete(() => {
      ReactDOM.render(
        <RegionalPartnerMiniContact
          options={options}
          apiEndpoint="/dashboardapi/v1/pd/regional_partner_mini_contacts/"
          sourcePageId="middle-high"
        />,
        amazonFutureEngineerEligibilityElement[0]
      );
    });
}

async function init() {
  showAmazonFutureEngineerEligibility();
}
