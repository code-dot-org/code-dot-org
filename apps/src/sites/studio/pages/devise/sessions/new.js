// used by dashboard/app/views/devise/sessions/new.html.haml
import {reset} from '@cdo/apps/code-studio/clientState';

$("#user_login").placeholder();

$("#new_user").on("submit", function (e) {
  window.dashboard.hashEmail({
    email_selector: '#user_login',
    hashed_email_selector: '#user_hashed_email'
  });

  reset();
});

$("#signup-button").click(function (e) {
  window.location.href = "#{new_user_registration_path}";
  return false;
});
