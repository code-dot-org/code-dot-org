import $ from 'jquery';

$(document).ready(() => {
  $( "#edit_user" ).on("submit", function(e){
    if ($('#user_email').length) {
      window.dashboard.hashEmail({
        email_selector: '#user_email',
        hashed_email_selector: '#user_hashed_email',
        age_selector: '#user_age'
      });
    }
  });
  $( "#edit_user_create_personal_account" ).on("submit", function(e){
    if ($('#create_personal_user_email').length) {
      window.dashboard.hashEmail({
        email_selector: '#create_personal_user_email',
        hashed_email_selector: '#create_personal_user_hashed_email',
        age_selector: '#user_age'
      });
    }
  });
});
