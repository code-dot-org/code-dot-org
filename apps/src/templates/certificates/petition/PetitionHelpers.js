import React from 'react';
import {isEmail, isInt} from '@cdo/apps/util/formatValidation';
import FieldGroup from './FieldGroup';
import {forEach, has} from 'lodash';

export const buildControlledFieldGroup = (
  id,
  placeholderOrLabel,
  helpText,
  componentClass,
  children,
  handleChange,
  data
) => {
  return componentClass === 'select' ? (
    <FieldGroup
      id={id}
      name={id}
      key={id}
      label={placeholderOrLabel}
      componentClass={componentClass}
      helpText={helpText}
      onChange={handleChange}
      value={data[id] || ''}
    >
      {children}
    </FieldGroup>
  ) : (
    <FieldGroup
      id={id}
      name={id}
      key={id}
      placeholder={placeholderOrLabel}
      type={'text'}
      helpText={helpText}
      onChange={handleChange}
      value={data[id] || ''}
    />
  );
};

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
