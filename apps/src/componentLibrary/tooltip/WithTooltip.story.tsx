import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';

import Tooltip, {TooltipProps, WithTooltip} from './index';

export default {
  title: 'DesignSystem/Tooltip', // eslint-disable-line storybook/no-title-property-in-meta
  /**
   * Storybook Docs Generation doesn't work properly (as of 07.19.2023).
   * This workaround (component: Component.type instead of component: Component) is taken from
   * https://github.com/storybookjs/storybook/issues/18136#issue-1225692751
   * Feel free to remove this workaround when storybook fixes this issue.
   */
  component: Tooltip,
} as Meta;

//
// TEMPLATE
//
const SingleTemplate: StoryFn<TooltipProps> = args => (
  <WithTooltip tooltipProps={{...args}}>
    <Button onClick={() => null} text="Hover me" />
  </WithTooltip>
);

const MultipleTemplate: StoryFn<{components: TooltipProps[]}> = args => (
  <>
    <p>
      * Margins on this screen do not represent the Component's margins and are
      only added to improve the storybook view *
    </p>
    <p>Multiple Tooltips:</p>
    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
      {args.components?.map(componentArg => (
        <WithTooltip key={componentArg.tooltipId} tooltipProps={componentArg}>
          <Button onClick={() => null} text="Hover me" />
        </WithTooltip>
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
      direction: 'onBottom',
    },
    {
      text: 'Tooltip Icon Left',
      tooltipId: 'tooltipIconLeft',
      direction: 'onBottom',
      iconLeft: {iconStyle: 'solid', iconName: 'smile'},
    },
    {
      text: 'Tooltip Icon Right',
      tooltipId: 'tooltipIconRight',
      direction: 'onBottom',
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
      size: 'm',
    },
    {
      text: 'Tooltip - onRight',
      tooltipId: 'tooltipOnRight',
      direction: 'onRight',
      size: 'm',
    },
    {
      text: 'Tooltip - onBottom',
      tooltipId: 'tooltipOnBottom',
      direction: 'onBottom',
      size: 'm',
    },
    {
      text: 'Tooltip - onLeft',
      tooltipId: 'tooltipOnLeft',
      direction: 'onLeft',
      size: 'm',
    },
  ],
};

export const SizesOfTooltipGroup = MultipleTemplate.bind({});
SizesOfTooltipGroup.args = {
  components: [
    {
      text: 'Tooltip - XS',
      tooltipId: 'tooltipXS',
      direction: 'onBottom',
      size: 'xs',
    },
    {
      text: 'Tooltip - S',
      tooltipId: 'tooltipS',
      direction: 'onBottom',
      size: 's',
    },
    {
      text: 'Tooltip - M',
      tooltipId: 'tooltipM',
      direction: 'onBottom',
      size: 'm',
    },
    {
      text: 'Tooltip - L',
      tooltipId: 'tooltipL',
      direction: 'onBottom',
      size: 'l',
    },
  ],
};

export const TooltipsFullGroup = MultipleTemplate.bind({});
TooltipsFullGroup.args = {
  components: [
    {
      text: 'Tooltip - onTopL',
      tooltipId: 'tooltipOnTopL',
      direction: 'onTop',
      size: 'l',
    },
    {
      text: 'Tooltip - onRightL',
      tooltipId: 'tooltipOnRightL',
      direction: 'onRight',
      size: 'l',
    },
    {
      text: 'Tooltip - onBottomL',
      tooltipId: 'tooltipOnBottomL',
      direction: 'onBottom',
      size: 'l',
    },
    {
      text: 'Tooltip - onLeftL',
      tooltipId: 'tooltipOnLeftL',
      direction: 'onLeft',
      size: 'l',
    },
    {
      text: 'Tooltip - onTopM',
      tooltipId: 'tooltipOnTopM',
      direction: 'onTop',
      size: 'm',
    },
    {
      text: 'Tooltip - onRightM',
      tooltipId: 'tooltipOnRightM',
      direction: 'onRight',
      size: 'm',
    },
    {
      text: 'Tooltip - onBottomM',
      tooltipId: 'tooltipOnBottomM',
      direction: 'onBottom',
      size: 'm',
    },
    {
      text: 'Tooltip - onLeftM',
      tooltipId: 'tooltipOnLeftM',
      direction: 'onLeft',
      size: 'm',
    },
    {
      text: 'Tooltip - onTopS',
      tooltipId: 'tooltipOnTopS',
      direction: 'onTop',
      size: 's',
    },
    {
      text: 'Tooltip - onRightS',
      tooltipId: 'tooltipOnRightS',
      direction: 'onRight',
      size: 's',
    },
    {
      text: 'Tooltip - onBottomS',
      tooltipId: 'tooltipOnBottomS',
      direction: 'onBottom',
      size: 's',
    },
    {
      text: 'Tooltip - onLeftS',
      tooltipId: 'tooltipOnLeftS',
      direction: 'onLeft',
      size: 's',
    },
    {
      text: 'Tooltip - onTopXS',
      tooltipId: 'tooltipOnTopXS',
      direction: 'onTop',
      size: 'xs',
    },
    {
      text: 'Tooltip - onRightXS',
      tooltipId: 'tooltipOnRightXS',
      direction: 'onRight',
      size: 'xs',
    },
    {
      text: 'Tooltip - onBottomXS',
      tooltipId: 'tooltipOnBottomXS',
      direction: 'onBottom',
      size: 'xs',
    },
    {
      text: 'Tooltip - onLeftXS',
      tooltipId: 'tooltipOnLeftXS',
      direction: 'onLeft',
      size: 'xs',
    },
  ],
};
