import React from 'react';
import {ButtonList} from '../form_components/button_list.jsx';
import FieldGroup from '../form_components/FieldGroup';

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
   *        this.props
   * @param {String} label
   * @param {String} [placeholder] - if specified, will add a valueless option
   *        with the specified placeholder text
   * @param {boolean} [required=false]
   *
   * @returns {FieldGroup}
   */
  buildSelectFieldGroupFromOptions({name, label, placeholder, required, ...props}) {
    // options for a select can be specified as either an array (in which case
    // the values and display name will be the same) or an object(in which case
    // we'll use the keys for the values and the values for the display names)
    let options;
    if (Array.isArray(this.props.options[name])) {
      options = this.props.options[name].map(value => (
        <option key={value} value={value}>{value}</option>
      ));
    } else {
      options = Object.keys(this.props.options[name]).map(key => (
        <option key={key} value={key}>{this.props.options[name][key]}</option>
      ));
    }

    return (
      <FieldGroup
        key={name}
        id={name}
        componentClass="select"
        label={label}
        validationState={this.getValidationState(name)}
        onChange={this.handleChange}
        value={this.props.data[name] || ''}
        required={required}
      >
        {placeholder && <option key="placeholder">{placeholder}</option>}
        {options}
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
        onChange={this.handleChange}
        value={this.props.data[name] || ''}
        required={required}
        {...props}
      />
    );
  }

  /**
   * Construct a controlled radio or checkbox input from the options specified
   * in this.props
   *
   * @param {String} name - the name of the input. Should match a key in
   *        this.props
   * @param {String} label
   * @param {String} type - should be one of 'radio' or 'check'
   * @param {boolean} [required=true]
   *
   * @returns {ButtonList}
   */
  buildButtonsFromOptions({name, label, type, required}) {
    if (required === undefined) {
      required = true;
    }

    return (
      <ButtonList
        key={name}
        answers={this.props.options[name]}
        groupName={name}
        label={label}
        onChange={this.handleChange}
        selectedItems={this.props.data[name]}
        validationState={this.getValidationState(name)}
        required={required}
        type={type}
      />
    );
  }
}

FormComponent.propTypes = {
  options: React.PropTypes.object.isRequired,
  errors: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  data: React.PropTypes.object.isRequired,
  onChange: React.PropTypes.func.isRequired
};
