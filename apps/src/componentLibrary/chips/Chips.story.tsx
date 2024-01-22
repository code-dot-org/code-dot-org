import React, {useState} from 'react';
import {Meta, Story} from '@storybook/react';

import {Chips, ChipsProps} from './index';

export default {
  title: 'DesignSystem/Chips Component',
  component: Chips,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: Story<ChipsProps> = args => {
  const [values, setValues] = useState<string[]>([]);

  return (
    <Chips
      {...args}
      values={values}
      setValues={setValues as (values: string[]) => void}
    />
  );
};

const MultipleTemplate: Story<{groups: ChipsProps[]}> = args => {
  const [values, setValues] = useState([]);
  const {groups} = args;

  return (
    <>
      {groups.map(group => (
        <Chips
          key={group.name}
          {...group}
          values={values}
          setValues={setValues as (values: string[]) => void}
        />
      ))}
    </>
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
};

export const SizesOfChips = MultipleTemplate.bind({});
SizesOfChips.args = {
  groups: [
    {
      label: 'Chips L',
      name: 'test-chips1',
      required: true,
      size: 'l',
      options: [
        {value: 'Lchip1', label: 'Chip1'},
        {value: 'Lchip2', label: 'Chip2'},
        {value: 'Lchip3', label: 'Chip3'},
        {value: 'Lchip4', label: 'Chip4'},
        {value: 'Lchip5', label: 'Chip5'},
      ],
      values: [],
      setValues: values => null,
    },
    {
      label: 'Chips M',
      name: 'test-chips2',
      required: true,
      size: 'm',
      options: [
        {value: 'Mchip1', label: 'Chip1'},
        {value: 'Mchip2', label: 'Chip2'},
        {value: 'Mchip3', label: 'Chip3'},
        {value: 'Mchip4', label: 'Chip4'},
        {value: 'Mchip5', label: 'Chip5'},
      ],
      values: [],
      setValues: values => null,
    },
    {
      label: 'Chips S',
      name: 'test-chips3',
      required: true,
      size: 's',
      options: [
        {value: 'Schip1', label: 'Chip1'},
        {value: 'Schip2', label: 'Chip2'},
        {value: 'Schip3', label: 'Chip3'},
        {value: 'Schip4', label: 'Chip4'},
        {value: 'Schip5', label: 'Chip5'},
      ],
      values: [],
      setValues: values => null,
    },
    {
      label: 'Chips XS',
      name: 'test-chips4',
      required: true,
      size: 'xs',
      options: [
        {value: 'XSchip1', label: 'Chip1'},
        {value: 'XSchip2', label: 'Chip2'},
        {value: 'XSchip3', label: 'Chip3'},
        {value: 'XSchip4', label: 'Chip4'},
        {value: 'XSchip5', label: 'Chip5'},
      ],
      values: [],
      setValues: values => null,
    },
  ],
};
