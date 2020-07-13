import PropTypes from 'prop-types';
import React from 'react';
import {ButtonList} from '../form_components/ButtonList.jsx';
import FieldGroup from '../form_components/FieldGroup';
import UsPhoneNumberInput from '../form_components/UsPhoneNumberInput';
import SingleCheckbox from '../form_components/SingleCheckbox';
import utils from './utils';

/**
 * Helper class for dashboard forms. Provides helper methods for easily
 * generating commonly-used form components from a provided set of options and
 * standardizing onChange handlers. Intended to be used by an instance of
 * FormController, within which each FormComponent will act as a single page of
 * the form.
 *
 * @see the pageComponents of FacilitatorProgramRegistration for example usage.
 */
export default class FormComponent extends React.Component {
  static propTypes = {
    options: PropTypes.object.isRequired,
    errors: PropTypes.arrayOf(PropTypes.string).isRequired,
    errorMessages: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
  };

  /**
   * Override in derived classes
   * Used by FormController to map field errors to their appropriate page
   */
  static associatedFields = [];

  /**
   * Override in derived classes
   * @param {Object} data - form data
   * @returns {String[]} - list of dynamic required fields based on other responses in this page
   */
  static getDynamicallyRequiredFields(data) {
    return [];
  }

  /**
   * Override in derived classes
   * @param {Object} data - form data for this page
   * @returns {Object} - custom error messages per field
   */
  static getErrorMessages(data) {
    return {};
  }

  /**
   * Override in derived classes
   * Process and transform this page's form data before validation,
   * for example to remove answers to questions that are no longer relevant based on other selections.
   * @param {Object} data - form data for this page, as entered
   * @returns {Object} - fields to update with new values, or undefined to clear
   */
  static processPageData(data) {
    return {};
  }

  constructor(props) {
    super(props);

    if (this.constructor === FormComponent) {
      throw new TypeError(`
        FormComponent is an abstract class; cannot construct instances directly
      `);
    }

    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * @see FormController.handleChange
   * @param {Object} newState
   */
  handleChange(newState) {
    this.props.onChange(newState);
  }

  /**
   * @param {String} name
   * @returns {String|undefined}
   */
  getValidationState(name) {
    if (this.props.errors.includes(name)) {
      return 'error';
    }
  }

  /**
   * Construct a controlled Select dropdown from the options specified in
   * this.props
   *
   * @param {String} name - the name of the input. Should match a key in
   *        this.props.options
   * @param {String} label
   * @param {String} [placeholder] - if specified, will add a valueless option
   *        with the specified placeholder text
   * @param {boolean} [required=false]
   *
   * @returns {FieldGroup}
   */
  buildSelectFieldGroupFromOptions({
    name,
    label,
    placeholder,
    required,
    ...props
  }) {
    const options = this.props.options[name];
    return this.buildSelectFieldGroup({
      name,
      label,
      placeholder,
      required,
      options,
      ...props
    });
  }

  /**
   * Construct a controlled Select dropdown with supplied options
   *
   * @param {String} name - the name of the input. Should match a key in options
   * @param {String} label
   * @param {String} [placeholder] - if specified, will add a valueless option
   *        with the specified placeholder text
   * @param {boolean} [required=false]
   * @param {Answer[]|SimpleAnswer[]|Object} options - can be specified as
   *        either an array (of either Answers or SimpleAnswers, as defined in
   *        utils.js) or an object (in which case we'll use the keys for the
   *        values and the values for the display names)
   *
   * @returns {FieldGroup}
   */
  buildSelectFieldGroup({
    name,
    label,
    placeholder,
    required,
    options,
    ...props
  }) {
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
      <FieldGroup
        key={name}
        id={name}
        componentClass="select"
        label={label}
        validationState={this.getValidationState(name)}
        errorMessage={this.props.errorMessages[name]}
        onChange={this.handleChange}
        value={this.props.data[name] || ''}
        required={required}
        {...props}
      >
        {placeholder && (
          <option key="placeholder" value="">
            {placeholder}
          </option>
        )}
        {renderedOptions}
      </FieldGroup>
    );
  }

  /**
   * Construct a controlled input
   *
   * @param {String} name
   * @param {String} label
   * @param {String} type - should match a standard HTML input type
   * @param {boolean} [required=false]
   *
   * @returns {FieldGroup}
   */
  buildFieldGroup({name, label, type, required, ...props}) {
    return (
      <FieldGroup
        key={name}
        id={name}
        type={type}
        label={label}
        validationState={this.getValidationState(name)}
        errorMessage={this.props.errorMessages[name]}
        onChange={this.handleChange}
        value={this.props.data[name] || ''}
        required={required}
        {...props}
      />
    );
  }

