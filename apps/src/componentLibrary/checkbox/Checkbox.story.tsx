import React from 'react';
import Checkbox, {CheckboxProps} from './index';
import {Meta, Story} from '@storybook/react';

export default {
  title: 'DesignSystem/Checkbox Component',
  component: Checkbox,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate:Story<CheckboxProps> = (args) => <Checkbox {...args} />;

const MultipleTemplate: Story<{components: CheckboxProps[]}> = args => (
  <>
    {args.components?.map(componentArg => (
      <Checkbox key={componentArg.name} {...componentArg} />
    ))}
  </>
);

export const DefaultCheckbox = SingleTemplate.bind({});
DefaultCheckbox.args = {
  name: 'controlled_checkbox',
  label: 'Checkbox Label',
};
//
export const GroupOfDefaultCheckboxes = MultipleTemplate.bind({});
GroupOfDefaultCheckboxes.args = {
  components: [
    {
      name: 'test',
      label: 'Label',
      onChange: () => null,
      checked: false,
    },
    {
      name: 'test-checked',
      label: 'Label Checked',
      checked: true,
      onChange: () => null,
    },
    {
      name: 'test-indeterminate',
      label: 'Label Indeterminate',
      indeterminate: true,
      checked: false,
      onChange: () => null,
    },
  ],
};

export const GroupOfDisabledCheckboxes = MultipleTemplate.bind({});
GroupOfDisabledCheckboxes.args = {
  components: [
    {
      name: 'test-disabled',
      label: 'Label',
      disabled: true,
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-disabled-checked',
      label: 'Label Checked',
      disabled: true,
      checked: true,
      onChange: () => null,
    },
    {
      name: 'test-disabled-indeterminate',
      label: 'Label Indeterminate',
      indeterminate: true,
      checked: false,
      disabled: true,
      onChange: () => null,
    },
  ],
};

export const GroupOfSizesOfCheckboxes = MultipleTemplate.bind({});
GroupOfSizesOfCheckboxes.args = {
  components: [
    {
      name: 'test-xs',
      label: 'Label XS',
      size: 'xs',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-s',
      label: 'Label S',
      size: 's',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-m',
      label: 'Label M',
      size: 'm',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-xl',
      label: 'Label XL',
      size: 'l',
      checked: false,
      onChange: () => null,
    },
  ],
};
