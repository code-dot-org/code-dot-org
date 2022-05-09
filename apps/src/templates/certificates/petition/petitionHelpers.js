import {isEmail, isInt} from '@cdo/apps/util/formatValidation';
import {forEach, has, merge} from 'lodash';
import i18n from '@cdo/locale';

export const keyValidation = {
  name_s: {
    isValid: value => !!value
  },
  email_s: {
    isValid: isEmail
  },
  zip_code_or_country_s: {
    isValid: () => true
  },
  age_i: {
    isValid: isInt
  },
  role_s: {
    isValid: () => true
  }
};

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
    return 'Please fix the error below';
  } else {
    return 'Please fix the errors below';
  }
};

export const getAgeSafeData = data => {
  const safeData = {
    email_s: 'anonymous@code.org',
    name_s: ''
  };
  return data.age_i < 16 ? merge(data, safeData) : data;
};

// TODO: Ask RED – What should be displayed if user doesn't select anything?
export const professionToDataString = {
  '-': 'other',
  [i18n.student()]: 'student',
  [i18n.parent()]: 'parent',
  [i18n.educator()]: 'educator',
  [i18n.administrator()]: 'administrator',
  [i18n.softwareEngineer()]: 'engineer',
  [i18n.noneOfTheAbove()]: 'other'
};