  /**
   * Construct a controlled US phone number input
   *
   * @param {String} name
   * @param {String} label
   * @param {boolean} [required=false]
   *
   * @returns {UsPhoneNumberInput}
   */
  buildUsPhoneNumberInput({name, label, required, ...props}) {
    return (
      <UsPhoneNumberInput
        name={name}
        label={label}
        required={required}
        validationState={this.getValidationState(name)}
        errorMessage={this.props.errorMessages[name]}
        onChange={this.handleChange}
        value={this.props.data[name]}
        {...props}
      />
    );
  }

  /**
   * Construct a controlled radio or checkbox input from the options specified
   * in this.props
   *
   * @param {String} name - the name of the input. Should match a key in
   *        this.props.options
   * @param {String} label
   * @param {String} type - should be one of 'radio' or 'check'
   * @param {boolean} [required=true]
   *
   * @returns {ButtonList}
   */
  buildButtonsFromOptions({name, label, type, required, ...props}) {
    if (!this.props.options[name] || this.props.options[name].length === 0) {
      throw `Cannot create buttons for ${name} without options`;
    }

    const answers = this.props.options[name];
    return this.buildButtons({name, label, type, required, answers, ...props});
  }

  /**
   * Construct a controlled radio or checkbox input from the options specified
   * in this.props with additional text fields on certain answers
   *
   * @param {String} name - the name of the input. Should match a key in
   *        this.props.options
   * @param {String} label
   * @param {String} type - should be one of 'radio' or 'check'
   * @param {boolean} [required=true]
   * @param {Object} textFieldMap - map specifying which answers should be followed by a text field
   *        Each key is an answer text from options.
   *        Each value is the suffix (appended to `${name}_`) which will become the name of the new text field
   *
   *        For example, {"Other" : "other"} will add a text field called `${name}_other` after the "Other" option.
   *
   * @returns {ButtonList}
   */
  buildButtonsWithAdditionalTextFieldsFromOptions({
    name,
    label,
    type,
    required,
    textFieldMap,
    ...props
  }) {
    if (!this.props.options[name] || this.props.options[name].length === 0) {
      throw `Cannot create buttons for ${name} without options`;
    }

    const options = this.props.options[name];
    return this.buildButtonsWithAdditionalTextFields({
      name,
      label,
      type,
      required,
      options,
      textFieldMap,
      ...props
    });
  }

  /**
   * Construct a controlled radio or checkbox input from the options specified
   * in this.props with additional text fields on certain answers
   *
   * @param {String} name - the name of the input. Should match a key in
   *        this.props.options
   * @param {String} label
   * @param {String} type - should be one of 'radio' or 'check'
   * @param {boolean} [required=true]
   * @param {Array<String>} options - list of available options for the ButtonList.
   * @param {Object} textFieldMap - map specifying which answers should be followed by a text field
   *        Each key is an answer text from options.
   *        Each value is the suffix (appended to `${name}_`) which will become the name of the new text field
   *
   *        For example, {"Other" : "other"} will add a text field called `${name}_other` after the "Other" option.
   *
   * @returns {ButtonList}
   */
  buildButtonsWithAdditionalTextFields({
    name,
    label,
    type,
    required,
    options,
    textFieldMap,
    ...props
  }) {
    const answers = options.map(answer => {
      if (!(answer in textFieldMap)) {
        return answer;
      }

      const textFieldName = `${name}_${textFieldMap[answer]}`;
      return {
        answerText: answer,
        inputValue: this.props.data[textFieldName],
        onInputChange: newValue =>
          this.handleChange({[textFieldName]: newValue})
      };
    });

    return this.buildButtons({name, label, type, required, answers, ...props});
  }

  /**
   * Construct a controlled radio or checkbox input from the provided options
   *
   * @param {String} name - the name of the input. Should match a key in
   *        this.props.options
   * @param {String} label
   * @param {String} type - should be one of 'radio' or 'check'
   * @param {boolean} [required=true]
   * @param {Array<String|Object>} answers - list of available answers for the ButtonList.
   *        These can be strings, or objects which will generate an additional text field.
   *        See #ButtonList for more details.
   *
   * @returns {ButtonList}
   */
  buildButtons({name, label, type, required, answers, ...props}) {
    if (required === undefined) {
      required = true;
    }

    return (
      <ButtonList
        key={name}
        answers={answers}
        groupName={name}
        label={label}
        onChange={this.handleChange}
        selectedItems={this.props.data[name]}
        validationState={this.getValidationState(name)}
        required={required}
        type={type}
        {...props}
      />
    );
  }

  /**
   * Construct a controlled single checkbox input from the provided options
   *
   * @param {String} name - the name of the input. Should match a key in
   *        this.props.options
   * @param {String} label
   * @param {boolean} [required=true]
   *
   * @returns {SingleCheckbox}
   */
  buildSingleCheckbox({name, label, required, ...props}) {
    if (required === undefined) {
      required = true;
    }

    return (
      <SingleCheckbox
        name={name}
        label={label}
        required={required}
        validationState={this.getValidationState(name)}
        value={this.props.data[name]}
        onChange={this.handleChange}
        {...props}
      />
    );
  }
}
