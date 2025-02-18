import PropTypes from 'prop-types';
import React, {useContext} from 'react';

import ButtonListComponent from '../../form_components/ButtonList.jsx';
import {getValidationState, FormContext} from '../FormComponent';

/**
 * Construct a controlled radio or checkbox input from the provided options
 */
export const Buttons = props => {
  const {onChange, data, errors} = useContext(FormContext);
  const {name, required = true} = props;

  return (
    <ButtonListComponent
      key={name}
      groupName={name}
      required={required}
      onChange={onChange}
      selectedItems={data[name]}
      validationState={getValidationState(name, errors)}
      {...props}
    />
  );
};
Buttons.propTypes = {
  // the name of the input. Should match a key in FormContext options
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
};

/**
 * Construct a controlled radio or checkbox input from the options specified
 * in FormContext
 */
export const ButtonsFromOptions = props => {
  const {options} = useContext(FormContext);
  const {name} = props;
  if (!options[name] || options[name].length === 0) {
    throw `Cannot create buttons for ${name} without options`;
  }

  const answers = options[name];
  return <Buttons answers={answers} {...props} />;
};
ButtonsFromOptions.propTypes = {
  // the name of the input. Should match a key in FormContext
  name: PropTypes.string.isRequired,
};

/**
 * Construct a controlled radio or checkbox input from the options specified
 * in FormContext with additional text fields on certain answers
 */
export const ButtonsWithAdditionalTextFields = props => {
  const {data, onChange} = useContext(FormContext);
  const {name, options, textFieldMap} = props;
  const answers = options.map(answer => {
    if (!(answer in textFieldMap)) {
      return answer;
    }

    const textFieldName = `${name}_${textFieldMap[answer]}`;
    return {
      answerText: answer,
      inputValue: data[textFieldName],
      onInputChange: newValue => onChange({[textFieldName]: newValue}),
    };
  });

  return <Buttons answers={answers} {...props} />;
};
ButtonsWithAdditionalTextFields.propTypes = {
  // the name of the input. Should match a key in FormContext options
  name: PropTypes.string.isRequired,
  // list of available options for the ButtonList
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  // map specifying which answers should be followed by a text field
  // Each key is an answer text from options.
  // Each value is the suffix (appended to `${name}_`) which will become the name of the new text field
  // For example, {"Other" : "other"} will add a text field called `${name}_other` after the "Other" option.
  textFieldMap: PropTypes.object.isRequired,
};

/**
 * Construct a controlled radio or checkbox input from the options specified
 * in FormContext with additional text fields on certain answers
 */
export const ButtonsWithAdditionalTextFieldsFromOptions = props => {
  const {options} = useContext(FormContext);
  const {name} = props;
  if (!options[name] || options[name].length === 0) {
    throw `Cannot create buttons for ${name} without options`;
  }

  const componentOptions = options[name];
  return (
    <ButtonsWithAdditionalTextFields options={componentOptions} {...props} />
  );
};
ButtonsWithAdditionalTextFieldsFromOptions.propTypes = {
  // the name of the input. Should match a key in FormContext options
  name: PropTypes.string.isRequired,
};
