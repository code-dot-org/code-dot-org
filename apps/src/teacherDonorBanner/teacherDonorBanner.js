import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherDonorBanner from '@cdo/apps/templates/DonorTeacherBanner';

window.showTeacherDonorBanner = function() {
  const teacherDonorBannerElement = $('#teacher-donor-banner-container');
  const sourcePageId = teacherDonorBannerElement.data('source-page-id');
  let options = {};

  $.ajax({
    type: 'GET',
    url: '/dashboardapi/v1/users/me/contact_details'
  })
    .done(results => {
      options = {
        user_name: results.user_name,
        email: results.email,
        zip: results.zip
      };
    })
    .complete(() => {
      ReactDOM.render(
        <TeacherDonorBanner options={options} sourcePageId={sourcePageId} />,
        teacherDonorBannerElement[0]
      );
    });
};
