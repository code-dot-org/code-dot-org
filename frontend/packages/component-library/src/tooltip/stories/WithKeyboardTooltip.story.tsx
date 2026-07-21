import {Meta, StoryFn} from '@storybook/react-vite';

import {Button} from '@/button';

import Tooltip, {TooltipProps, WithKeyboardTooltip} from '../index';

export default {
  title: 'DesignSystem/KeyboardTooltip',
  component: Tooltip,
} as Meta;

const Template: StoryFn<TooltipProps> = args => (
  <div style={{padding: '4rem 2rem'}}>
    <p>
      Tab into the button below to see the tooltip. Clicking or hovering will
      not show it.
    </p>
    <div style={{display: 'flex', gap: '1rem'}}>
      <Button onClick={() => null} text="Decoy button" />
      <WithKeyboardTooltip tooltipProps={{...args}}>
        <Button onClick={() => null} text="Tab to me" />
      </WithKeyboardTooltip>
      <Button onClick={() => null} text="Another decoy" />
    </div>
  </div>
);

export const DefaultKeyboardTooltip = Template.bind({});
DefaultKeyboardTooltip.args = {
  text: 'Press Enter to activate',
  direction: 'onBottom',
  tooltipId: 'keyboardTooltipDefault',
};

export const KeyboardNavigationHint = Template.bind({});
KeyboardNavigationHint.args = {
  text: 'Move with arrow keys',
  direction: 'onTop',
  tooltipId: 'keyboardTooltipArrows',
  size: 'l',
  iconLeft: {iconStyle: 'solid', iconName: 'keyboard'},
};
