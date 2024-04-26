import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Tooltip, {ToggleProps} from './index';

export default {
  title: 'DesignSystem/Tooltip', // eslint-disable-line storybook/no-title-property-in-meta
  /**
   * Storybook Docs Generation doesn't work properly (as of 07.19.2023).
   * This workaround (component: Component.type instead of component: Component) is taken from
   * https://github.com/storybookjs/storybook/issues/18136#issue-1225692751
   * Feel free to remove this workaround when storybook fixes this issue.
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  component: Tooltip,
} as Meta;

//
// TEMPLATE
//
// This is needed to fix children type error (passing string instead of React.ReactNode type)
// eslint-disable-next-line
const SingleTemplate: StoryFn<ToggleProps> = args => <Tooltip {...args} />;

const MultipleTemplate: StoryFn<{components: ToggleProps[]}> = args => (
  <>
    {args.components?.map(componentArg => (
      <Tooltip key={componentArg.name} {...componentArg} />
    ))}
  </>
);

export const DefaultTooltip = SingleTemplate.bind({});
DefaultTooltip.args = {
  name: 'controlled_Tooltip',
  label: 'Tooltip Label',
};

export const DefaultTooltipGroup = MultipleTemplate.bind({});
DefaultTooltipGroup.args = {
  components: [
    {
      name: 'test-left',
      label: 'Tooltip left',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-right',
      label: 'Tooltip right',
      position: 'right',
      checked: false,
      onChange: () => null,
    },
  ],
};

export const DisabledTooltipGroup = MultipleTemplate.bind({});
DisabledTooltipGroup.args = {
  components: [
    {
      name: 'test-disabled',
      label: 'Disabled Tooltip',
      disabled: true,
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-disabled-checked',
      label: 'Disabled checked Tooltip',
      checked: true,
      disabled: true,
      onChange: () => null,
    },
  ],
};

export const SizesOfTooltipGroup = MultipleTemplate.bind({});
SizesOfTooltipGroup.args = {
  components: [
    {
      name: 'test-xs',
      label: 'Label - XS',
      size: 'xs',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-s',
      label: 'Label - S',
      size: 's',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-m',
      label: 'Label - M',
      size: 'm',
      checked: false,
      onChange: () => null,
    },
    {
      name: 'test-l',
      label: 'Label - L',
      size: 'l',
      checked: false,
      onChange: () => null,
    },
  ],
};
