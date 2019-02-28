import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import RegionalPartnerMiniContact from '@cdo/apps/code-studio/pd/regional_partner_mini_contact/RegionalPartnerMiniContact';

$(document).ready(showRegionalPartnerMiniContact);

function showRegionalPartnerMiniContact() {
  const regionalPartnerMiniContactElement = $(
    '#regional-partner-mini-contact-container'
  );
  const sourcePageId = regionalPartnerMiniContactElement.data('source-page-id');
  const notes = regionalPartnerMiniContactElement.data('options-notes');
  let options = {notes: notes};

  $.ajax({
    type: 'GET',
    url: '/dashboardapi/v1/users/me/contact_details'
  })
    .done(results => {
      options = {
        user_name: results.user_name,
        email: results.email,
        zip: results.zip,
        notes: notes
      };
    })
    .complete(() => {
      ReactDOM.render(
        <RegionalPartnerMiniContact
          options={options}
          apiEndpoint="/dashboardapi/v1/pd/regional_partner_mini_contacts/"
          sourcePageId={sourcePageId}
        />,
        regionalPartnerMiniContactElement[0]
      );
    });
}
