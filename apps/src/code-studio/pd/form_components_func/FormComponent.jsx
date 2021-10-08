import PropTypes from 'prop-types';
import React, {useContext} from 'react';
import ButtonListComponent from '../form_components/ButtonList.jsx';
import FieldGroupComponent from '../form_components/FieldGroup';
import UsPhoneNumberInputComponent from '../form_components/UsPhoneNumberInput';
import SingleCheckboxComponent from '../form_components/SingleCheckbox';
import utils from '../form_components/utils';

export const FormContext = React.createContext({});

/**
 * @param {String} name
 * @param {Array<String>} errors
 * @returns {String|undefined}
 */
export const getValidationState = (name, errors) => {
  if (errors.includes(name)) {
    return 'error';
  }
};

/**
 * Construct a controlled input
 */
export const FieldGroup = props => {
  const {errors, errorMessages, onChange, data} = useContext(FormContext);
  const {name} = props;
  return (
    <FieldGroupComponent
      key={name}
      id={name}
      validationState={getValidationState(name, errors)}
      errorMessage={errorMessages[name]}
      onChange={onChange}
      value={data[name] || ''}
      {...props}
    />
  );
};
FieldGroup.propTypes = {
  ...FieldGroupComponent.propTypes,
  // the name of the input
  name: PropTypes.string.isRequired
};

/**
 * Construct a controlled Select dropdown with supplied options
 */
export const SelectFieldGroup = props => {
  const {errors, errorMessages, onChange, data} = useContext(FormContext);
  const {name, options, placeholder} = props;
  let renderedOptions;
  if (Array.isArray(options)) {
    renderedOptions = options.map(value => {
      const {answerText, answerValue} = utils.normalizeAnswer(value);
      return (
        <option key={answerValue} value={answerValue}>
          {answerText}
        </option>
      );
    });
  } else {
    renderedOptions = Object.keys(options).map(key => (
      <option key={key} value={key}>
        {options[key]}
      </option>
    ));
  }

  return (
    <FieldGroupComponent
      key={name}
      id={name}
      componentClass="select"
      validationState={getValidationState(name, errors)}
      errorMessage={errorMessages[name]}
      onChange={onChange}
      value={data[name] || ''}
      {...props}
    >
      {placeholder && (
        <option key="placeholder" value="">
          {placeholder}
        </option>
      )}
      {renderedOptions}
    </FieldGroupComponent>
  );
};
SelectFieldGroup.propTypes = {
  ...FieldGroupComponent.propTypes,
  // the name of the input. Should match a key in options
  name: PropTypes.string.isRequired,
  // can be specified as either an array (of either Answers or SimpleAnswers, as defined in
  // utils.js) or an object (in which case we'll use the keys for the
  // values and the values for the display names)
  options: PropTypes.arrayOf(PropTypes.string),
  // if specified, will add a valueless option
  // with the specified placeholder text
  placeholder: PropTypes.string
};

/**
 * Construct a controlled Select dropdown from the options specified in FormContext
 */
export const SelectFieldGroupFromOptions = props => {
  const {options} = useContext(FormContext);
  const {name} = props;
  const componentOptions = options[name];
  return <SelectFieldGroup options={componentOptions} {...props} />;
};
SelectFieldGroupFromOptions.propTypes = {
  ...SelectFieldGroup.propTypes,
  // the name of the input. Should match a key in FormContext options
  name: PropTypes.string.isRequired
};

/**
 * Construct a controlled US phone number input
 */
export const UsPhoneNumberInput = props => {
  const {errors, errorMessages, onChange, data} = useContext(FormContext);
  const {name} = props;
  return (
    <UsPhoneNumberInputComponent
      name={name}
      validationState={getValidationState(name, errors)}
      errorMessage={errorMessages[name]}
      onChange={onChange}
      value={data[name]}
      {...props}
    />
  );
};
UsPhoneNumberInput.propTypes = {
  ...UsPhoneNumberInputComponent.propTypes,
  // the name of the input
  name: PropTypes.string.isRequired
};

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
  ...ButtonListComponent.propTypes,
  // the name of the input. Should match a key in FormContext options
  name: PropTypes.string.isRequired,
  required: PropTypes.bool
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
  ...Buttons.propTypes,
  // the name of the input. Should match a key in FormContext
  name: PropTypes.string.isRequired
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
      onInputChange: newValue => onChange({[textFieldName]: newValue})
    };
  });

  return <Buttons answers={answers} {...props} />;
};
ButtonsWithAdditionalTextFields.propTypes = {
  ...Buttons.propTypes,
  // the name of the input. Should match a key in FormContext options
  name: PropTypes.string.isRequired,
  // list of available options for the ButtonList
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  // map specifying which answers should be followed by a text field
  // Each key is an answer text from options.
  // Each value is the suffix (appended to `${name}_`) which will become the name of the new text field
  // For example, {"Other" : "other"} will add a text field called `${name}_other` after the "Other" option.
  textFieldMap: PropTypes.object.isRequired
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
  ...ButtonsWithAdditionalTextFields.propTypes,
  // the name of the input. Should match a key in FormContext options
  name: PropTypes.string.isRequired
};

/**
 * Construct a controlled single checkbox input from the provided options
 */
export const SingleCheckbox = props => {
  const {errors, data, onChange} = useContext(FormContext);
  const {name, required = true} = props;

  return (
    <SingleCheckboxComponent
      name={name}
      required={required}
      validationState={getValidationState(name, errors)}
      value={data[name]}
      onChange={() => onChange(props)}
      {...props}
    />
  );
};
SingleCheckbox.propTypes = {
  ...SingleCheckboxComponent.propTypes,
  // the name of the input. Should match a key in FormContext options
  name: PropTypes.string.isRequired,
  required: PropTypes.bool
};
