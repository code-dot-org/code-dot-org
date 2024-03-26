import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Tabs, {TabsProps} from './index';

export default {
  title: 'DesignSystem/Tabs', // eslint-disable-line storybook/no-title-property-in-meta
  component: Tabs,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: StoryFn<TabsProps> = args => <Tabs {...args} />;

const MultipleTemplate: StoryFn<{
  components: TabsProps[];
}> = args => (
  <>
    {args.components?.map(componentArg => (
      <Tabs key={componentArg.name} {...componentArg} />
    ))}
  </>
);

export const DefaultTabs = SingleTemplate.bind({});
DefaultTabs.args = {
  name: 'controlled_checkbox',
  label: 'Tabs Label',
};
//
export const GroupOfDefaultTabs = MultipleTemplate.bind({});
GroupOfDefaultTabs.args = {
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

export const GroupOfDisabledTabs = MultipleTemplate.bind({});
GroupOfDisabledTabs.args = {
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

export const GroupOfSizesOfTabs = MultipleTemplate.bind({});
GroupOfSizesOfTabs.args = {
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
