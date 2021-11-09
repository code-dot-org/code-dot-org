import PropTypes from 'prop-types';
import React from 'react';
import {
  Buttons,
  ButtonsFromOptions,
  ButtonsWithAdditionalTextFields,
  ButtonsWithAdditionalTextFieldsFromOptions
} from '../form/Buttons';
import {defaultOptions} from '../LabeledFormComponent';

export const LabeledCheckBoxes = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'check',
    ...props
  };
  return <ButtonsFromOptions {...passProps} />;
};
LabeledCheckBoxes.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};

export const LabeledCheckBoxesWithAdditionalTextFields = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'check',
    textFieldMap: props.textFieldMap,
    ...props
  };
  return <ButtonsWithAdditionalTextFieldsFromOptions {...passProps} />;
};
LabeledCheckBoxesWithAdditionalTextFields.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  textFieldMap: PropTypes.object
};

export const LabeledDynamicCheckBoxes = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'check',
    answers: props.options,
    ...props
  };
  return <Buttons {...passProps} />;
};
LabeledDynamicCheckBoxes.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  options: PropTypes.array
};

export const LabeledDynamicCheckBoxesWithAdditionalTextFields = props => {
  const passProps = {
    ...defaultOptions(props.name, props.label),
    type: 'check',
    options: props.options,
    textFieldMap: props.textFieldMap,
    ...props
  };
  return <ButtonsWithAdditionalTextFields {...passProps} />;
};
LabeledDynamicCheckBoxesWithAdditionalTextFields.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  options: PropTypes.array,
  textFieldMap: PropTypes.object
};
