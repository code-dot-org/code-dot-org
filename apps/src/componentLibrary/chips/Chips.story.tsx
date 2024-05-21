import {Meta, StoryFn} from '@storybook/react';
import React, {useState} from 'react';

import {Chips, ChipsProps} from './index';

export default {
  title: 'DesignSystem/Chips', // eslint-disable-line storybook/no-title-property-in-meta
  component: Chips,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<ChipsProps> = args => {
  const [values, setValues] = useState<string[]>([]);

  return (
    <Chips
      {...args}
      values={values}
      setValues={setValues as (values: string[]) => void}
    />
  );
};

const MultipleTemplate: StoryFn<{groups: ChipsProps[]}> = args => {
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

export const ThickAndThinChips = MultipleTemplate.bind({});
ThickAndThinChips.args = {
  groups: [
    {
      label: 'Thick Chips',
      name: 'thick-chips1',
      textThickness: 'thick',
      options: [
        {value: 'ThickChip1', label: 'Chip1'},
        {value: 'ThickChip2', label: 'Chip2'},
        {value: 'ThickChip3', label: 'Chip3'},
        {value: 'ThickChip4', label: 'Chip4'},
        {value: 'ThickChip5', label: 'Chip5'},
      ],
      values: [],
      setValues: () => null,
    },
    {
      label: 'Thin Chips',
      name: 'thin-chips1',
      textThickness: 'thin',
      options: [
        {value: 'ThinChip1', label: 'Chip1'},
        {value: 'ThinChip2', label: 'Chip2'},
        {value: 'ThinChip3', label: 'Chip3'},
        {value: 'ThinChip4', label: 'Chip4'},
        {value: 'ThinChip5', label: 'Chip5'},
      ],
      values: [],
      setValues: () => null,
    },
  ],
};

export const GroupOfColorsOfChips = MultipleTemplate.bind({});
GroupOfColorsOfChips.args = {
  groups: [
    {
      label: 'Black Chips',
      name: 'black-chips1',
      color: 'black',
      options: [
        {value: 'BlackChip1', label: 'Chip1'},
        {value: 'BlackChip2', label: 'Chip2'},
        {value: 'BlackChip3', label: 'Chip3'},
        {value: 'BlackChip4', label: 'Chip4'},
        {value: 'BlackChip5', label: 'Chip5'},
      ],
      values: [],
      setValues: () => null,
    },
    {
      label: 'Gray Chips',
      name: 'Gray-chips1',
      color: 'gray',
      options: [
        {value: 'GrayChip1', label: 'Chip1'},
        {value: 'GrayChip2', label: 'Chip2'},
        {value: 'GrayChip3', label: 'Chip3'},
        {value: 'GrayChip4', label: 'Chip4'},
        {value: 'GrayChip5', label: 'Chip5'},
      ],
      values: [],
      setValues: () => null,
    },
  ],
};

export const GroupOfSizesOfChips = MultipleTemplate.bind({});
GroupOfSizesOfChips.args = {
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
      setValues: () => null,
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
      setValues: () => null,
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
      setValues: () => null,
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
      setValues: () => null,
    },
  ],
};
