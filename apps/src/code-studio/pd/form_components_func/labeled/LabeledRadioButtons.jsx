import PropTypes from 'prop-types';
import React from 'react';
import {
  ButtonsFromOptions,
  ButtonsWithAdditionalTextFields,
  ButtonsWithAdditionalTextFieldsFromOptions
} from '../form/Buttons';
import {defaultOptions} from '../LabeledFormComponent';

export const LabeledRadioButtons = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'radio',
    ...props
  };
  return <ButtonsFromOptions {...passProps} />;
};
LabeledRadioButtons.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};

export const LabeledRadioButtonsWithAdditionalTextFields = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'radio',
    textFieldMap: props.textFieldMap,
    ...props
  };
  return <ButtonsWithAdditionalTextFieldsFromOptions {...passProps} />;
};
LabeledRadioButtonsWithAdditionalTextFields.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  textFieldMap: PropTypes.object
};

export const LabeledDynamicRadioButtonsWithAdditionalTextFields = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'radio',
    options: props.options,
    textFieldMap: props.textFieldMap,
    ...props
  };
  return <ButtonsWithAdditionalTextFields {...passProps} />;
};
LabeledDynamicRadioButtonsWithAdditionalTextFields.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  options: PropTypes.array,
  textFieldMap: PropTypes.object
};
