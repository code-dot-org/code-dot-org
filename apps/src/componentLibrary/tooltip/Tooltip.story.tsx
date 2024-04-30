import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import Tooltip, {TooltipProps} from './index';

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
const SingleTemplate: StoryFn<TooltipProps> = args => <Tooltip {...args} />;

const MultipleTemplate: StoryFn<{components: TooltipProps[]}> = args => (
  <>
    <p>
      * Margins on this screen does not represent Component's margins, and are
      only added to improve storybook view *
    </p>
    <p>Multiple Tooltips:</p>
    <div style={{display: 'flex', gap: '20px'}}>
      {args.components?.map(componentArg => (
        <Tooltip key={componentArg.text} {...componentArg} />
      ))}
    </div>
  </>
);

export const DefaultTooltip = SingleTemplate.bind({});
DefaultTooltip.args = {
  text: 'Tooltip Label',
};

export const IconsTooltipGroup = MultipleTemplate.bind({});
IconsTooltipGroup.args = {
  components: [
    {
      text: 'Tooltip',
    },
    {
      text: 'Tooltip Icon Left',
      iconLeft: {iconStyle: 'solid', iconName: 'smile'},
    },
    {
      text: 'Tooltip Icon Right',
      iconRight: {iconStyle: 'solid', iconName: 'smile'},
    },
  ],
};

export const DirectionOfTooltipGroup = MultipleTemplate.bind({});
DirectionOfTooltipGroup.args = {
  components: [
    {
      text: 'Tooltip - onTop',
      direction: 'onTop',
    },
    {
      text: 'Tooltip - onRight',
      direction: 'onRight',
    },
    {
      text: 'Tooltip - onBottom',
      direction: 'onBottom',
    },
    {
      text: 'Tooltip - onLeft',
      direction: 'onLeft',
    },
  ],
};

export const SizesOfTooltipGroup = MultipleTemplate.bind({});
SizesOfTooltipGroup.args = {
  components: [
    {
      text: 'Tooltip - XS',
      size: 'xs',
    },
    {
      text: 'Tooltip - S',
      size: 's',
    },
    {
      text: 'Tooltip - M',
      size: 'm',
    },
    {
      text: 'Tooltip - L',
      size: 'l',
    },
  ],
};
