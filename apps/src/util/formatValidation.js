// RFC 5322 Official Standard email regex
// Source: http://emailregex.com/

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// This is meant to match server side email validation in email_validator.rb.
// If you update this method, please also update 'email_address?' there.
export const isEmail = address => {
  if (!address || address.trim() === '') {
    return false; // Must not be blank
  }
  if (!EMAIL_REGEX.test(address)) {
    return false; // Must be well-formed
  }

  const domain = address.split('@')[1];
  if (!domain) {
    return false; // Must have a domain
  }

  // Reject single part domains like "localhost".
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return false;
  }

  // Reject invalid domains like "example..com"
  if (domainParts.includes('')) {
    return false;
  }

  // Everything valid!
  return true;
};

const ZIP_CODE_REGEX = /^\d{5}([\W-]?\d{4})?$/;
export const isZipCode = value => ZIP_CODE_REGEX.test(value);

export const isInt = value => {
  // Sub out commas
  const newValue = value.replace(/,/g, '');
  return parseInt(newValue, 10).toString() === newValue;
};
export const isPercent = value => {
  let percent = parseFloat(value);

  return 0 <= percent && percent <= 100;
};
