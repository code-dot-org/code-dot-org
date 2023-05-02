import $ from 'jquery';

$(document).ready(() => {
  $('.oauth_sign_in').click(window.dashboard.clientState.reset);
  // If the makerBridge is available, we are in the Maker App, which has its
  // own Google login button. Disabling this google-oauth button to avoid confusion.
  if (!!window.MakerBridge) {
    $('.with-google_oauth2').prop({
      disabled: true,
      title:
        "Please use the 'Log in with Google' button in the toolbar at the top of the Maker App. If you do not see a 'Log in with Google' button, please download the latest Maker App version.",
    });
  }
});
