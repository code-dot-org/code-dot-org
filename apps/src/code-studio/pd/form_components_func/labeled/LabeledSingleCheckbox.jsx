import PropTypes from 'prop-types';
import React from 'react';
import {SingleCheckbox} from '../form/SingleCheckbox';
import {defaultOptions} from '../LabeledFormComponent';

export const LabeledSingleCheckbox = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    ...props
  };
  return <SingleCheckbox {...passProps} />;
};
LabeledSingleCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};
