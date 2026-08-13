import {Tooltip as MuiTooltip, ThemeProvider, createTheme} from '@mui/material';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createRef} from 'react';
import {vi} from 'vitest';

import CdoTheme from '@/themes/code.org';

import {Tooltip, CdoTooltipProps} from './../index';

/**
 * jsdom treats every focus as a keyboard focus, clicks included, so testing
 * "a click leaves it shut" means stubbing `Element.matches`. Check it for real
 * in a browser too.
 *
 * `role="tooltip"` is on MUI's popper. The bubble we style is
 * `.MuiTooltip-tooltip` inside it, and it carries our attributes.
 */
describe('Design System - Tooltip (MUI)', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup();
  });

  // A plain <button>, because MUI's button styles crash getComputedStyle here.
  const renderTooltip = (props: Partial<CdoTooltipProps> = {}) =>
    render(
      <ThemeProvider theme={CdoTheme}>
        <Tooltip title="tooltipText" {...props}>
          <button type="button">trigger</button>
        </Tooltip>
      </ThemeProvider>,
    );

  const renderKeyboardOnly = (props: Partial<CdoTooltipProps> = {}) =>
    renderTooltip({keyboardOnly: true, ...props});

  /** The styled tooltip bubble, as opposed to the popper wrapping it. */
  const findTooltipBubble = async () => {
    await screen.findByRole('tooltip');
    const bubble = document.querySelector('.MuiTooltip-tooltip');
    expect(bubble).not.toBeNull();
    return bubble as HTMLElement;
  };

  describe('default behavior, without keyboardOnly', () => {
    it('opens on hover', async () => {
      renderTooltip();

      await user.hover(screen.getByRole('button'));

      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'tooltipText',
      );
    });

    it('still opens on keyboard focus', async () => {
      renderTooltip();

      await user.tab();

      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });

    it('carries a native title attribute as a fallback', () => {
      // describeChild adds this, and MUI removes it again on mouseover.
      renderTooltip();

      expect(screen.getByRole('button')).toHaveAttribute(
        'title',
        'tooltipText',
      );
    });

    // The caret is on by default; hasCaret (our alias for `arrow`) toggles it.
    it.each([
      [true, {}],
      [true, {hasCaret: true}],
      [false, {hasCaret: false}],
      [false, {arrow: false}],
    ] as const)('caret present=%s for %o', async (shown, props) => {
      renderTooltip(props);

      await user.hover(screen.getByRole('button'));
      await screen.findByRole('tooltip');

      expect(!!document.querySelector('.MuiTooltip-arrow')).toBe(shown);
    });

    it('forwards a ref to the trigger, as MUI does', () => {
      const ref = createRef<HTMLButtonElement>();
      renderTooltip({ref});

      expect(ref.current).toBe(screen.getByRole('button'));
    });
  });

  it('lets keyboardOnly win over every conflicting listener prop', async () => {
    renderKeyboardOnly({
      disableHoverListener: false,
      disableTouchListener: false,
      disableFocusListener: true,
    });

    await user.hover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // disableFocusListener would otherwise leave it unopenable.
    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('opens on keyboard focus', async () => {
    renderKeyboardOnly();

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.tab();

    expect(screen.getByRole('button', {name: 'trigger'})).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('tooltipText');
  });

  it('stays closed on touch', () => {
    // Fired directly, because userEvent's tap also moves focus.
    vi.useFakeTimers();
    try {
      renderKeyboardOnly();

      fireEvent.touchStart(screen.getByRole('button'));
      // MUI's touch path waits out enterTouchDelay (700ms).
      act(() => vi.advanceTimersByTime(1000));

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('stays closed when focus is not focus-visible', async () => {
    // Stand-in for a mouse click.
    const realMatches = Element.prototype.matches;
    const matches = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':focus-visible'
          ? false
          : realMatches.call(this, selector);
      });

    try {
      renderKeyboardOnly();

      await user.tab();

      expect(screen.getByRole('button')).toHaveFocus();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    } finally {
      matches.mockRestore();
    }
  });

  it('closes on Escape while the trigger keeps focus', async () => {
    renderKeyboardOnly();

    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('describes the trigger instead of renaming it, and adds no title attribute', async () => {
    renderKeyboardOnly();

    const trigger = screen.getByRole('button', {name: 'trigger'});
    // A `title` would give mouse users a native tooltip anyway.
    expect(trigger).not.toHaveAttribute('title');
    expect(trigger).not.toHaveAttribute('aria-label');

    await user.tab();

    const popper = await screen.findByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', popper.id);
    // The trigger's own name survives.
    expect(screen.getByRole('button', {name: 'trigger'})).toBe(trigger);
  });

  it('marks the tooltip so the themed styles apply to it', async () => {
    renderKeyboardOnly();

    await user.tab();

    expect(await findTooltipBubble()).toHaveAttribute('data-cdo-tooltip');
  });

  it('puts data-theme on the tooltip, not on the trigger', async () => {
    renderKeyboardOnly({'data-theme': 'Dark'});

    expect(screen.getByRole('button')).not.toHaveAttribute('data-theme');

    await user.tab();

    expect(await findTooltipBubble()).toHaveAttribute('data-theme', 'Dark');
  });

  it('keeps caller tooltip slotProps given as an object', async () => {
    renderKeyboardOnly({
      'data-theme': 'Dark',
      slotProps: {tooltip: {className: 'callerClass'}},
    });

    await user.tab();

    const bubble = await findTooltipBubble();
    expect(bubble).toHaveClass('callerClass');
    expect(bubble).toHaveAttribute('data-cdo-tooltip');
    expect(bubble).toHaveAttribute('data-theme', 'Dark');
  });

  // MUI only falls back to the deprecated componentsProps when slotProps is
  // absent, and we always set slotProps.tooltip, so we do the fallback here.
  it('keeps caller tooltip props given the deprecated componentsProps', async () => {
    renderKeyboardOnly({
      componentsProps: {tooltip: {className: 'callerClass'}},
    });

    await user.tab();

    const bubble = await findTooltipBubble();
    expect(bubble).toHaveClass('callerClass');
    expect(bubble).toHaveAttribute('data-cdo-tooltip');
  });

  it('prefers slotProps over componentsProps, as MUI does', async () => {
    renderKeyboardOnly({
      slotProps: {tooltip: {className: 'fromSlotProps'}},
      componentsProps: {tooltip: {className: 'fromComponentsProps'}},
    });

    await user.tab();

    const bubble = await findTooltipBubble();
    expect(bubble).toHaveClass('fromSlotProps');
    expect(bubble).not.toHaveClass('fromComponentsProps');
  });

  it('keeps caller tooltip slotProps given as a function', async () => {
    renderKeyboardOnly({
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

  it("does not swallow the child's own focus and blur handlers", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
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
    renderKeyboardOnly({title: ''});

    await user.tab();

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  describe('iconName', () => {
    const findIcon = (bubble: HTMLElement) =>
      bubble.querySelector('[data-testid="font-awesome-v6-icon"]');

    it('renders a leading icon before the text when iconName is set', async () => {
      renderTooltip({iconName: 'circle-info'});

      await user.hover(screen.getByRole('button'));
      const bubble = await findTooltipBubble();

      const icon = findIcon(bubble);
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('fa-circle-info', 'fa-solid');
      expect(bubble).toHaveTextContent('tooltipText');
    });

    it('renders no icon when iconName is unset', async () => {
      renderTooltip();

      await user.hover(screen.getByRole('button'));
      const bubble = await findTooltipBubble();

      expect(findIcon(bubble)).toBeNull();
    });

    it('still renders nothing for an empty title, even with an icon', async () => {
      renderKeyboardOnly({title: '', iconName: 'circle-info'});

      await user.tab();

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  // Plain MUI tooltips elsewhere in the app must look and act as they did
  // before. Delete this block once every tooltip is ours.
  describe('leaves a bare MUI Tooltip alone', () => {
    const renderBareMui = () =>
      render(
        <ThemeProvider theme={CdoTheme}>
          <MuiTooltip title="tooltipText">
            <button type="button">trigger</button>
          </MuiTooltip>
        </ThemeProvider>,
      );

    it('adds no caret', async () => {
      renderBareMui();

      await user.hover(screen.getByRole('button'));
      await screen.findByRole('tooltip');

      expect(document.querySelector('.MuiTooltip-arrow')).toBeNull();
    });

    it("keeps MUI's naming, renaming the trigger rather than describing it", async () => {
      renderBareMui();

      await user.hover(screen.getByRole('button'));
      await screen.findByRole('tooltip');

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'tooltipText',
      );
      expect(screen.getByRole('button')).not.toHaveAttribute(
        'aria-describedby',
      );
    });

    it("keeps MUI's own styling", async () => {
      renderBareMui();

      await user.hover(screen.getByRole('button'));
      const bubble = await findTooltipBubble();

      expect(bubble).not.toHaveAttribute('data-cdo-tooltip');
      expect(getComputedStyle(bubble).backgroundColor).not.toBe(
        'var(--background-neutral-primary-inverse)',
      );
      expect(getComputedStyle(bubble).display).not.toBe('flex');
    });
  });

  describe('right-to-left', () => {
    const placementOf = async () =>
      (await screen.findByRole('tooltip')).getAttribute(
        'data-popper-placement',
      );

    afterEach(() => {
      document.documentElement.dir = '';
    });

    // Plain left and right stay put, as they do in MUI: physical means physical.
    it.each([
      ['bottom-start', 'bottom-end'],
      ['bottom-end', 'bottom-start'],
      ['top-start', 'top-end'],
      ['top-end', 'top-start'],
      ['left', 'left'],
    ] as const)('places %s at %s', async (placement, mirrored) => {
      document.documentElement.dir = 'rtl';
      renderTooltip({placement});

      await user.hover(screen.getByRole('button'));

      expect(await placementOf()).toBe(mirrored);
    });

    it('leaves placements alone in a left-to-right document', async () => {
      renderTooltip({placement: 'bottom-start'});

      await user.hover(screen.getByRole('button'));

      expect(await placementOf()).toBe('bottom-start');
    });

    // Otherwise MUI would mirror it and so would we, cancelling out.
    it('mirrors once, not twice, when the theme is right-to-left too', async () => {
      document.documentElement.dir = 'rtl';
      render(
        <ThemeProvider theme={createTheme(CdoTheme, {direction: 'rtl'})}>
          <Tooltip title="tooltipText" placement="bottom-start">
            <button type="button">trigger</button>
          </Tooltip>
        </ThemeProvider>,
      );

      await user.hover(screen.getByRole('button'));

      expect(await placementOf()).toBe('bottom-end');
    });
  });

  describe('themed styles', () => {
    it('styles the tooltip with our color and shape tokens', async () => {
      renderTooltip();

      await user.tab();
      const bubble = await findTooltipBubble();
      const arrow = document.querySelector('.MuiTooltip-arrow') as HTMLElement;

      expect(getComputedStyle(bubble).backgroundColor).toBe(
        'var(--background-neutral-primary-inverse)',
      );
      expect(getComputedStyle(bubble).color).toBe(
        'var(--text-neutral-inverse)',
      );
      expect(getComputedStyle(bubble).borderRadius).toBe('var(--shape-sm)');
      expect(getComputedStyle(bubble).boxShadow).toBe('var(--shadow-md)');
      // MUI fills the arrow from currentColor, so this is the background.
      expect(getComputedStyle(arrow).color).toBe(
        'var(--background-neutral-primary-inverse)',
      );
    });

    // One fixed size: the theme's body2 text and its arrow.
    it('uses the body2 text and arrow metrics', async () => {
      renderTooltip();

      await user.tab();
      const bubble = await findTooltipBubble();
      const arrow = document.querySelector('.MuiTooltip-arrow') as HTMLElement;

      expect(getComputedStyle(bubble).fontSize).toBe('1rem');
      expect(getComputedStyle(bubble).lineHeight).toBe('1.48');
      expect(getComputedStyle(arrow).fontSize).toBe('0.75rem');
    });
  });
});
