import type {Components, Theme} from '@mui/material/styles';

/**
 * Our tooltip styles, copied from src/tooltip/tooltip.module.scss. The gap
 * between tooltip and trigger is left at MUI's.
 *
 * These only apply to tooltips marked `data-cdo-tooltip`, which our Tooltip
 * sets and plain MUI tooltips don't. Drop the mark once every tooltip is ours.
 *
 * Size arrives as `data-size` rather than a prop read off `ownerState`, the way
 * breadcrumbs.ts does it. MUI's Tooltip copies props it doesn't recognise onto
 * the trigger, so a `size` prop would land on the trigger and fight its own.
 */

const BACKGROUND = 'var(--background-neutral-primary-inverse)';

// Text comes from the theme's body variants. The arrow's font-size sets how big
// it is, because MUI measures it in em. The gap and icon rules only do anything
// when there's a leading icon.
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
  styleOverrides: {
    tooltip: ({theme}) => {
      const sizes = sizeStyles(theme);
      return {
        '&[data-cdo-tooltip]': {
          backgroundColor: BACKGROUND,
          color: 'var(--text-neutral-inverse)',
          borderRadius: '0.25rem',
          boxShadow:
            '0 8px 12px 0 rgb(0 0 0 / 0.12), 0 0 12px 0 rgb(0 0 0 / 0.12)',
          boxSizing: 'border-box',
          // Centers the text and puts a leading icon beside it.
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '4rem',
          maxWidth: '16rem',
          textAlign: 'center',
          // Our Tooltip always sets a size, so there's no unsized default.
          '&[data-size="xs"]': sizes.xs,
          '&[data-size="s"]': sizes.s,
          '&[data-size="m"]': sizes.m,
          '&[data-size="l"]': sizes.l,
        },
      };
    },
    // Set on the arrow itself. Styling it through the tooltip loses to MUI.
    arrow: {
      '[data-cdo-tooltip] &': {color: BACKGROUND}, // MUI fills it from currentColor
    },
  },
};
