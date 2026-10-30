import PropTypes from 'prop-types';
import React, {useContext} from 'react';

import SingleCheckboxComponent from '../../form_components/SingleCheckbox';
import {getValidationState, FormContext} from '../FormComponent';

/**
 * Construct a controlled single checkbox input from the provided options
 */
export const SingleCheckbox = props => {
  const {errors, data, onChange} = useContext(FormContext);
  const {name, required = true} = props;

  return (
    <SingleCheckboxComponent
      name={name}
      required={required}
      validationState={getValidationState(name, errors)}
      value={data[name]}
      onChange={onChange}
      {...props}
    />
  );
};
SingleCheckbox.propTypes = {
  // the name of the input. Should match a key in FormContext options
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
};
