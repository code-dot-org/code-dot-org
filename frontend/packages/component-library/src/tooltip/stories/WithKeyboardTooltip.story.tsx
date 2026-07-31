import {Button as MuiButton} from '@mui/material';
import {Meta, StoryFn} from '@storybook/react-vite';
import {within, screen, expect, waitFor, userEvent} from 'storybook/test';

import {WithKeyboardTooltip, KeyboardTooltipProps} from '../index';

export default {
  title: 'DesignSystem/KeyboardTooltip',
  component: WithKeyboardTooltip,
} as Meta;

/**
 * `userEvent` from `storybook/test` is synthetic: its `click` calls `focus()`
 * on the target, and Chromium treats programmatic focus as focus-visible. So a
 * synthetic click reports `:focus-visible === true` and cannot tell us whether
 * a real mouse opens the tooltip. Playwright's mouse can, and it is only there
 * in the vitest browser run, not in the Storybook UI. Return null when absent
 * so the story still plays for eyeballing.
 */
const getRealMouse = async () => {
  try {
    return (await import('vitest/browser')).userEvent;
  } catch {
    return null;
  }
};

const Template: StoryFn<KeyboardTooltipProps> = args => (
  <div style={{padding: '4rem 2rem'}}>
    <p>
      Tab into the button below to see the tooltip. Clicking or hovering will
      not show it.
    </p>
    <div style={{display: 'flex', gap: '1rem'}}>
      <MuiButton onClick={() => null}>Decoy button</MuiButton>
      <WithKeyboardTooltip tooltipProps={{...args}}>
        <MuiButton onClick={() => null}>Tab to me</MuiButton>
      </WithKeyboardTooltip>
      <MuiButton onClick={() => null}>Another decoy</MuiButton>
    </div>
  </div>
);

export const DefaultKeyboardTooltip = Template.bind({});
DefaultKeyboardTooltip.args = {
  text: 'Press Enter to activate',
  direction: 'onBottom',
  tooltipId: 'keyboardTooltipDefault',
};
// Runs in real Chromium, so :focus-visible works here. It does not in jsdom,
// which is why the keyboard path cannot be unit tested.
DefaultKeyboardTooltip.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const target = canvas.getByRole('button', {name: 'Tab to me'});

  expect(screen.queryByText('Press Enter to activate')).not.toBeInTheDocument();

  // First tab lands on the decoy, second on the target.
  await userEvent.tab();
  await userEvent.tab();

  expect(target).toHaveFocus();
  expect(
    await screen.findByText('Press Enter to activate'),
  ).toBeInTheDocument();
  expect(target).toHaveAttribute('aria-describedby', 'keyboardTooltipDefault');

  await userEvent.keyboard('{Escape}');

  // MUI unmounts the tooltip after its exit transition.
  await waitFor(() =>
    expect(
      screen.queryByText('Press Enter to activate'),
    ).not.toBeInTheDocument(),
  );
};

export const KeyboardNavigationHint = Template.bind({});
KeyboardNavigationHint.args = {
  text: 'Move with arrow keys',
  direction: 'onTop',
  tooltipId: 'keyboardTooltipArrows',
  size: 'l',
  iconLeft: {iconStyle: 'solid', iconName: 'keyboard'},
};
// Pointer input must never open it.
KeyboardNavigationHint.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const target = canvas.getByRole('button', {name: 'Tab to me'});

  await userEvent.hover(target);
  expect(screen.queryByText('Move with arrow keys')).not.toBeInTheDocument();

  const realMouse = await getRealMouse();
  if (realMouse) {
    await realMouse.click(target);
    expect(target).toHaveFocus();
    expect(target.matches(':focus-visible')).toBe(false);
    await expect(
      screen.queryByText('Move with arrow keys'),
    ).not.toBeInTheDocument();

    // Park the pointer off the button. The a11y addon runs axe once the play
    // finishes, and it would otherwise audit the button's hover colors.
    await realMouse.hover(canvas.getByText(/^Tab into the button/));
    target.blur();
  }
};
