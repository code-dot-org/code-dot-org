import {isEmail, isInt} from '@cdo/apps/util/formatValidation';
import {forEach, has} from 'lodash';
import i18n from '@cdo/locale';

export const keyValidation = {
  name: {
    isValid: value => !!value
  },
  email: {
    isValid: isEmail
  },
  age: {
    isValid: isInt
  }
};

// Returns an error message of "Please (do x), ..., and (do y)."
// or "Please (do x)." based on the errors found in the data from
// keyValidation. If there are no errors, returns an empty string.
export const getInvalidFields = data => {
  if (!Object.keys(keyValidation).every(key => has(data, key))) {
    throw new Error('The data must have keys from all fields in keyValidation');
  }

  let invalidFields = [];
  forEach(data, (value, key) => {
    if (keyValidation[key] && !keyValidation[key].isValid(value)) {
      invalidFields.push(key);
    }
  });

  return invalidFields;
};

export const getErrorMessage = data => {
  const invalidFields = getInvalidFields(data);
  if (invalidFields.length === 0) {
    return '';
  } else if (invalidFields.length === 1) {
    return i18n.formErrorBelow();
  } else {
    return i18n.formErrorsBelow();
  }
};
