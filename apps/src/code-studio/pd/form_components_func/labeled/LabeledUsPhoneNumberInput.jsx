import PropTypes from 'prop-types';
import React from 'react';

import {UsPhoneNumberInput} from '../form/UsPhoneNumberInput';
import {useDefaultOptions} from '../LabeledFormComponent';

export const LabeledUsPhoneNumberInput = props => {
  const defaults = useDefaultOptions(props.name, props.label);
  const passProps = {
    ...defaults,
    ...props,
  };
  return <UsPhoneNumberInput {...passProps} />;
};
LabeledUsPhoneNumberInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};
