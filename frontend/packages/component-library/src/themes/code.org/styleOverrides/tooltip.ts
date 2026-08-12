import type {Components, Theme} from '@mui/material/styles';

/**
 * MUI Tooltip overrides matching the design system tooltip. Values mirror
 * src/tooltip/tooltip.module.scss; spacing to the trigger is left at MUI's.
 *
 * Size arrives as `data-size`, since MUI forwards unknown props to the child.
 */

const BACKGROUND = 'var(--background-neutral-primary-inverse)';

// Arrow font-size sets its box, since MUI sizes the arrow in em.
const SIZES = {
  xs: {
    padding: '0.125rem 0.5rem',
    fontSize: 'var(--font-size-body-xs)',
    lineHeight: 1.64,
    '& .MuiTooltip-arrow': {fontSize: '0.5rem'},
  },
  s: {
    padding: '0.125rem 0.5rem',
    fontSize: 'var(--font-size-body-sm)',
    lineHeight: 1.54,
    '& .MuiTooltip-arrow': {fontSize: '0.625rem'},
  },
  m: {
    padding: '0.125rem 0.5rem',
    fontSize: 'var(--font-size-body-md)',
    lineHeight: 1.48,
    '& .MuiTooltip-arrow': {fontSize: '0.75rem'},
  },
  l: {
    padding: '0.125rem 0.625rem 0.188rem',
    fontSize: 'var(--font-size-body-lg)',
    lineHeight: 1.4,
    '& .MuiTooltip-arrow': {fontSize: '1rem'},
  },
};

export const TOOLTIP_OVERRIDES: Components<Theme>['MuiTooltip'] = {
  // Both differ from MUI: our tooltips have tails, and the text should describe
  // the trigger rather than replace its accessible name.
  defaultProps: {arrow: true, describeChild: true},
  styleOverrides: {
    tooltip: {
      backgroundColor: BACKGROUND,
      color: 'var(--text-neutral-inverse)',
      borderRadius: '0.25rem',
      boxShadow: '0 8px 12px 0 rgb(0 0 0 / 0.12), 0 0 12px 0 rgb(0 0 0 / 0.12)',
      boxSizing: 'border-box',
      minWidth: '4rem',
      maxWidth: '16rem',
      textAlign: 'center',
      fontWeight: 400,
      ...SIZES.m, // a bare MUI <Tooltip> sets no data-size
      '&[data-size="xs"]': SIZES.xs,
      '&[data-size="s"]': SIZES.s,
      '&[data-size="m"]': SIZES.m,
      '&[data-size="l"]': SIZES.l,
    },
    arrow: {color: BACKGROUND}, // MUI fills the arrow from currentColor
  },
};
