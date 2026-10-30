import PropTypes from 'prop-types';
import React, {useContext} from 'react';

import FieldGroupComponent from '../../form_components/FieldGroup';
import {getValidationState, FormContext} from '../FormComponent';

/**
 * Construct a controlled input
 */
export const FieldGroup = props => {
  const {errors, errorMessages, onChange, data} = useContext(FormContext);
  const {name} = props;
  return (
    <FieldGroupComponent
      key={name}
      id={name}
      validationState={getValidationState(name, errors)}
      errorMessage={errorMessages[name]}
      onChange={onChange}
      value={data[name] || ''}
      {...props}
    />
  );
};
FieldGroup.propTypes = {
  // the name of the input
  name: PropTypes.string.isRequired,
};
