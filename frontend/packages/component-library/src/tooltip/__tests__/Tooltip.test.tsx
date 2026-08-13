/**
 * The tooltip migration is theme-only: there is no wrapper in src/tooltip/.
 * Every test renders a bare `Tooltip` from `@mui/material`; what styles and
 * configures it is the `MuiTooltip` entry in
 * src/themes/code.org/styleOverrides/tooltip.ts, registered on CdoTheme.
 *
 * jsdom treats every focus as a keyboard focus, clicks included, so a true
 * "a click leaves it shut" check needs a browser.
 */
import {Tooltip as MuiTooltip, ThemeProvider, createTheme} from '@mui/material';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CdoTheme from '@/themes/code.org';

import {keyboardOnlyTooltipProps} from './../index';

const BACKGROUND = 'var(--background-neutral-primary-inverse)';
const FOREGROUND = 'var(--text-neutral-primary-inverse)';

describe('Design System - Tooltip (theme-only)', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup();
  });

  const renderTooltip = (
    props: Record<string, unknown> = {},
    child?: React.ReactElement,
    theme = CdoTheme,
  ) =>
    render(
      <ThemeProvider theme={theme}>
        <MuiTooltip title="tooltipText" {...props}>
          {child ?? <button type="button">trigger</button>}
        </MuiTooltip>
      </ThemeProvider>,
    );

  const openAndGetBubble = async () => {
    await user.hover(screen.getByRole('button'));
    await screen.findByRole('tooltip');
    return document.querySelector('.MuiTooltip-tooltip') as HTMLElement;
  };

  describe('styles a bare MUI tooltip from the theme', () => {
    it('uses our CADS color, shape, and shadow tokens', async () => {
      renderTooltip();
      const s = getComputedStyle(await openAndGetBubble());

      expect(s.backgroundColor).toBe(BACKGROUND);
      expect(s.color).toBe(FOREGROUND);
      expect(s.borderRadius).toBe('var(--shape-sm)');
      expect(s.boxShadow).toBe('var(--shadow-md)');
      expect(s.maxWidth).toBe('16rem');
      expect(s.paddingTop).toBe('0.25rem');
      expect(s.paddingLeft).toBe('0.75rem');
      expect(s.textAlign).toBe('left');
    });

    it('is one fixed size, the theme body3', async () => {
      renderTooltip();
      const s = getComputedStyle(await openAndGetBubble());
      expect(s.fontSize).toBe('0.875rem');
      expect(s.lineHeight).toBe('1.54');
    });

    it('sizes the arrow, which MUI measures in em', async () => {
      renderTooltip();
      await openAndGetBubble();
      const arrow = document.querySelector('.MuiTooltip-arrow') as HTMLElement;
      expect(getComputedStyle(arrow).fontSize).toBe('0.5rem');
      expect(getComputedStyle(arrow).color).toBe(BACKGROUND);
    });

    it('needs no marker attribute', async () => {
      renderTooltip();
      const bubble = await openAndGetBubble();
      expect(bubble).not.toHaveAttribute('data-cdo-tooltip');
      expect(bubble).not.toHaveAttribute('data-size');
    });
  });

  describe('flipped defaults, from defaultProps not JSX', () => {
    it('shows a tail by default', async () => {
      renderTooltip();
      await openAndGetBubble();
      expect(document.querySelector('.MuiTooltip-arrow')).not.toBeNull();
    });

    it('drops the tail with arrow={false}', async () => {
      renderTooltip({arrow: false});
      await openAndGetBubble();
      expect(document.querySelector('.MuiTooltip-arrow')).toBeNull();
    });

    it('describes the trigger rather than naming it', async () => {
      renderTooltip();
      await openAndGetBubble();
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-describedby');
      expect(trigger).not.toHaveAttribute('aria-label');
    });
  });

  it('sizes a leading icon composed into the title', async () => {
    renderTooltip({
      title: (
        <>
          <i className="fa-solid fa-circle-info" />
          text
        </>
      ),
    });
    await openAndGetBubble();
    const icon = document.querySelector('.MuiTooltip-tooltip i') as HTMLElement;
    expect(getComputedStyle(icon).width).toBe('0.875rem');
  });

  describe('keyboardOnlyTooltipProps', () => {
    it('opens on Tab, not on hover', async () => {
      renderTooltip(keyboardOnlyTooltipProps);

      await user.hover(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).toBeNull();

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('renders nothing for an empty title', async () => {
    renderTooltip({title: ''});
    await user.hover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // MUI mirrors -start/-end placements once the theme has a direction. CdoTheme
  // sets none today (a follow-up), so this passes a directional theme.
  it('mirrors -start/-end placements in a right-to-left theme', async () => {
    const rtlTheme = createTheme(CdoTheme, {direction: 'rtl'});
    renderTooltip({placement: 'bottom-start'}, undefined, rtlTheme);

    await user.hover(screen.getByRole('button'));
    const popper = await screen.findByRole('tooltip');
    expect(popper.closest('[data-popper-placement]')).toHaveAttribute(
      'data-popper-placement',
      'bottom-end',
    );
  });

  // The point of dropping the marker: a plain MUI tooltip with no design-system
  // props (Sketch Lab's, say) now gets the design system look too.
  it('styles a tooltip that sets no design-system props at all', async () => {
    render(
      <ThemeProvider theme={CdoTheme}>
        <MuiTooltip title="Duplicate" placement="top">
          <button type="button">trigger</button>
        </MuiTooltip>
      </ThemeProvider>,
    );
    const bubble = await openAndGetBubble();
    expect(getComputedStyle(bubble).backgroundColor).toBe(BACKGROUND);
    expect(document.querySelector('.MuiTooltip-arrow')).not.toBeNull();
  });
});
