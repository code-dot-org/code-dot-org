import PropTypes from 'prop-types';
import React, {useContext} from 'react';

import UsPhoneNumberInputComponent from '../../form_components/UsPhoneNumberInput';
import {getValidationState, FormContext} from '../FormComponent';
/**
 * Construct a controlled US phone number input
 */
export const UsPhoneNumberInput = props => {
  const {errors, errorMessages, onChange, data} = useContext(FormContext);
  const {name} = props;
  return (
    <UsPhoneNumberInputComponent
      name={name}
      validationState={getValidationState(name, errors)}
      errorMessage={errorMessages[name]}
      onChange={onChange}
      value={data[name]}
      {...props}
    />
  );
};
UsPhoneNumberInput.propTypes = {
  // the name of the input
  name: PropTypes.string.isRequired,
};
