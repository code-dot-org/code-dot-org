import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useRef} from 'react';

import {WithTooltip, TooltipProps, WithTooltipHandle} from './../index';

// WithTooltip is still the tooltip most of the codebase uses. These moved here
// when Tooltip.test.tsx became the MUI Tooltip's suite.
describe('Design System - WithTooltip', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup();
  });

  const renderWithTooltip = (tooltipProps: Partial<TooltipProps> = {}) =>
    render(
      <WithTooltip
        tooltipProps={{
          tooltipId: 'tooltip1',
          text: 'tooltipText',
          ...tooltipProps,
        }}
      >
        <button type="button">hover me</button>
      </WithTooltip>,
    );

  it('shows the tooltip on hover', async () => {
    renderWithTooltip();

    expect(screen.queryByText('tooltipText')).not.toBeInTheDocument();

    await user.hover(screen.getByText('hover me'));

    expect(await screen.findByText('tooltipText')).toBeInTheDocument();
  });

  it('hides the tooltip when hideTooltip is called on the ref', async () => {
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
    const trigger = screen.getByText('hover me then click me');

    await user.hover(trigger);
    expect(await screen.findByText('tooltipText')).toBeInTheDocument();

    await user.click(trigger);

    expect(screen.queryByText('tooltipText')).not.toBeInTheDocument();
  });

  it('a hideTooltip call while hidden does not swallow the next focus', async () => {
    const TestComponent = () => {
      const tooltipRef = useRef<WithTooltipHandle>(null);

      return (
        <>
          <button
            type="button"
            onClick={() => tooltipRef.current?.hideTooltip()}
          >
            hide it
          </button>
          <WithTooltip
            ref={tooltipRef}
            tooltipProps={{tooltipId: 'tooltip1', text: 'tooltipText'}}
          >
            <button type="button">focus me</button>
          </WithTooltip>
        </>
      );
    };
    render(<TestComponent />);

    // Nothing is showing, so the imperative hide must not arm the
    // refocus suppression; the next real focus still shows the tooltip.
    await user.click(screen.getByText('hide it'));
    screen.getByText('focus me').focus();

    expect(await screen.findByText('tooltipText')).toBeInTheDocument();
  });

  it.each([
    [true, true],
    [undefined, false],
  ])('hideTail %s gives a noTail class: %s', async (hideTail, hasNoTail) => {
    renderWithTooltip({hideTail});

    await user.hover(screen.getByText('hover me'));
    const tooltip = await screen.findByRole('tooltip');

    expect(/noTail/.test(tooltip.className)).toBe(hasNoTail);
  });
});
