import React from 'react';
import RadioButton from './index';

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
    {args.components?.map(componentArg => (
      <RadioButton key={componentArg.name} {...componentArg} />
    ))}
  </>
);
export const DefaultRadioButton = MultipleTemplate.bind({});
DefaultRadioButton.args = {
  components: [
    {name: 'test-left', label: 'RadioButton left'},
    {name: 'test-right', label: 'RadioButton right', position: 'right'},
  ],
};

export const DisabledRadioButton = MultipleTemplate.bind({});
DisabledRadioButton.args = {
  components: [
    {name: 'test-disabled', label: 'Disabled radioButton', disabled: true},
    {
      name: 'test-disabled-checked',
      label: 'Disabled checked radioButton',
      checked: true,
      disabled: true,
    },
  ],
};

export const SizesOfRadioButton = MultipleTemplate.bind({});
SizesOfRadioButton.args = {
  components: [
    {name: 'test-xs', label: 'Label - XS', size: 'xs'},
    {name: 'test-s', label: 'Label - S', size: 's'},
    {name: 'test-m', label: 'Label - M', size: 'm'},
    {name: 'test-l', label: 'Label - L', size: 'l'},
  ],
};
