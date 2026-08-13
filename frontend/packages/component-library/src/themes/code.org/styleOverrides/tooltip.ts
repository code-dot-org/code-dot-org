import type {Components, Theme} from '@mui/material/styles';

/**
 * PoC for PR #74565: the tooltip migration as a theme entry alone, with no
 * wrapper component in `src/tooltip/`. Call sites are plain
 * `import {Tooltip} from '@mui/material'`, as they are for Button,
 * IconButton and Breadcrumbs.
 *
 * Styles are ported from src/tooltip/tooltip.module.scss.
 *
 * Two differences from the wrapper version on hbergam/mui-tooltip-keyboard:
 *
 *  - `size` is read off `ownerState`, the way breadcrumbs.ts reads its own,
 *    rather than arriving as a `data-size` attribute set by a component.
 *    MUI's Tooltip does copy unrecognised props onto the trigger, so `size`
 *    lands there too; see the Leak story for what that costs. Naming the
 *    prop `data-size` instead defuses it, at the price of an uglier callsite.
 *
 *  - There is no `data-cdo-tooltip` marker, so these styles apply to every
 *    MUI tooltip, Sketch Lab's included. That is the open question in the
 *    review: those five callsites currently render MUI's stock gray bubble,
 *    and restyling them looks like the point of the migration rather than
 *    a regression.
 */

const BACKGROUND = 'var(--background-neutral-primary-inverse)';

// Text metrics come from the theme's body variants. The arrow's font-size sets
// how big it is, because MUI measures it in em. The gap and icon rules only do
// anything when the title carries a leading icon.
const sizeStyles = (theme: Theme) => ({
  xs: {
    ...theme.typography.body4,
    padding: '0.125rem 0.5rem',
    gap: '0.3rem',
    '& .MuiTooltip-arrow': {fontSize: '0.5rem'},
    '& i': {fontSize: '0.725rem', width: '0.725rem', lineHeight: 1},
  },
  s: {
    ...theme.typography.body3,
    padding: '0.125rem 0.5rem',
    gap: '0.3rem',
    '& .MuiTooltip-arrow': {fontSize: '0.625rem'},
    '& i': {fontSize: '0.8125rem', width: '1rem', lineHeight: 1},
  },
  m: {
    ...theme.typography.body2,
    padding: '0.125rem 0.5rem',
    gap: '0.25rem',
    '& .MuiTooltip-arrow': {fontSize: '0.75rem'},
    '& i': {fontSize: '0.875rem', width: '1.125rem', lineHeight: 1},
  },
  l: {
    ...theme.typography.body1,
    padding: '0.125rem 0.625rem 0.188rem',
    gap: '0.375rem',
    '& .MuiTooltip-arrow': {fontSize: '1rem'},
    '& i': {fontSize: '1rem', width: '1.25rem', lineHeight: 1},
  },
});

export const TOOLTIP_OVERRIDES: Components<Theme>['MuiTooltip'] = {
  // The two flipped defaults the wrapper set in JSX. Design system tooltips
  // have tails, and the text describes the trigger rather than naming it —
  // which means the trigger must carry its own accessible name.
  defaultProps: {
    arrow: true,
    describeChild: true,
  },
  styleOverrides: {
    tooltip: ({theme, ownerState}) => ({
      backgroundColor: BACKGROUND,
      color: 'var(--text-neutral-inverse)',
      borderRadius: '0.25rem',
      boxShadow: '0 8px 12px 0 rgb(0 0 0 / 0.12), 0 0 12px 0 rgb(0 0 0 / 0.12)',
      boxSizing: 'border-box',
      // Centers the text and puts a leading icon beside it.
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '4rem',
      maxWidth: '16rem',
      textAlign: 'center',
      ...sizeStyles(theme)[ownerState.size ?? 'm'],
    }),
    // MUI fills the arrow from currentColor.
    arrow: {color: BACKGROUND},
  },
};
