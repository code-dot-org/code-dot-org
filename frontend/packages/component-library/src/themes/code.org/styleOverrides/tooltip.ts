import type {Components, Theme} from '@mui/material/styles';

/**
 * Our tooltip styles, copied from src/tooltip/tooltip.module.scss. The gap
 * between tooltip and trigger is left at MUI's.
 *
 * These only apply to tooltips marked `data-cdo-tooltip`, which our Tooltip
 * sets and plain MUI tooltips don't. Drop the mark once every tooltip is ours.
 *
 * The CADS tooltip is one fixed size, so there's no size variant here.
 */

const BACKGROUND = 'var(--background-neutral-primary-inverse)';

export const TOOLTIP_OVERRIDES: Components<Theme>['MuiTooltip'] = {
  styleOverrides: {
    tooltip: ({theme}) => ({
      '&[data-cdo-tooltip]': {
        ...theme.typography.body2,
        backgroundColor: BACKGROUND,
        color: 'var(--text-neutral-inverse)',
        borderRadius: 'var(--shape-sm)',
        boxShadow: 'var(--shadow-md)',
        boxSizing: 'border-box',
        // Centers the text and puts a leading icon beside it.
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
        minWidth: '4rem',
        maxWidth: '16rem',
        padding: '0.125rem 0.5rem',
        textAlign: 'center',
        // Arrow font-size sets its box, since MUI measures the arrow in em.
        '& .MuiTooltip-arrow': {fontSize: '0.75rem'},
        // The icon rule only does anything when there's a leading icon.
        '& i': {fontSize: '0.875rem', width: '1.125rem', lineHeight: 1},
      },
    }),
    // Set on the arrow itself. Styling it through the tooltip loses to MUI.
    arrow: {
      '[data-cdo-tooltip] &': {color: BACKGROUND}, // MUI fills it from currentColor
    },
  },
};
