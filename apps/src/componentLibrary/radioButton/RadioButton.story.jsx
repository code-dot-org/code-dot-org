import React from 'react';
import {RadioButton, RadioButtonGroup} from './index';

export default {
  title: 'DesignSystem/Radio Button Component',
  component: RadioButton,
};

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const MultipleTemplate = (args = []) => (
  <>
    <RadioButtonGroup {...args} />
  </>
);
export const DefaultRadioButton = MultipleTemplate.bind({});
DefaultRadioButton.args = {
  radioButtons: [
    {name: 'radio1', label: 'RadioButton 1', value: 'radio1'},
    {name: 'radio2', label: 'RadioButton 2', value: 'radio2'},
  ],
};

export const DisabledRadioButton = MultipleTemplate.bind({});
DisabledRadioButton.args = {
  defaultValue: 'test-disabled-checked',
  radioButtons: [
    {
      name: 'test-disabled',
      value: 'test-disabled',
      label: 'Disabled radioButton',
      disabled: true,
    },
    {
      name: 'test-disabled-checked',
      value: 'test-disabled-checked',
      label: 'Disabled checked radioButton',
      disabled: true,
    },
  ],
};

export const SizesOfRadioButton = MultipleTemplate.bind({});
SizesOfRadioButton.args = {
  radioButtons: [
    {name: 'test-xs', value: 'test-xs', label: 'Label - XS', size: 'xs'},
    {name: 'test-s', value: 'test-s', label: 'Label - S', size: 's'},
    {name: 'test-m', value: 'test-m', label: 'Label - M', size: 'm'},
    {name: 'test-l', value: 'test-l', label: 'Label - L', size: 'l'},
  ],
};
