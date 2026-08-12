import type {Components, Theme} from '@mui/material/styles';

/**
 * MUI Tooltip overrides matching the design system tooltip. Values mirror
 * src/tooltip/tooltip.module.scss.
 *
 * `Tooltip` passes its size as `data-size` rather than a prop, because MUI
 * forwards unrecognized props to the child element. Default is 'm'.
 *
 * Spacing between tooltip and trigger is left at MUI's defaults; our SCSS
 * positions with its own tail geometry, MUI with Popper, so the two are not
 * comparable and MUI's are the tested ones.
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
      ...SIZES.m, // for a bare MUI <Tooltip>, which sets no data-size
      ...Object.fromEntries(
        Object.entries(SIZES).map(([size, style]) => [
          `&[data-size="${size}"]`,
          style,
        ]),
      ),
    },
    // MUI fills the arrow from currentColor.
    arrow: {color: BACKGROUND},
  },
};
