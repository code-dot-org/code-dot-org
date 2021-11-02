import PropTypes from 'prop-types';
import React from 'react';
import {SelectFieldGroupFromOptions} from '../form/SelectFieldGroup';
import {defaultOptions} from '../LabeledFormComponent';

export const LabeledSelect = (props = {}) => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'select',
    ...props
  };
  return <SelectFieldGroupFromOptions {...passProps} />;
};
LabeledSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};
