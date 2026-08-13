/**
 * SCRATCH: proof of concept for a theme-only MUI Tooltip migration.
 * Not for commit. Verifies that everything Tooltip.tsx does with attributes
 * can be done from the theme instead.
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

declare module '@mui/material/Tooltip' {
  interface TooltipProps {
    size?: 'xs' | 's' | 'm' | 'l';
  }
}

const BACKGROUND = 'var(--background-neutral-primary-inverse)';

const sizeStyles = (theme: Theme) => ({
  xs: {...theme.typography.body4, padding: '0.125rem 0.5rem'},
  s: {...theme.typography.body3, padding: '0.125rem 0.5rem'},
  m: {...theme.typography.body2, padding: '0.125rem 0.5rem'},
  l: {...theme.typography.body1, padding: '0.125rem 0.625rem 0.188rem'},
});

// The whole component, as a theme entry.
const POC_OVERRIDES: Components<Theme>['MuiTooltip'] = {
  defaultProps: {
    arrow: true,
    describeChild: true,
  },
  styleOverrides: {
    tooltip: ({theme, ownerState}) => ({
      backgroundColor: BACKGROUND,
      color: 'var(--text-neutral-inverse)',
      borderRadius: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      minWidth: '4rem',
      maxWidth: '16rem',
      textAlign: 'center',
      // Read the size off ownerState, exactly as breadcrumbs.ts does.
      ...sizeStyles(theme)[ownerState.size ?? 'm'],
    }),
    arrow: ({ownerState}) => ({
      color: BACKGROUND,
      // ownerState reaches the arrow slot too.
      fontSize: ownerState.size === 'l' ? '1rem' : '0.75rem',
    }),
  },
};

const pocTheme = createTheme(CdoTheme, {
  components: {MuiTooltip: POC_OVERRIDES},
});

const renderPoc = (
  props: Record<string, unknown> = {},
  child?: React.ReactElement,
) =>
  render(
    <ThemeProvider theme={pocTheme}>
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

  it('styles a bare MUI Tooltip from the theme, with no marker attribute', async () => {
    renderPoc();
    const bubble = await openAndGetBubble(user);
    const styles = getComputedStyle(bubble);
    expect(styles.backgroundColor).toBe(BACKGROUND);
    expect(styles.borderRadius).toBe('0.25rem');
    expect(bubble.getAttribute('data-cdo-tooltip')).toBeNull();
  });

  it('reads a custom size prop off ownerState', async () => {
    renderPoc({size: 's'});
    const bubble = await openAndGetBubble(user);
    // body3 is 0.875rem
    expect(getComputedStyle(bubble).fontSize).toBe('0.875rem');
  });

  it('applies the m default when no size is passed', async () => {
    renderPoc();
    const bubble = await openAndGetBubble(user);
    // body2 is 1rem
    expect(getComputedStyle(bubble).fontSize).toBe('1rem');
  });

  it('gets ownerState in the arrow slot as well', async () => {
    renderPoc({size: 'l'});
    await openAndGetBubble(user);
    const arrow = document.querySelector('.MuiTooltip-arrow') as HTMLElement;
    expect(getComputedStyle(arrow).fontSize).toBe('1rem');
  });

  it('flips arrow and describeChild from theme defaultProps', async () => {
    renderPoc();
    const bubble = await openAndGetBubble(user);
    expect(document.querySelector('.MuiTooltip-arrow')).not.toBeNull();
    // describeChild => aria-describedby on the trigger, no aria-label
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-describedby');
    expect(trigger).not.toHaveAttribute('aria-label');
    expect(bubble).toBeTruthy();
  });

  it('LEAK: React drops an unknown size onto a plain DOM trigger', async () => {
    renderPoc({size: 's'});
    // React does not render `size` on a <button>, so a DOM trigger is unharmed.
    expect(screen.getByRole('button')).not.toHaveAttribute('size');
  });

  it('LEAK: a MUI child that does NOT set size inherits the tooltip size', async () => {
    renderPoc({size: 's'}, <IconButton aria-label="Run">icon</IconButton>);
    const btn = screen.getByRole('button');
    // What size class did IconButton end up with?

    console.log('IconButton classes with leaked size="s":', btn.className);
    expect(btn.className).not.toContain('sizeMedium');
  });

  it('LEAK: a child that sets its own size wins over the leak', async () => {
    renderPoc(
      {size: 's'},
      <IconButton size="small" aria-label="Run">
        icon
      </IconButton>,
    );
    // children.props are spread after `other`, so the child's own size survives
    expect(screen.getByRole('button').className).toContain('sizeSmall');
  });

  it('can also plumb attributes via defaultProps slotProps as a function', async () => {
    const attrTheme = createTheme(CdoTheme, {
      components: {
        MuiTooltip: {
          defaultProps: {
            slotProps: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tooltip: (ownerState: any) => ({
                'data-cdo-tooltip': '',
                'data-size': ownerState.size ?? 'm',
              }),
            },
          },
        },
      },
    });
    render(
      <ThemeProvider theme={attrTheme}>
        <MuiTooltip title="t" size="l">
          <button type="button">trigger</button>
        </MuiTooltip>
      </ThemeProvider>,
    );
    const bubble = await openAndGetBubble(user);
    expect(bubble).toHaveAttribute('data-cdo-tooltip');
    expect(bubble).toHaveAttribute('data-size', 'l');
  });

  it('mirrors placement itself when the theme has direction rtl', async () => {
    const rtlTheme = createTheme(CdoTheme, {
      direction: 'rtl',
      components: {MuiTooltip: POC_OVERRIDES},
    });
    render(
      <ThemeProvider theme={rtlTheme}>
        <MuiTooltip title="t" placement="bottom-start">
          <button type="button">trigger</button>
        </MuiTooltip>
      </ThemeProvider>,
    );
    await user.hover(screen.getByRole('button'));
    const popper = await screen.findByRole('tooltip');
    const placed = popper.closest('[data-popper-placement]');

    console.log(
      'rtl theme, placement=bottom-start resolved to:',
      placed?.getAttribute('data-popper-placement'),
    );
    // MUI's own rtl handling must flip -start/-end when theme.direction is rtl
    expect(placed).toHaveAttribute('data-popper-placement', 'bottom-end');
  });

  it('keyboard-only is two native props, no wrapper needed', async () => {
    renderPoc({disableHoverListener: true, disableTouchListener: true});
    await user.hover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await screen.findByRole('tooltip');
  });
});

describe('PoC: data-size instead of size, to defuse the leak', () => {
  const dataSizeTheme = createTheme(CdoTheme, {
    components: {
      MuiTooltip: {
        styleOverrides: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tooltip: ({theme, ownerState}: any) => ({
            ...sizeStyles(theme)[
              (ownerState['data-size'] ?? 'm') as 'xs' | 's' | 'm' | 'l'
            ],
          }),
        },
      },
    },
  });

  it('styles from ownerState["data-size"] and leaks only a benign attribute', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider theme={dataSizeTheme}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <MuiTooltip title="t" {...({'data-size': 's'} as any)}>
          <IconButton aria-label="Run">icon</IconButton>
        </MuiTooltip>
      </ThemeProvider>,
    );
    const trigger = screen.getByRole('button');
    // The trigger keeps its own MUI size; only a data attribute rode along.
    expect(trigger.className).toContain('sizeMedium');
    expect(trigger).toHaveAttribute('data-size', 's');

    await user.hover(trigger);
    await screen.findByRole('tooltip');
    const bubble = document.querySelector('.MuiTooltip-tooltip') as HTMLElement;
    expect(getComputedStyle(bubble).fontSize).toBe('0.875rem'); // body3
  });
});
