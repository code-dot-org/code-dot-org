import $ from 'jquery';
import initResponsive from '@cdo/apps/code-studio/responsive';

$(document).ready(init);

async function init() {
  initResponsive();
  if (await hasSchoolDonor('Amazon')) {
    $('.show-if-eligible').show();
    if (window.location.hash === '#sign-up-today') {
      document.getElementById('sign-up-today').scrollIntoView(true);
    }
  } else {
    $('.show-if-not-eligible').show();
  }
}

async function hasSchoolDonor(assertedDonorName) {
  const response = await fetch('/dashboardapi/v1/users/me/school_donor_name');
  const realDonorName = await response.json();
  return realDonorName === assertedDonorName;
}
