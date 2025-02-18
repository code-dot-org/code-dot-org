import {action} from '@storybook/addon-actions';
import PropTypes from 'prop-types';
import React from 'react';

import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

import {FormContext} from './FormComponent';
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
import {LabelsContext} from './LabeledFormComponent';

const OTHER = 'Other (please specify):';

export default {
  component: LabelsContext,
  decorators: [reactBootstrapStoryDecorator],
};

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

const Template = args => {
  const {context, children} = args;

  return <Context {...context}>{children}</Context>;
};

export const SingleCheckbox = Template.bind({});
SingleCheckbox.args = {
  context: {
    name: 'singleCheckbox',
    label: 'This is a single checkbox',
  },
  children: <LabeledSingleCheckbox name="singleCheckbox" />,
};

export const Checkboxes = Template.bind({});
Checkboxes.args = {
  context: {
    name: 'checkBoxes',
    label: 'Select options',
    options: {
      checkBoxes: ['option 1', 'option 2', 'option 3'],
    },
  },
  children: <LabeledCheckBoxes name="checkBoxes" />,
};

export const CheckboxesWithAdditionalFields = Template.bind({});
CheckboxesWithAdditionalFields.args = {
  context: {
    name: 'checkBoxesWithOther',
    label: 'Select options and add text',
    options: {
      checkBoxesWithOther: ['option 1', 'option 2', OTHER],
    },
  },
  children: (
    <LabeledCheckBoxesWithAdditionalTextFields
      name="checkBoxesWithOther"
      textFieldMap={{
        [OTHER]: 'other',
      }}
    />
  ),
};

export const RadioButtons = Template.bind({});
RadioButtons.args = {
  context: {
    name: 'radioButtons',
    label: 'Select an option',
    options: {
      radioButtons: ['option 1', 'option 2', 'option 3'],
    },
  },
  children: <LabeledRadioButtons name="radioButtons" />,
};

export const RadioButtonsWithAdditionalFields = Template.bind({});
RadioButtonsWithAdditionalFields.args = {
  context: {
    name: 'radioButtonsWithOther',
    label: 'Select an option and add text',
    options: {
      radioButtonsWithOther: ['option 1', 'option 2', OTHER],
    },
  },
  children: (
    <LabeledRadioButtonsWithAdditionalTextFields
      name="radioButtonsWithOther"
      textFieldMap={{
        [OTHER]: 'other',
      }}
    />
  ),
};

export const DynamicRadioButtonsWithAdditionalFields = Template.bind({});
DynamicRadioButtonsWithAdditionalFields.args = {
  context: {
    name: 'dynamicRadioButtonsWithOther',
    label: 'Select a dynamic option and add text',
  },
  children: (
    <LabeledDynamicRadioButtonsWithAdditionalTextFields
      name="dynamicRadioButtonsWithOther"
      options={[1, 2, 3].map(n => `Dynamic option #${n}`).concat([OTHER])}
      textFieldMap={{[OTHER]: 'other'}}
    />
  ),
};

export const DynamicCheckboxes = Template.bind({});
DynamicCheckboxes.args = {
  context: {
    name: 'dynamicCheckBoxes',
    label: 'Select all dynamic options that apply',
  },
  children: (
    <LabeledDynamicCheckBoxes
      name="dynamicCheckBoxes"
      options={[1, 2, 3].map(n => `Dynamic option #${n}`)}
    />
  ),
};

export const DynamicCheckboxesWithAdditionalFields = Template.bind({});
DynamicCheckboxesWithAdditionalFields.args = {
  context: {
    name: 'dynamicCheckboxesWithOther',
    label: 'Select a dynamic option and add text',
  },
  children: (
    <LabeledDynamicCheckBoxesWithAdditionalTextFields
      name="dynamicCheckboxesWithOther"
      options={[1, 2, 3].map(n => `Dynamic option #${n}`).concat([OTHER])}
      textFieldMap={{[OTHER]: 'other'}}
    />
  ),
};

export const Select = Template.bind({});
Select.args = {
  context: {
    name: 'select',
    label: 'Select an option',
    options: {
      select: ['option 1', 'option 2', 'option 3'],
    },
  },
  children: <LabeledSelect name="select" placeholder="Select an option" />,
};

export const Input = Template.bind({});
Input.args = {
  context: {
    name: 'input',
    label: 'Enter some text',
  },
  children: <LabeledInput name="input" />,
};

export const LargeInput = Template.bind({});
LargeInput.args = {
  context: {
    name: 'largeInput',
    label: 'Enter some longer text',
  },
  children: <LabeledLargeInput name="largeInput" />,
};

export const UsPhoneNumber = Template.bind({});
UsPhoneNumber.args = {
  context: {
    name: 'usPhoneNumber',
    label: 'Enter a phone number',
  },
  children: <LabeledUsPhoneNumberInput name="usPhoneNumber" />,
};
