import $ from 'jquery';
import MD5 from 'crypto-js/md5';

var EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

module.exports = function hashEmail(options) {
  // Hash the email, if it is an email.
  var email = $(options.email_selector).val().toLowerCase().trim();
  if (email !== '' && EMAIL_REGEX.test(email)) {
    var hashed_email = MD5(email);
    $(options.hashed_email_selector).val(hashed_email);

    // Unless we want to deliberately skip the step of clearing the email.
    if (!options.skip_clear_email) {
      // If age < 13, don't send the plaintext email.
      if (!options.age_selector || $(options.age_selector).val() < 13) {
        $(options.email_selector).val('');
      }
    }
  }
};
