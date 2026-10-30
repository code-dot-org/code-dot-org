import PropTypes from 'prop-types';
import React from 'react';

import {SingleCheckbox} from '../form/SingleCheckbox';
import {useDefaultOptions} from '../LabeledFormComponent';

export const LabeledSingleCheckbox = props => {
  const defaults = useDefaultOptions(props.name, props.label);
  const passProps = {
    ...defaults,
    ...props,
  };
  return <SingleCheckbox {...passProps} />;
};
LabeledSingleCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};
