import {Components, Theme} from '@mui/material/styles';

// Shared dimension tokens — select and skeleton must stay in sync.
const SELECT_MIN_WIDTH = '8.5rem';
// Icon sits at insetInlineEnd: 0.25rem; this clearance keeps text from sliding under it.
const SELECT_ICON_CLEARANCE = '1.25rem';

/**
 * MuiFooter slot overrides for the code.org theme.
 * Colors use CSS custom properties. Spacing uses rem literals — no spacing
 * token set exists. Breakpoints require theme.breakpoints (no CSS var
 * equivalent). RTL via logical properties throughout.
 */
export const FOOTER_OVERRIDES: Components<Theme>['MuiFooter'] = {
  styleOverrides: {
    root: () => ({
      backgroundColor: 'var(--background-neutral-primary-inverse)',
      color: 'var(--text-neutral-inverse)',
      // Production has 20px top padding only — no bottom padding; the
      // attribution image sits flush at the bottom of the content area.
      paddingBlockStart: '1.25rem',
    }),
    grid: () => ({
      maxWidth: '960px',
      margin: '0 auto',
      // Production uses 10px horizontal gutter (Bootstrap grid); 1rem keeps
      // breathing room on narrow viewports while expanding content width
      // closer to production's 940px (vs 32px → 896px).
      paddingInline: '1rem',
      // Production inner .container has paddingBottom: 10px giving the
      // attribution image 10px of breathing room below it.
      paddingBlockEnd: '0.625rem',
      rowGap: '0.5rem',
    }),
    links: ({theme}: {theme: Theme}) => ({
      display: 'flex',
      flexWrap: 'wrap',
      flexDirection: 'row',
      paddingInlineStart: 0,
      '& .MuiListItem-root': {
        display: 'inline',
        width: 'auto',
        // Pipe separators between links via CSS content so the DOM stays
        // clean (no extra text nodes). The " / """ syntax (CSS Content
        // Level 3) marks the separator as presentational — screen readers
        // that support the spec skip it.
        '&::after': {
          content: '"\\00a0|\\00a0" / ""',
          color: 'var(--text-neutral-inverse)',
        },
        '&:last-child::after': {
          content: 'none',
        },
        // On mobile, stack vertically — hide pipe separators.
        [`@media (max-width: ${theme.breakpoints.values.md}px)`]: {
          display: 'block',
          '&::after': {
            content: 'none',
          },
        },
      },
      [`@media (max-width: ${theme.breakpoints.values.md}px)`]: {
        flexDirection: 'column',
      },
    }),
    link: () => ({
      '& a': {
        color: 'var(--text-neutral-inverse)',
        fontWeight: 'normal',
        fontSize: 'var(--font-size-body-sm)',
        lineHeight: 1.29,
        textDecoration: 'underline',
        '&:hover': {
          color: 'var(--neutral-white-alpha-80)',
        },
      },
      // Accent links (e.g. Privacy Policy) render in brand orange with bold
      // weight — both color and weight signal the distinction (WCAG 1.4.1).
      '& a[data-accent]': {
        color: 'var(--accent-orange-60)',
        fontWeight: 'bold',
      },
    }),
    localeSelect: ({theme}: {theme: Theme}) => ({
      // Border on InputBase so it wraps both the select text and the
      // absolutely-positioned dropdown icon — avoids the icon being clipped
      // outside the select element's own border box.
      '& .MuiInputBase-root': {
        border: '1px solid var(--neutral-white-alpha-40)',
        borderRadius: '0.25rem',
      },
      // Target the native <select> via a stable ancestor class + element
      // selector, giving (0,2,1) specificity to beat MUI's doubled hash
      // class (0,2,0) without relying on variant-specific class names.
      '& .MuiInputBase-root select.MuiNativeSelect-select': {
        color: 'var(--text-neutral-inverse)',
        paddingTop: '0.25rem',
        paddingBottom: '0.25rem',
        paddingInlineStart: '0.375rem',
        paddingInlineEnd: SELECT_ICON_CLEARANCE,
        fontSize: 'var(--font-size-body-xs)',
        minWidth: SELECT_MIN_WIDTH,
        // Keyboard focus ring — replaces the suppressed browser default.
        '&:focus-visible': {
          outline: '2px solid var(--text-neutral-inverse)',
          outlineOffset: '2px',
          backgroundColor: 'var(--background-neutral-primary-inverse)',
          borderRadius: '0.25rem',
        },
        // Suppress pointer-click outline; :focus-visible handles keyboard.
        '&:focus:not(:focus-visible)': {
          backgroundColor: 'var(--background-neutral-primary-inverse)',
          borderRadius: '0.25rem',
        },
      },
      '& .MuiNativeSelect-icon': {
        color: 'var(--text-neutral-inverse)',
        insetInlineEnd: '0.25rem',
        insetInlineStart: 'unset',
      },
      /* Remove the default MUI underline on NativeSelect */
      '& .MuiInput-underline:before, & .MuiInput-underline:after': {
        display: 'none',
      },
      '& .MuiSkeleton-root': {
        width: SELECT_MIN_WIDTH,
        height: '1.5rem',
        borderRadius: '0.25rem',
        backgroundColor: 'var(--neutral-white-alpha-20)',
      },
      // Full-width on narrow viewports so the select is touch-friendly.
      [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
        width: '100%',
        '& .MuiFormControl-root': {
          width: '100%',
        },
        '& .MuiInputBase-root': {
          width: '100%',
        },
        '& .MuiInputBase-root select.MuiNativeSelect-select': {
          minWidth: 'unset',
          width: '100%',
          paddingInlineEnd: SELECT_ICON_CLEARANCE,
        },
      },
    }),
    copyright: ({theme}: {theme: Theme}) => ({
      color: 'var(--text-neutral-inverse)',
      // Production effective size is ~11.9px (relative sizing); --font-size-body-xs
      // (0.813rem ≈ 13px) is the closest design-system token.
      fontSize: 'var(--font-size-body-xs)',
      lineHeight: 1.38,
      textAlign: 'end',
      // Left-align copyright on narrow viewports where right-align looks orphaned.
      [`@media (max-width: ${theme.breakpoints.values.md}px)`]: {
        textAlign: 'start',
      },
    }),
    fineprint: () => ({
      color: 'var(--neutral-white-alpha-80)',
      // Same token as copyright — 13px × 1.38 ≈ 18px line-height matching production.
      fontSize: 'var(--font-size-body-xs)',
      lineHeight: 1.38,
      textAlign: 'start',
    }),
    imageLink: () => ({
      marginBlockStart: '0.625rem',
      // The MUI Link (<a>) is display:inline by default. A display:block img
      // inside an inline box leaves a descender gap below the image. Setting
      // the anchor to block removes that gap.
      '& a': {
        display: 'block',
        lineHeight: 1,
      },
      '& img': {
        // Match production: 40px height, no width constraint (aspect-ratio preserved).
        height: '2.5rem',
        display: 'block',
      },
    }),
  },
};
