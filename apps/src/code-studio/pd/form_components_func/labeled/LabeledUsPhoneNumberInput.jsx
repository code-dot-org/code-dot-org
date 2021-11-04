import PropTypes from 'prop-types';
import React from 'react';
import {UsPhoneNumberInput} from '../form/UsPhoneNumberInput';
import {defaultOptions} from '../LabeledFormComponent';

export const LabeledUsPhoneNumberInput = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    ...props
  };
  return <UsPhoneNumberInput {...passProps} />;
};
LabeledUsPhoneNumberInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};
