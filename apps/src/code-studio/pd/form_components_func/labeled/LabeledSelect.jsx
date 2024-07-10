import PropTypes from 'prop-types';
import React from 'react';

import {SelectFieldGroupFromOptions} from '../form/SelectFieldGroup';
import {useDefaultOptions} from '../LabeledFormComponent';

export const LabeledSelect = (props = {}) => {
  const defaults = useDefaultOptions(props.name, props.label);
  const passProps = {
    ...defaults,
    type: 'select',
    ...props,
  };
  return <SelectFieldGroupFromOptions {...passProps} />;
};
LabeledSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};
