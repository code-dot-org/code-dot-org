import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';

import Tooltip, {TooltipOverlay, TooltipProps} from './index';

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
const SingleTemplate: StoryFn<TooltipProps> = args => (
  <TooltipOverlay>
    <button aria-describedby={args.tooltipId} type="button">
      Hover me
    </button>
    <Tooltip {...args} />
  </TooltipOverlay>
);

const MultipleTemplate: StoryFn<{components: TooltipProps[]}> = args => (
  <>
    <p>
      * Margins on this screen does not represent Component's margins, and are
      only added to improve storybook view *
    </p>
    <p>Multiple Tooltips:</p>
    <div style={{display: 'flex', gap: '20px'}}>
      {args.components?.map(componentArg => (
        <TooltipOverlay key={componentArg.tooltipId}>
          <Button
            aria-describedby={componentArg.tooltipId}
            onClick={() => {}}
            color="white"
            text="Hover me"
            size="xs"
          />
          <Tooltip {...componentArg} />
        </TooltipOverlay>
      ))}
    </div>
  </>
);

export const DefaultTooltip = SingleTemplate.bind({});
DefaultTooltip.args = {
  text: 'Tooltip Label',
  direction: 'onBottom',
  tooltipId: 'tooltipId',
};

export const IconsTooltipGroup = MultipleTemplate.bind({});
IconsTooltipGroup.args = {
  components: [
    {
      text: 'Tooltip',
      tooltipId: 'tooltipNoIcon',
    },
    {
      text: 'Tooltip Icon Left',
      tooltipId: 'tooltipIconLeft',
      iconLeft: {iconStyle: 'solid', iconName: 'smile'},
    },
    {
      text: 'Tooltip Icon Right',
      tooltipId: 'tooltipIconRight',
      iconRight: {iconStyle: 'solid', iconName: 'smile'},
    },
  ],
};

export const DirectionOfTooltipGroup = MultipleTemplate.bind({});
DirectionOfTooltipGroup.args = {
  components: [
    {
      text: 'Tooltip - onTop',
      tooltipId: 'tooltipOnTop',
      direction: 'onTop',
    },
    {
      text: 'Tooltip - onRight',
      tooltipId: 'tooltipOnRight',
      direction: 'onRight',
    },
    {
      text: 'Tooltip - onBottom',
      tooltipId: 'tooltipOnBottom',
      direction: 'onBottom',
    },
    {
      text: 'Tooltip - onLeft',
      tooltipId: 'tooltipOnLeft',
      direction: 'onLeft',
    },
  ],
};

export const SizesOfTooltipGroup = MultipleTemplate.bind({});
SizesOfTooltipGroup.args = {
  components: [
    {
      text: 'Tooltip - XS',
      tooltipId: 'tooltipXS',
      size: 'xs',
    },
    {
      text: 'Tooltip - S',
      tooltipId: 'tooltipS',
      size: 's',
    },
    {
      text: 'Tooltip - M',
      tooltipId: 'tooltipM',
      size: 'm',
    },
    {
      text: 'Tooltip - L',
      tooltipId: 'tooltipL',
      size: 'l',
    },
  ],
};
