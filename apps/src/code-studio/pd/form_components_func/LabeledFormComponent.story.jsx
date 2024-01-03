import React from 'react';
import PropTypes from 'prop-types';
import {LabelsContext} from './LabeledFormComponent';
import {
  LabeledCheckBoxes,
  LabeledCheckBoxesWithAdditionalTextFields,
  LabeledDynamicCheckBoxes,
  LabeledDynamicCheckBoxesWithAdditionalTextFields,
} from './labeled/LabeledCheckBoxes';
import {LabeledLargeInput, LabeledInput} from './labeled/LabeledInput';
import {
  LabeledRadioButtons,
  LabeledRadioButtonsWithAdditionalTextFields,
  LabeledDynamicRadioButtonsWithAdditionalTextFields,
} from './labeled/LabeledRadioButtons';
import {LabeledSelect} from './labeled/LabeledSelect';
import {LabeledSingleCheckbox} from './labeled/LabeledSingleCheckbox';
import {LabeledUsPhoneNumberInput} from './labeled/LabeledUsPhoneNumberInput';
import {FormContext} from './FormComponent';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';
import {action} from '@storybook/addon-actions';

const OTHER = 'Other (please specify):';

export default storybook => {
  const defaultProps = {
    errors: [],
    errorMessages: {},
    data: {},
    options: {},
    onChange: action('onChange'),
  };

  const Context = ({children, ...props}) => {
    const {name, label} = props;
    return (
      <FormContext.Provider value={{...defaultProps, ...props}}>
        <LabelsContext.Provider value={{[name]: label}}>
          {children}
        </LabelsContext.Provider>
      </FormContext.Provider>
    );
  };
  Context.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    children: PropTypes.node,
  };

  storybook
    .storiesOf('FormComponents/LabeledFormComponentFunctional', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Single Checkbox',
        story: () => (
          <Context name="singleCheckbox" label="This is a single checkbox">
            <LabeledSingleCheckbox name="singleCheckbox" />
          </Context>
        ),
      },
      {
        name: 'Checkboxes',
        story: () => (
          <Context
            name="checkBoxes"
            label="Select options"
            options={{
              checkBoxes: ['option 1', 'option 2', 'option 3'],
            }}
          >
            <LabeledCheckBoxes name="checkBoxes" />
          </Context>
        ),
      },
      {
        name: 'CheckboxesWithAdditionalFields',
        story: () => (
          <Context
            name="checkBoxesWithOther"
            label="Select options and add text"
            options={{
              checkBoxesWithOther: ['option 1', 'option 2', OTHER],
            }}
          >
            <LabeledCheckBoxesWithAdditionalTextFields
              name="checkBoxesWithOther"
              textFieldMap={{
                [OTHER]: 'other',
              }}
            />
          </Context>
        ),
      },
      {
        name: 'RadioButtons',
        story: () => (
          <Context
            name="radioButtons"
            label="Select an option"
            options={{
              radioButtons: ['option 1', 'option 2', 'option 3'],
            }}
          >
            <LabeledRadioButtons name="radioButtons" />
          </Context>
        ),
      },
      {
        name: 'RadioButtonsWithAdditionalFields',
        story: () => (
          <Context
            name="radioButtonsWithOther"
            label="Select an option and add text"
            options={{
              radioButtonsWithOther: ['option 1', 'option 2', OTHER],
            }}
          >
            <LabeledRadioButtonsWithAdditionalTextFields
              name="radioButtonsWithOther"
              textFieldMap={{
                [OTHER]: 'other',
              }}
            />
          </Context>
        ),
      },
      {
        name: 'DynamicRadioButtonsWithAdditionalFields',
        story: () => (
          <Context
            name="dynamicRadioButtonsWithOther"
            label="Select a dynamic option and add text"
          >
            <LabeledDynamicRadioButtonsWithAdditionalTextFields
              name="dynamicRadioButtonsWithOther"
              options={[1, 2, 3]
                .map(n => `Dynamic option #${n}`)
                .concat([OTHER])}
              textFieldMap={{[OTHER]: 'other'}}
            />
          </Context>
        ),
      },
      {
        name: 'DynamicCheckboxes',
        story: () => (
          <Context
            name="dynamicCheckBoxes"
            label="Select all dynamic options that apply"
          >
            <LabeledDynamicCheckBoxes
              name="dynamicCheckBoxes"
              options={[1, 2, 3].map(n => `Dynamic option #${n}`)}
            />
          </Context>
        ),
      },
      {
        name: 'DynamicCheckboxesWithAdditionalFields',
        story: () => (
          <Context
            name="dynamicCheckboxesWithOther"
            label="Select a dynamic option and add text"
          >
            <LabeledDynamicCheckBoxesWithAdditionalTextFields
              name="dynamicCheckboxesWithOther"
              options={[1, 2, 3]
                .map(n => `Dynamic option #${n}`)
                .concat([OTHER])}
              textFieldMap={{[OTHER]: 'other'}}
            />
          </Context>
        ),
      },
      {
        name: 'Select',
        story: () => (
          <Context
            name="select"
            label="Select an option"
            options={{
              select: ['option 1', 'option 2', 'option 3'],
            }}
          >
            <LabeledSelect name="select" placeholder="Select an option" />
          </Context>
        ),
      },
      {
        name: 'Input',
        story: () => (
          <Context name="input" label="Enter some text">
            <LabeledInput name="input" />
          </Context>
        ),
      },
      {
        name: 'LargeInput',
        story: () => (
          <Context name="largeInput" label="Enter some longer text">
            <LabeledLargeInput name="largeInput" />
          </Context>
        ),
      },
      {
        name: 'UsPhoneNumber',
        story: () => (
          <Context name="usPhoneNumber" label="Enter a phone number">
            <LabeledUsPhoneNumberInput name="usPhoneNumber" />
          </Context>
        ),
      },
    ]);
};
