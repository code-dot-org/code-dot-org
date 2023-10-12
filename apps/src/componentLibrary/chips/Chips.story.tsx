import React, {useState} from 'react';
import {Meta, Story} from '@storybook/react';

import {Chips, ChipsProps} from './index';

export default {
  title: 'DesignSystem/Chips Component',
  /**
   * Storybook Docs Generation doesn't work properly (as of 07.19.2023).
   * This workaround (component: Component.type instead of component: Component) is taken from
   * https://github.com/storybookjs/storybook/issues/18136#issue-1225692751
   * Feel free to remove this workaround when storybook fixes this issue.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  component: Chips.type,
  argTypes: {setValues: {action: 'clicked'}},
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: Story<ChipsProps> = args => {
  const [values, setValues] = useState([]);

  return (
    <Chips
      {...args}
      values={values}
      setValues={setValues as (values: string[]) => void}
    />
  );
};

export const DefaultChips = SingleTemplate.bind({});
DefaultChips.args = {
  label: 'Chips label',
  name: 'test-chips',
  required: true,
  options: [
    {value: 'chip1', label: 'Chip1'},
    {value: 'chip2', label: 'Chip2'},
    {value: 'chip3', label: 'Chip3'},
    {value: 'chip4', label: 'Chip4'},
    {value: 'chip5', label: 'Chip5'},
  ],
};

export const DisabledChips = SingleTemplate.bind({});
DisabledChips.args = {
  name: 'test-chips',
  required: true,
  disabled: true,
  options: [
    {value: 'chip1', label: 'Chip1'},
    {value: 'chip2', label: 'Chip2'},
    {value: 'chip3', label: 'Chip3'},
    {value: 'chip4', label: 'Chip4'},
    {value: 'chip5', label: 'Chip5'},
  ],
  // invalidMessage: 'test',
};

//
// export const SizesOfRadioButton = MultipleTemplate.bind({});
// SizesOfRadioButton.args = {
//   radioButtons: [
//     {name: 'test-xs', value: 'test-xs', label: 'Label - XS', size: 'xs'},
//     {name: 'test-s', value: 'test-s', label: 'Label - S', size: 's'},
//     {name: 'test-m', value: 'test-m', label: 'Label - M', size: 'm'},
//     {name: 'test-l', value: 'test-l', label: 'Label - L', size: 'l'},
//   ],
// };
