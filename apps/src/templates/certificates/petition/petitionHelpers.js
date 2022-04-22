import {isEmail, isInt} from '@cdo/apps/util/formatValidation';
import {forEach, has} from 'lodash';

export const keyValidation = {
  name: {
    isValid: value => !!value,
    errorText: 'include your name'
  },
  email: {
    isValid: isEmail,
    errorText: 'enter a valid email address'
  },
  age: {
    isValid: isInt,
    errorText: 'select your age'
  }
};

// Returns an error message of "Please (do x), ..., and (do y)."
// or "Please (do x)." based on the errors found in the data from
// keyValidation. If there are no errors, returns an empty string.
export const createErrorMessage = data => {
  if (!Object.keys(keyValidation).every(key => has(data, key))) {
    throw new Error('The data must have keys from all fields in keyValidation');
  }

  let errorStrings = [];
  forEach(data, (value, key) => {
    if (keyValidation[key] && !keyValidation[key].isValid(value)) {
      errorStrings.push(keyValidation[key].errorText);
    }
  });

  if (errorStrings.length === 0) {
    return '';
  } else if (errorStrings.length === 1) {
    return `Please ${errorStrings[0]}.`;
  } else {
    return `Please ${errorStrings
      .slice(0, -1)
      .join(', ')}, and ${errorStrings.slice(-1)}.`;
  }
};
