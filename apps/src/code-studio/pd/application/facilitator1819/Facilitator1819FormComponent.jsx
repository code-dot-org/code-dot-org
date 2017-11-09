import React, {PropTypes} from 'react';
import FormComponent from '../../form_components/FormComponent';
import MarkdownSpan from '../../components/markdownSpan';

export default class Facilitator1819FormComponent extends FormComponent {
  static propTypes = {
    ...FormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  /**
   * Override in derived classes
   * @type {Object} - map of control name to label
   */
  static labels = {};

  // UI Helpers
  labelFor(name) {
    if (!(name in this.constructor.labels)) {
      console.warn(`Label missing for ${name}`);
      return name;
    }

    return (
      <MarkdownSpan>
        {this.constructor.labels[name]}
      </MarkdownSpan>
    );
  }

  indented(depth = 1) {
    return {
      controlWidth: {smOffset: depth},
      labelWidth: {smOffset: depth}
    };
  }

  defaultOptions(name) {
    return {
      name,
      label: this.labelFor(name),
      controlWidth: {md: 6},
      required: true
    };
  }

  checkBoxesFor(name, props = {}) {
    return this.buildButtonsFromOptions({
      ...this.defaultOptions(name),
      type: "check",
      ...props
    });
  }

  checkBoxesWithAdditionalTextFieldsFor(name, textFieldMap, props = {}) {
    return this.buildButtonsWithAdditionalTextFieldsFromOptions({
      ...this.defaultOptions(name),
      type: "check",
      textFieldMap,
      ...props
    });
  }

  radioButtonsWithAdditionalTextFieldsFor(name, textFieldMap, props = {}) {
    return this.buildButtonsWithAdditionalTextFieldsFromOptions({
      ...this.defaultOptions(name),
      type: "radio",
      textFieldMap,
      ...props
    });
  }

  radioButtonsFor(name, props = {}) {
    return this.buildButtonsFromOptions({
      ...this.defaultOptions(name),
      type: "radio",
      ...props
    });
  }

  selectFor(name, props = {}) {
    return this.buildSelectFieldGroupFromOptions({
      ...this.defaultOptions(name),
      type: "select",
      ...props
    });
  }

  inputFor(name, props = {}) {
    return this.buildFieldGroup({
      ...this.defaultOptions(name),
      type: "text",
      ...props
    });
  }

  largeInputFor(name, props = {}) {
    return this.inputFor(name, {
      componentClass: "textarea",
      controlWidth: {md: 12},
      rows: 4,
      maxLength: 500,
      ...props
    });
  }

  usPhoneNumberInputFor(name, props={}) {
    return this.buildUsPhoneNumberInput({
      ...this.defaultOptions(name),
      ...props
    });
  }
}
