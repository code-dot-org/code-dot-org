import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Slider, {SliderProps} from './index';

export default {
  title: 'DesignSystem/[WIP]Slider', // eslint-disable-line storybook/no-title-property-in-meta
  component: Slider,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: StoryFn<SliderProps> = args => <Slider {...args} />;

const MultipleTemplate: StoryFn<{
  components: SliderProps[];
}> = args => (
  <>
    {args.components?.map(componentArg => (
      <Slider key={componentArg.name} {...componentArg} />
    ))}
  </>
);

export const DefaultSlider = SingleTemplate.bind({});
DefaultSlider.args = {
  name: 'controlled_Slider',
  label: 'Slider Label',
};
//
export const GroupOfDefaultSliders = MultipleTemplate.bind({});
GroupOfDefaultSliders.args = {
  components: [
    {
      name: 'test',
      label: 'Label',
      onChange: () => null,
    },
    {
      name: 'test-checked',
      label: 'Label Checked',
      onChange: () => null,
    },
  ],
};

export const GroupOfDisabledSliders = MultipleTemplate.bind({});
GroupOfDisabledSliders.args = {
  components: [
    {
      name: 'test-disabled',
      label: 'Label',
      disabled: true,
      onChange: () => null,
    },
    {
      name: 'test-disabled-checked',
      label: 'Label Checked',
      disabled: true,
      onChange: () => null,
    },
  ],
};

export const GroupOfSizesOfSliders = MultipleTemplate.bind({});
GroupOfSizesOfSliders.args = {
  components: [
    {
      name: 'test-xs',
      label: 'Label XS',
      size: 'xs',
      onChange: () => null,
    },
    {
      name: 'test-s',
      label: 'Label S',
      size: 's',
      onChange: () => null,
    },
    {
      name: 'test-m',
      label: 'Label M',
      size: 'm',
      onChange: () => null,
    },
    {
      name: 'test-xl',
      label: 'Label XL',
      size: 'l',
      onChange: () => null,
    },
  ],
};
