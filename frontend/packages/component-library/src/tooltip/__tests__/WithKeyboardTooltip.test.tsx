import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {WithKeyboardTooltip, KeyboardTooltipProps} from './../index';

// jsdom does not implement `:focus-visible` — `matches(':focus-visible')` is
// always false — and MUI's Tooltip gates its focus handler on it. So the
// open-on-keyboard-focus behavior cannot be tested here; the play functions in
// stories/WithKeyboardTooltip.story.tsx cover it in real Chromium.
// What is left to check here is that pointer input never opens the tooltip.
describe('Design System - WithKeyboardTooltip', () => {
  const user = userEvent.setup();

  const renderWithKeyboardTooltip = (
    tooltipProps: Partial<KeyboardTooltipProps> = {},
  ) =>
    render(
      <>
        <button type="button">first</button>
        <WithKeyboardTooltip
          tooltipProps={{
            tooltipId: 'kbd-tooltip',
            text: 'keyboardHint',
            ...tooltipProps,
          }}
        >
          <button type="button">target</button>
        </WithKeyboardTooltip>
      </>,
    );

  it('does not show the tooltip on first render', () => {
    renderWithKeyboardTooltip();

    expect(screen.queryByText('keyboardHint')).not.toBeInTheDocument();
  });

  it('does not show the tooltip when the target is clicked with a mouse', async () => {
    renderWithKeyboardTooltip();

    await user.click(screen.getByText('target'));

    expect(screen.getByText('target')).toHaveFocus();
    expect(screen.queryByText('keyboardHint')).not.toBeInTheDocument();
  });

  it('does not show the tooltip on hover', async () => {
    renderWithKeyboardTooltip();

    await user.hover(screen.getByText('target'));

    expect(screen.queryByText('keyboardHint')).not.toBeInTheDocument();
  });

  it('does not add a title attribute that would show a native tooltip', () => {
    renderWithKeyboardTooltip();

    expect(screen.getByText('target')).not.toHaveAttribute('title');
  });

  it('preserves the original onFocus handler on the child', async () => {
    const onFocus = vi.fn();
    render(
      <>
        <button type="button">first</button>
        <WithKeyboardTooltip
          tooltipProps={{tooltipId: 'kbd-tooltip', text: 'keyboardHint'}}
        >
          <button type="button" onFocus={onFocus}>
            target
          </button>
        </WithKeyboardTooltip>
      </>,
    );

    await user.tab();
    await user.tab();

    expect(onFocus).toHaveBeenCalledTimes(1);
  });
});
