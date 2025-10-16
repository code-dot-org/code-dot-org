import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useRef} from 'react';
import '@testing-library/jest-dom';

import {WithTooltip, TooltipProps, WithTooltipHandle} from './../index';

describe('Design System - Tooltip', () => {
  const renderWithTooltip = (tooltipProps: Partial<TooltipProps>) => {
    const WithTooltipToRender: React.FC = () => (
      <WithTooltip
        tooltipProps={{
          tooltipId: 'tooltip1',
          text: 'tooltipText',
          ...tooltipProps,
        }}
      >
        <button type="button">hover me</button>
      </WithTooltip>
    );
    return render(<WithTooltipToRender />);
  };

  it('renders with correct label and shows tooltip on hover', async () => {
    const user = userEvent.setup();

    renderWithTooltip({text: 'tooltipText'});

    // Initial state: Tooltip should not be present
    const tooltipTrigger = screen.getByText('hover me');
    expect(screen.queryByText('tooltipText')).not.toBeInTheDocument();
    expect(tooltipTrigger).toBeInTheDocument();

    // Hover over the trigger to show the tooltip
    await user.hover(tooltipTrigger);

    // Tooltip should now be present
    expect(screen.getByText('tooltipText')).toBeInTheDocument();
  });

  it('can hide the tooltip imperatively using the hideTooltip method', async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const tooltipRef = useRef<WithTooltipHandle>(null);

      return (
        <WithTooltip
          ref={tooltipRef}
          tooltipProps={{
            tooltipId: 'tooltip1',
            text: 'tooltipText',
            direction: 'onTop',
            size: 'm',
          }}
        >
          <button
            type="button"
            onClick={() => tooltipRef.current?.hideTooltip()}
          >
            hover me then click me
          </button>
        </WithTooltip>
      );
    };

    render(<TestComponent />);

    const tooltipTrigger = screen.getByText('hover me then click me');

    // Hover to show the tooltip
    await user.hover(tooltipTrigger);
    expect(await screen.findByText('tooltipText')).toBeInTheDocument();

    // Click to hide tooltip via imperative ref.
    await user.click(tooltipTrigger);

    // Tooltip should be removed
    expect(screen.queryByText('tooltipText')).not.toBeInTheDocument();
  });

  it('applies the "noTail" class if hideTail prop is set to true', async () => {
    const user = userEvent.setup();

    // Tooltip without tail
    renderWithTooltip({tooltipId: 'tooltipWithoutTail', hideTail: true});
    const triggerWithoutTail = screen.getByText('hover me');
    await user.hover(triggerWithoutTail);
    const tooltipWithoutTail = await screen.findByRole('tooltip');
    expect(tooltipWithoutTail.className).toMatch(/noTail/);
  });

  it('omits the "noTail" class if hideTail prop is not included', async () => {
    const user = userEvent.setup();

    // Tooltip with default tail (hideTail undefined)
    renderWithTooltip({tooltipId: 'tooltipWithTail'});
    const triggerWithTail = screen.getByText('hover me');
    await user.hover(triggerWithTail);
    const tooltipWithTail = await screen.findByRole('tooltip');

    expect(tooltipWithTail.className).not.toMatch(/noTail/);
  });
});
