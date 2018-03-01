import React from 'react';
import LabeledFormComponent from './LabeledFormComponent';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';
import {action} from '@storybook/addon-actions';

const OTHER = "Other (please specify):";

class SingleCheckboxComponent extends LabeledFormComponent {
  static labels = {singleCheckbox: "This is a single checkbox"};
  render = () => this.singleCheckboxFor("singleCheckbox");
}

class CheckboxesComponent extends LabeledFormComponent {
  static labels = {checkBoxes: "Select options"};
  render = () => this.checkBoxesFor("checkBoxes");
}

class CheckboxesWithAdditionalTextComponent extends LabeledFormComponent {
  static labels = {checkBoxesWithOther: "Select options and add text"};
  render = () => this.checkBoxesWithAdditionalTextFieldsFor("checkBoxesWithOther", {
    [OTHER]: "other"
  });
}

class RadioButtonsComponent extends LabeledFormComponent {
  static labels = {radioButtons: "Select an option"};
  render = () => this.radioButtonsFor("radioButtons");
}

class RadioButtonsWithAdditionalTextComponent extends LabeledFormComponent {
  static labels = {radioButtonsWithOther: "Select an option and add text"};
  render = () => this.checkBoxesWithAdditionalTextFieldsFor("radioButtonsWithOther", {
    [OTHER]: "other"
  });
}

class DynamicRadioButtonsWithAdditionalTextComponent extends LabeledFormComponent {
  static labels = {dynamicRadioButtonsWithOther: "Select a dynamic option and add text"};
  render = () => this.dynamicRadioButtonsWithAdditionalTextFieldsFor("dynamicRadioButtonsWithOther",
    [1,2,3].map(n => `Dynamic option #${n}`).concat([OTHER]),
    {[OTHER]: "other"}
  );
}

class DynamicCheckboxesComponent extends LabeledFormComponent {
  static labels = {dynamicCheckBoxes: "Select all dynamic options that apply"};
  render = () => this.dynamicCheckBoxesFor("dynamicCheckBoxes",
    [1,2,3].map(n => `Dynamic option #${n}`)
  );
}

class DynamicCheckboxesWithAdditionalTextComponent extends LabeledFormComponent {
  static labels = {dynamicCheckboxesWithOther: "Select a dynamic option and add text"};
  render = () => this.dynamicRadioButtonsWithAdditionalTextFieldsFor("dynamicCheckboxesWithOther",
    [1,2,3].map(n => `Dynamic option #${n}`).concat([OTHER]),
    {[OTHER]: "other"}
  );
}

class SelectComponent extends LabeledFormComponent {
  static labels = {select: "Select an option"};
  render = () => this.selectFor("select", {placeholder: 'Select an option'});
}

class InputComponent extends LabeledFormComponent {
  static labels = {input: "Enter some text"};
  render = () => this.inputFor("input");
}

class LargeInputComponent extends LabeledFormComponent {
  static labels = {largeInput: "Enter some longer text"};
  render = () => this.largeInputFor("largeInput");
}

class UsPhoneNumberComponent extends LabeledFormComponent {
  static labels = {usPhoneNumber: "Enter a phone number"};
  render = () => this.usPhoneNumberInputFor("usPhoneNumber");
}

export default storybook => {
  const defaultProps = {
    errors: [],
    errorMessages: {},
    data: {},
    options: {},
    onChange: action('onChange')
  };

  storybook
  .storiesOf('LabeledFormComponent', module)
  .addDecorator(reactBootstrapStoryDecorator)
  .addStoryTable([{
    name: 'Single Checkbox',
    story: () => (
      <SingleCheckboxComponent
        {...defaultProps}
      />
    )
  }, {
    name: 'Checkboxes',
    story: () => (
      <CheckboxesComponent
        {...defaultProps}
        options={{
          checkBoxes: ['option 1', 'option 2', 'option 3']
        }}
      />
    )
  }, {
    name: 'CheckboxesWithAdditionalFields',
    story: () => (
      <CheckboxesWithAdditionalTextComponent
        {...defaultProps}
        options={{
          checkBoxesWithOther: ['option 1', 'option 2', OTHER]
        }}
      />
    )
  }, {
    name: 'RadioButtons',
    story: () => (
      <RadioButtonsComponent
        {...defaultProps}
        options={{
          radioButtons: ['option 1', 'option 2', 'option 3']
        }}
      />
    )
  }, {
    name: 'RadioButtonsWithAdditionalFields',
    story: () => (
      <RadioButtonsWithAdditionalTextComponent
        {...defaultProps}
        options={{
          radioButtonsWithOther: ['option 1', 'option 2', OTHER]
        }}
      />
    )
  }, {
    name: 'DynamicRadioButtonsWithAdditionalFields',
    story: () => (
      <DynamicRadioButtonsWithAdditionalTextComponent
        {...defaultProps}
      />
    )
  }, {
    name: 'DynamicCheckboxes',
    story: () => (
      <DynamicCheckboxesComponent
        {...defaultProps}
      />
    )
  }, {
    name: 'DynamicCheckboxesWithAdditionalFields',
    story: () => (
      <DynamicCheckboxesWithAdditionalTextComponent
        {...defaultProps}
      />
    )
  }, {
    name: 'Select',
    story: () => (
      <SelectComponent
        {...defaultProps}
        options={{
          select: ['option 1', 'option 2', 'option 3']
        }}
      />
    )
  }, {
    name: 'Input',
    story: () => (
      <InputComponent
        {...defaultProps}
      />
    )
  }, {
    name: 'LargeInput',
    story: () => (
      <LargeInputComponent
        {...defaultProps}
      />
    )
  }, {
    name: 'UsPhoneNumber',
    story: () => (
      <UsPhoneNumberComponent
        {...defaultProps}
      />
    )
  }]);
};
