import {isEmail, isInt} from '@cdo/apps/util/formatValidation';

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
