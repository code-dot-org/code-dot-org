/**
 * PoC for PR #74565: the tooltip migration as a theme entry alone.
 *
 * Every test here renders a bare `Tooltip` from `@mui/material` — nothing from
 * `src/tooltip/` is imported. What styles and configures it is the `MuiTooltip`
 * entry that src/themes/code.org/styleOverrides/tooltip.ts registers on
 * CdoTheme.
 */
import {
  Tooltip as MuiTooltip,
  ThemeProvider,
  createTheme,
  IconButton,
} from '@mui/material';
import type {Components, Theme} from '@mui/material/styles';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CdoTheme from '@/themes/code.org';

const BACKGROUND = 'var(--background-neutral-primary-inverse)';

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

const openAndGetBubble = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.hover(screen.getByRole('button'));
  await screen.findByRole('tooltip');
  return document.querySelector('.MuiTooltip-tooltip') as HTMLElement;
};

describe('PoC: theme-only tooltip', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('what the theme supplies on its own', () => {
    it('styles a bare MUI Tooltip, with no marker attribute needed', async () => {
      renderTooltip();
      const bubble = await openAndGetBubble(user);
      const styles = getComputedStyle(bubble);
      expect(styles.backgroundColor).toBe(BACKGROUND);
      expect(styles.borderRadius).toBe('0.25rem');
      expect(styles.maxWidth).toBe('16rem');
      expect(bubble).not.toHaveAttribute('data-cdo-tooltip');
      expect(bubble).not.toHaveAttribute('data-size');
    });

    it('sizes the text from an augmented size prop, read off ownerState', async () => {
      renderTooltip({size: 's'});
      // body3
      expect(getComputedStyle(await openAndGetBubble(user)).fontSize).toBe(
        '0.875rem',
      );
    });

    it('falls back to m when no size is given', async () => {
      renderTooltip();
      // body2
      expect(getComputedStyle(await openAndGetBubble(user)).fontSize).toBe(
        '1rem',
      );
    });

    it('sizes the arrow per size, since MUI measures it in em', async () => {
      renderTooltip({size: 'l'});
      await openAndGetBubble(user);
      const arrow = document.querySelector('.MuiTooltip-arrow') as HTMLElement;
      expect(getComputedStyle(arrow).fontSize).toBe('1rem');
      expect(getComputedStyle(arrow).color).toBe(BACKGROUND);
    });

    it('flips arrow and describeChild from defaultProps, not from JSX', async () => {
      renderTooltip();
      await openAndGetBubble(user);
      expect(document.querySelector('.MuiTooltip-arrow')).not.toBeNull();
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-describedby');
      expect(trigger).not.toHaveAttribute('aria-label');
    });

    it('sizes a leading icon in the title', async () => {
      renderTooltip({
        size: 'l',
        title: (
          <>
            <i className="fa-solid fa-circle-info" />
            text
          </>
        ),
      });
      await openAndGetBubble(user);
      const icon = document.querySelector(
        '.MuiTooltip-tooltip i',
      ) as HTMLElement;
      expect(getComputedStyle(icon).width).toBe('1.25rem');
    });
  });

  describe('behavior that needs no wrapper, only native props', () => {
    it('is keyboard-only with disableHoverListener + disableTouchListener', async () => {
      renderTooltip({disableHoverListener: true, disableTouchListener: true});
      await user.hover(screen.getByRole('button'));
      expect(screen.queryByRole('tooltip')).toBeNull();

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
      await screen.findByRole('tooltip');
    });

    it('mirrors -start/-end placements itself once the theme has a direction', async () => {
      const rtlTheme = createTheme(CdoTheme, {direction: 'rtl'});
      renderTooltip({placement: 'bottom-start'}, undefined, rtlTheme);
      await user.hover(screen.getByRole('button'));
      const popper = await screen.findByRole('tooltip');
      // MUI wires RtlProvider off theme.direction, so it flips this for us and
      // the hand-rolled mirroring in Tooltip.tsx becomes redundant.
      expect(popper.closest('[data-popper-placement]')).toHaveAttribute(
        'data-popper-placement',
        'bottom-end',
      );
    });
  });

  describe('the cost: MUI copies unknown props onto the cloned trigger', () => {
    it('is free for a DOM trigger — React drops an unknown size', () => {
      renderTooltip({size: 's'});
      expect(screen.getByRole('button')).not.toHaveAttribute('size');
    });

    it('is free for an MUI trigger that sets its own size', () => {
      renderTooltip(
        {size: 's'},
        <IconButton size="small" aria-label="Run">
          icon
        </IconButton>,
      );
      // MUI spreads children.props after its own, so the child wins.
      expect(screen.getByRole('button').className).toContain('sizeSmall');
    });

    it('costs an unsized MUI trigger its size class', () => {
      renderTooltip(
        {size: 's'},
        <IconButton aria-label="Run">icon</IconButton>,
      );
      const {className} = screen.getByRole('button');
      expect(className).toContain('sizeS'); // a dead class
      expect(className).not.toContain('sizeMedium');
    });

    it('is avoidable entirely by naming the prop data-size', async () => {
      const dataSizeOverrides: Components<Theme>['MuiTooltip'] = {
        styleOverrides: {
          tooltip: ({ownerState}) => ({
            fontSize:
              (ownerState as {'data-size'?: string})['data-size'] === 's'
                ? '0.875rem'
                : '1rem',
          }),
        },
      };
      const dataSizeTheme = createTheme(CdoTheme, {
        components: {MuiTooltip: dataSizeOverrides},
      });
      renderTooltip(
        {'data-size': 's'},
        <IconButton aria-label="Run">icon</IconButton>,
        dataSizeTheme,
      );
      const trigger = screen.getByRole('button');
      // The trigger keeps its own size; only a harmless attribute rode along.
      expect(trigger.className).toContain('sizeMedium');
      expect(trigger).toHaveAttribute('data-size', 's');
      expect(getComputedStyle(await openAndGetBubble(user)).fontSize).toBe(
        '0.875rem',
      );
    });
  });

  describe('attributes remain theme-plumbable, if a marker is wanted', () => {
    it('accepts an ownerState function in defaultProps.slotProps', async () => {
      const markedOverrides: Components<Theme>['MuiTooltip'] = {
        defaultProps: {
          slotProps: {
            tooltip: ownerState => ({
              'data-cdo-tooltip': '',
              'data-size': ownerState.size ?? 'm',
            }),
          },
        },
      };
      const markedTheme = createTheme(CdoTheme, {
        components: {MuiTooltip: markedOverrides},
      });
      renderTooltip({size: 'l'}, undefined, markedTheme);
      const bubble = await openAndGetBubble(user);
      expect(bubble).toHaveAttribute('data-cdo-tooltip');
      expect(bubble).toHaveAttribute('data-size', 'l');
    });
  });
});
