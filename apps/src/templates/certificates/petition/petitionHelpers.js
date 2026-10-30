import {forEach, has, merge} from 'lodash';

import {isEmail, isInt} from '@cdo/apps/util/formatValidation';
import i18n from '@cdo/locale';

export const keyValidation = {
  name_s: {
    isValid: value => !!value,
  },
  email_s: {
    isValid: isEmail,
  },
  zip_code_or_country_s: {
    isValid: () => true,
  },
  age_i: {
    isValid: isInt,
  },
  role_s: {
    isValid: () => true,
  },
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
    return i18n.formErrorBelow();
  } else {
    return i18n.formErrorsBelow();
  }
};

export const getAgeSafeData = data => {
  const safeData = {
    email_s: 'anonymous@code.org',
    name_s: '',
  };
  return data.age_i < 16 ? merge(data, safeData) : data;
};

export const professionOptions = [
  {text: '-', dataString: 'other'},
  {text: i18n.student(), dataString: 'student'},
  {text: i18n.parent(), dataString: 'parent'},
  {text: i18n.educator(), dataString: 'educator'},
  {text: i18n.administrator(), dataString: 'administrator'},
  {text: i18n.softwareEngineer(), dataString: 'engineer'},
  {text: i18n.noneOfTheAbove(), dataString: 'other'},
];
