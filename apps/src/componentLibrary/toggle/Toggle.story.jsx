import React from 'react';
import Toggle from './index';

export default {
  title: 'Toggle Component',
  component: Toggle,
};

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const MultipleTemplate = (args = []) => (
  <>
    {args.components?.map(componentArg => (
      <Toggle key={componentArg.name} {...componentArg} />
    ))}
  </>
);
export const DefaultToggle = MultipleTemplate.bind({});
DefaultToggle.args = {
  components: [
    {name: 'test-left', label: 'label left'},
    {name: 'test-right', label: 'label right', position: 'right'},
  ],
};

export const DisabledToggle = MultipleTemplate.bind({});
DisabledToggle.args = {
  components: [
    {name: 'test-disabled', label: 'Label', disabled: true},
    {
      name: 'test-disabled-checked',
      label: 'Label checked',
      checked: true,
      disabled: true,
    },
  ],
};

export const SizesOfToggle = MultipleTemplate.bind({});
SizesOfToggle.args = {
  components: [
    {name: 'test-xs', label: 'Label', size: 'xs'},
    {name: 'test-s', label: 'Label', size: 's'},
    {name: 'test-m', label: 'Label', size: 'm'},
    {name: 'test-l', label: 'Label', size: 'l'},
  ],
};
