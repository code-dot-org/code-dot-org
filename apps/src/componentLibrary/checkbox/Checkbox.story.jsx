import React from 'react';
import Checkbox from './index';

export default {
  title: 'Checkbox Component',
  component: Checkbox,
};

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const MultipleTemplate = (args = []) => (
  <>
    {args.components?.map(componentArg => (
      <Checkbox key={componentArg.name} {...componentArg} />
    ))}
  </>
);

export const DefaultCheckbox = MultipleTemplate.bind({});
DefaultCheckbox.args = {
  components: [
    {name: 'test', label: 'Label'},
    {
      name: 'test-checked',
      label: 'Label Checked',
      checked: true,
      onChange: () => {},
    },
    {
      name: 'test-indeterminate',
      label: 'Label Indeterminate',
      indeterminate: true,
      onChange: () => {},
    },
  ],
};

export const DisabledCheckbox = MultipleTemplate.bind({});
DisabledCheckbox.args = {
  components: [
    {name: 'test-disabled', label: 'Label', disabled: true},
    {
      name: 'test-disabled-checked',
      label: 'Label Checked',
      disabled: true,
      checked: true,
      onChange: () => {},
    },
    {
      name: 'test-disabled-indeterminate',
      label: 'Label Indeterminate',
      indeterminate: true,
      disabled: true,
      onChange: () => {},
    },
  ],
};

export const SizesOfCheckbox = MultipleTemplate.bind({});
SizesOfCheckbox.args = {
  components: [
    {name: 'test-xs', label: 'Label XS', size: 'xs'},
    {
      name: 'test-s',
      label: 'Label S',
      size: 's',
    },
    {
      name: 'test-m',
      label: 'Label M',
      size: 'm',
    },
    {
      name: 'test-xl',
      label: 'Label XL',
      size: 'l',
    },
  ],
};
