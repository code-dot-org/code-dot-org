import type {Components, Theme} from '@mui/material/styles';

/**
 * Design system tooltip, as a theme entry alone — no wrapper component. Call
 * sites use `import {Tooltip} from '@mui/material'` directly, the way Button,
 * IconButton and Breadcrumbs do.
 *
 * Styles match the CADS spec (moshebaricdo/cads tooltip.module.scss). The CADS
 * tooltip is one fixed size, so there is no size variant.
 *
 * The override is global: it styles every MUI tooltip in the app, so the five
 * Sketch Lab call sites already on bare MUI pick up the design system look too.
 */

const BACKGROUND = 'var(--background-neutral-primary-inverse)';
const FOREGROUND = 'var(--text-neutral-primary-inverse)';

export const TOOLTIP_OVERRIDES: Components<Theme>['MuiTooltip'] = {
  // MUI's defaults, flipped for the design system: tooltips have a tail, and
  // the text describes the trigger rather than naming it — so the trigger must
  // carry its own accessible name.
  defaultProps: {
    arrow: true,
    describeChild: true,
  },
  styleOverrides: {
    tooltip: ({theme}) => ({
      ...theme.typography.body3,
      backgroundColor: BACKGROUND,
      color: FOREGROUND,
      borderRadius: 'var(--shape-sm)',
      boxShadow: 'var(--shadow-md)',
      boxSizing: 'border-box',
      maxWidth: '16rem',
      width: 'max-content',
      padding: '0.25rem 0.75rem',
      textAlign: 'left',
      // A leading icon composed into the title sits beside the text.
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      '& i': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: '0.875rem',
        fontSize: '0.875rem',
        lineHeight: 1,
        color: FOREGROUND,
      },
      // Arrow font-size sets its box, since MUI measures the arrow in em.
      '& .MuiTooltip-arrow': {fontSize: '0.5rem'},
    }),
    // MUI fills the arrow from currentColor.
    arrow: {color: BACKGROUND},
  },
};
