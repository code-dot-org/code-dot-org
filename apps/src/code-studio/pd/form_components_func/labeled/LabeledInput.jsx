import PropTypes from 'prop-types';
import React from 'react';
import {FieldGroup} from '../form/FieldGroup';
import {defaultOptions} from '../LabeledFormComponent';

export const LabeledInput = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'text',
    ...props
  };
  return <FieldGroup {...passProps} />;
};
LabeledInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};

export const LabeledNumberInput = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'number',
    ...props
  };
  return <FieldGroup {...passProps} />;
};
LabeledNumberInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};

export const LabeledLargeInput = props => {
  const passProps = {
    componentClass: 'textarea',
    controlWidth: {md: 12},
    rows: 4,
    maxLength: 500,
    ...props
  };
  return <LabeledInput {...passProps} />;
};
