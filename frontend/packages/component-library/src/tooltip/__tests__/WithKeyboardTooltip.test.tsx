import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {WithKeyboardTooltip, TooltipProps} from './../index';

describe('Design System - WithKeyboardTooltip', () => {
  const user = userEvent.setup();

  const renderWithKeyboardTooltip = (
    tooltipProps: Partial<TooltipProps> = {},
  ) =>
    render(
      <>
        {/* First tab lands here; second on the target. */}
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

  it('shows the tooltip on keyboard focus (Tab)', async () => {
    renderWithKeyboardTooltip();
    expect(screen.queryByText('keyboardHint')).not.toBeInTheDocument();

    await user.tab();
    await user.tab();

    expect(await screen.findByText('keyboardHint')).toBeInTheDocument();
    expect(screen.getByText('target')).toHaveFocus();
  });

  it('hides the tooltip when focus leaves the target', async () => {
    renderWithKeyboardTooltip();

    await user.tab();
    await user.tab();
    expect(await screen.findByText('keyboardHint')).toBeInTheDocument();

    await user.tab();
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

  it('hides the tooltip when Escape is pressed', async () => {
    renderWithKeyboardTooltip();

    await user.tab();
    await user.tab();
    expect(await screen.findByText('keyboardHint')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByText('keyboardHint')).not.toBeInTheDocument();
  });

  it('adds aria-describedby to the wrapped element', () => {
    renderWithKeyboardTooltip({tooltipId: 'kbd-tooltip'});

    expect(screen.getByText('target')).toHaveAttribute(
      'aria-describedby',
      'kbd-tooltip',
    );
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
