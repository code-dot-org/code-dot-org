import type {Components, Theme} from '@mui/material/styles';

/**
 * Styles for MUI's tooltip; call sites import `Tooltip` from `@mui/material`
 * directly. Values match the CADS spec (moshebaricdo/cads tooltip.module.scss),
 * and the tooltip is one fixed size. The override is global, so every MUI
 * tooltip gets the design system look.
 */

const BACKGROUND = 'var(--background-neutral-primary-inverse)';
const FOREGROUND = 'var(--text-neutral-primary-inverse)';

export const TOOLTIP_OVERRIDES: Components<Theme>['MuiTooltip'] = {
  // Tooltips have a tail, and the text describes the trigger rather than naming
  // it — so the trigger needs its own accessible name.
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
      textAlign: 'start',
      // A leading icon in the title sits beside the text.
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
