import PropTypes from 'prop-types';
import React from 'react';

import {
  Buttons,
  ButtonsFromOptions,
  ButtonsWithAdditionalTextFields,
  ButtonsWithAdditionalTextFieldsFromOptions,
} from '../form/Buttons';
import {useDefaultOptions} from '../LabeledFormComponent';

export const LabeledCheckBoxes = props => {
  const defaults = useDefaultOptions(props.name, props.label);
  const passProps = {
    ...defaults,
    type: 'check',
    ...props,
  };
  return <ButtonsFromOptions {...passProps} />;
};
LabeledCheckBoxes.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

export const LabeledCheckBoxesWithAdditionalTextFields = props => {
  const defaults = useDefaultOptions(props.name, props.label);
  const passProps = {
    ...defaults,
    type: 'check',
    textFieldMap: props.textFieldMap,
    ...props,
  };
  return <ButtonsWithAdditionalTextFieldsFromOptions {...passProps} />;
};
LabeledCheckBoxesWithAdditionalTextFields.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  textFieldMap: PropTypes.object,
};

export const LabeledDynamicCheckBoxes = props => {
  const defaults = useDefaultOptions(props.name, props.label);
  const passProps = {
    ...defaults,
    type: 'check',
    answers: props.options,
    ...props,
  };
  return <Buttons {...passProps} />;
};
LabeledDynamicCheckBoxes.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  options: PropTypes.array,
};

export const LabeledDynamicCheckBoxesWithAdditionalTextFields = props => {
  const defaults = useDefaultOptions(props.name, props.label);
  const passProps = {
    ...defaults,
    type: 'check',
    options: props.options,
    textFieldMap: props.textFieldMap,
    ...props,
  };
  return <ButtonsWithAdditionalTextFields {...passProps} />;
};
LabeledDynamicCheckBoxesWithAdditionalTextFields.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  options: PropTypes.array,
  textFieldMap: PropTypes.object,
};
