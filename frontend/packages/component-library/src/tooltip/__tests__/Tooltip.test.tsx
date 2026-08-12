import {ThemeProvider} from '@mui/material';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';

import CdoTheme from '@/themes/code.org';

import {Tooltip, CdoTooltipProps} from './../index';

/**
 * A note on `:focus-visible` coverage. jsdom implements the selector but
 * reports every focused element as focus-visible, mouse clicks included, so
 * "click the trigger and the tooltip stays shut" cannot be observed here
 * directly. The same goes for a tap on a touch device, which focuses the
 * trigger without making the focus visible. The test that stubs
 * `Element.matches` stands in for both: it checks that we leave MUI's
 * focus-visible gate in place rather than opening on any focus. Confirm the
 * real click and tap behavior in a browser.
 *
 * On the DOM shape: `role="tooltip"` sits on MUI's Popper, which is also what
 * carries the id referenced by `aria-describedby`. The styled tooltip bubble is
 * the `.MuiTooltip-tooltip` element inside it, so that is where `data-size` and
 * `data-theme` land.
 */
describe('Design System - Tooltip (MUI)', () => {
  // Most of what follows is about keyboardOnly, so the shared helper sets it.
  // The "default behavior" block below renders without it.
  const renderTooltip = (props: Partial<CdoTooltipProps> = {}) =>
    render(
      <Tooltip title="tooltipText" keyboardOnly {...props}>
        <button type="button">trigger</button>
      </Tooltip>,
    );

  /** The styled tooltip bubble, as opposed to the popper wrapping it. */
  const findTooltipBubble = async () => {
    await screen.findByRole('tooltip');
    const bubble = document.querySelector('.MuiTooltip-tooltip');
    expect(bubble).not.toBeNull();
    return bubble as HTMLElement;
  };

  describe('default behavior, without keyboardOnly', () => {
    const renderPlain = (props: Partial<CdoTooltipProps> = {}) =>
      render(
        <Tooltip title="tooltipText" {...props}>
          <button type="button">trigger</button>
        </Tooltip>,
      );

    it('opens on hover', async () => {
      const user = userEvent.setup();
      renderPlain();

      await user.hover(screen.getByRole('button'));

      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'tooltipText',
      );
    });

    it('still opens on keyboard focus', async () => {
      const user = userEvent.setup();
      renderPlain();

      await user.tab();

      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });

    it('carries a native title attribute as a fallback', () => {
      // MUI's describeChild behavior. It strips the attribute on mouseover
      // before showing its own tooltip. keyboardOnly suppresses it entirely,
      // which is what the "adds no title attribute" test below checks.
      renderPlain();

      expect(screen.getByRole('button')).toHaveAttribute(
        'title',
        'tooltipText',
      );
    });

    it('lets keyboardOnly win over an explicit disableHoverListener', async () => {
      const user = userEvent.setup();
      renderPlain({keyboardOnly: true, disableHoverListener: false});

      await user.hover(screen.getByRole('button'));

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('opens on keyboard focus', async () => {
    const user = userEvent.setup();
    renderTooltip();

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.tab();

    expect(screen.getByRole('button', {name: 'trigger'})).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('tooltipText');
  });

  it('stays closed on hover', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.hover(screen.getByRole('button'));

    // MUI's tooltip has no enter delay by default, so nothing is pending.
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('stays closed on touch', () => {
    // Fire the touch events directly rather than through userEvent's tap, which
    // also focuses the trigger and so runs into the jsdom caveat above.
    vi.useFakeTimers();
    try {
      renderTooltip();

      fireEvent.touchStart(screen.getByRole('button'));
      // MUI's touch path waits out enterTouchDelay (700ms) before opening.
      act(() => vi.advanceTimersByTime(1000));

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('stays closed when focus is not focus-visible', async () => {
    // Stand-in for a mouse click: the platform reports the focus as not
    // visible, and MUI's gate should keep the tooltip shut.
    const realMatches = Element.prototype.matches;
    const matches = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':focus-visible'
          ? false
          : realMatches.call(this, selector);
      });

    try {
      const user = userEvent.setup();
      renderTooltip();

      await user.tab();

      expect(screen.getByRole('button')).toHaveFocus();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    } finally {
      matches.mockRestore();
    }
  });

  it('closes on blur', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();

    await user.tab();

    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  });

  it('closes on Escape while the trigger keeps focus', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('describes the trigger instead of renaming it, and adds no title attribute', async () => {
    const user = userEvent.setup();
    renderTooltip();

    const trigger = screen.getByRole('button', {name: 'trigger'});
    // A `title` attribute would give mouse users a native tooltip, defeating
    // the point of this component.
    expect(trigger).not.toHaveAttribute('title');
    expect(trigger).not.toHaveAttribute('aria-label');

    await user.tab();

    const popper = await screen.findByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', popper.id);
    // The trigger's own name survives.
    expect(screen.getByRole('button', {name: 'trigger'})).toBe(trigger);
  });

  it('renames the trigger when describeChild is false', async () => {
    const user = userEvent.setup();
    renderTooltip({describeChild: false});

    await user.tab();

    await screen.findByRole('tooltip');
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'tooltipText',
    );
  });

  it.each(['xs', 's', 'm', 'l'] as const)(
    'passes size "%s" to the tooltip slot',
    async size => {
      const user = userEvent.setup();
      renderTooltip({size});

      await user.tab();

      expect(await findTooltipBubble()).toHaveAttribute('data-size', size);
    },
  );

  it('defaults to size "m"', async () => {
    const user = userEvent.setup();
    renderTooltip();

    await user.tab();

    expect(await findTooltipBubble()).toHaveAttribute('data-size', 'm');
  });

  it('puts data-theme on the tooltip, not on the trigger', async () => {
    const user = userEvent.setup();
    renderTooltip({'data-theme': 'Dark'});

    expect(screen.getByRole('button')).not.toHaveAttribute('data-theme');

    await user.tab();

    expect(await findTooltipBubble()).toHaveAttribute('data-theme', 'Dark');
  });

  it('keeps caller tooltip slotProps given as an object', async () => {
    const user = userEvent.setup();
    renderTooltip({
      'data-theme': 'Dark',
      slotProps: {tooltip: {className: 'callerClass'}},
    });

    await user.tab();

    const bubble = await findTooltipBubble();
    expect(bubble).toHaveClass('callerClass');
    expect(bubble).toHaveAttribute('data-size', 'm');
    expect(bubble).toHaveAttribute('data-theme', 'Dark');
  });

  it('keeps caller tooltip slotProps given as a function', async () => {
    const user = userEvent.setup();
    renderTooltip({
      'data-theme': 'Dark',
      slotProps: {
        tooltip: ownerState => ({
          className: `placement-${ownerState.placement}`,
        }),
      },
    });

    await user.tab();

    const bubble = await findTooltipBubble();
    expect(bubble).toHaveClass('placement-bottom');
    expect(bubble).toHaveAttribute('data-theme', 'Dark');
  });

  it('keeps the caller className passed via classes.tooltip', async () => {
    const user = userEvent.setup();
    renderTooltip({size: 's', classes: {tooltip: 'callerClass'}});

    await user.tab();

    const bubble = await findTooltipBubble();
    expect(bubble).toHaveClass('callerClass');
    expect(bubble).toHaveAttribute('data-size', 's');
  });

  it("does not swallow the child's own focus and blur handlers", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const user = userEvent.setup();

    render(
      <Tooltip title="tooltipText">
        <button type="button" onFocus={onFocus} onBlur={onBlur}>
          trigger
        </button>
      </Tooltip>,
    );

    await user.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('renders nothing for an empty title', async () => {
    const user = userEvent.setup();
    renderTooltip({title: ''});

    await user.tab();

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  /**
   * The trigger here is a plain <button> rather than an MUI one on purpose.
   * Rendering an MUI Button injects the MuiButton overrides, whose
   * `:not(:has(...))` selectors crash jsdom's selector engine as soon as
   * anything calls getComputedStyle.
   */
  describe('under CdoTheme', () => {
    const renderThemed = (props: Partial<CdoTooltipProps> = {}) =>
      render(
        <ThemeProvider theme={CdoTheme}>
          <Tooltip title="tooltipText" {...props}>
            <button type="button">trigger</button>
          </Tooltip>
        </ThemeProvider>,
      );

    it('styles the tooltip with our color and shape tokens', async () => {
      const user = userEvent.setup();
      renderThemed();

      await user.tab();
      const bubble = await findTooltipBubble();
      const arrow = document.querySelector('.MuiTooltip-arrow') as HTMLElement;

      expect(getComputedStyle(bubble).backgroundColor).toBe(
        'var(--background-neutral-primary-inverse)',
      );
      expect(getComputedStyle(bubble).color).toBe(
        'var(--text-neutral-inverse)',
      );
      expect(getComputedStyle(bubble).borderRadius).toBe('0.25rem');
      // MUI fills the arrow from currentColor, so this has to match the
      // tooltip's background rather than its text color.
      expect(getComputedStyle(arrow).color).toBe(
        'var(--background-neutral-primary-inverse)',
      );
    });

    it.each([
      ['xs', 'var(--font-size-body-xs)', '1.64', '0.5rem'],
      ['s', 'var(--font-size-body-sm)', '1.54', '0.625rem'],
      ['m', 'var(--font-size-body-md)', '1.48', '0.75rem'],
      ['l', 'var(--font-size-body-lg)', '1.4', '1rem'],
    ] as const)(
      'gives size "%s" its own text and arrow metrics',
      async (size, fontSize, lineHeight, arrowFontSize) => {
        const user = userEvent.setup();
        renderThemed({size});

        await user.tab();
        const bubble = await findTooltipBubble();
        const arrow = document.querySelector(
          '.MuiTooltip-arrow',
        ) as HTMLElement;

        expect(getComputedStyle(bubble).fontSize).toBe(fontSize);
        expect(getComputedStyle(bubble).lineHeight).toBe(lineHeight);
        expect(getComputedStyle(arrow).fontSize).toBe(arrowFontSize);
      },
    );
  });
});
