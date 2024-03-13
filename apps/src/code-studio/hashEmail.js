import $ from 'jquery';
import {md5} from '../util/crypto';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export default function (options) {
  // Hash the email, if it is an email.
  const email = normalizeEmail($(options.email_selector).val());
  if (email !== '' && EMAIL_REGEX.test(email)) {
    const hashed_email = hashEmail(email);
    $(options.hashed_email_selector).val(hashed_email);

    // Unless we want to deliberately skip the step of clearing the email.
    if (!options.skip_clear_email) {
      // If age < 13, don't send the plaintext email.
      if (!options.age_selector || $(options.age_selector).val() < 13) {
        $(options.email_selector).val('');
      }
    }
  }
}

export function hashEmail(cleartextEmail) {
  return md5(normalizeEmail(cleartextEmail));
}

function normalizeEmail(rawEmail) {
  return rawEmail.toLowerCase().trim();
}
