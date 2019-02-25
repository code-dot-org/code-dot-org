import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import RegionalPartnerMiniContact from '@cdo/apps/code-studio/pd/regional_partner_mini_contact/RegionalPartnerMiniContact';

$(document).ready(showRegionalPartnerMiniContact);

function showRegionalPartnerMiniContact() {
  const regionalPartnerMiniContactElement = $(
    '#regional-partner-mini-contact-container'
  );

  $.ajax({
    type: 'GET',
    url: '/dashboardapi/v1/users/me/contact_details',
    success: results => {
      const options = {
        user_name: results.user_name,
        email: results.email,
        zip: results.zip,
        notes: ''
      };

      ReactDOM.render(
        <RegionalPartnerMiniContact
          options={options}
          apiEndpoint="/dashboardapi/v1/pd/regional_partner_mini_contacts/"
        />,
        regionalPartnerMiniContactElement[0]
      );
    }
  });
}
