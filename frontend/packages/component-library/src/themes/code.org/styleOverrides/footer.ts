import {Components, Theme} from '@mui/material/styles';

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
      // Production has 20px top padding only — no bottom padding; the AWS
      // image sits flush at the bottom of the content area.
      paddingBlockStart: '1.25rem',
    }),
    grid: () => ({
      maxWidth: '960px',
      margin: '0 auto',
      // Production uses 10px horizontal gutter (Bootstrap grid); 1rem keeps
      // breathing room on narrow viewports while expanding content width closer
      // to production's 940px (vs 32px → 896px).
      paddingInline: '1rem',
      // Production inner .container has paddingBottom: 10px giving the AWS
      // image 10px of breathing room below it.
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
        // Pipe separators between links via CSS content so the DOM stays
        // clean (no extra text nodes) and separators are skipped by screen
        // readers that ignore generated content.
        '&::after': {
          content: '"\\00a0|\\00a0"',
          color: 'var(--text-neutral-inverse)',
        },
        '&:last-child::after': {
          content: '""',
        },
        // On mobile, stack vertically — hide pipe separators.
        [`@media (max-width: ${theme.breakpoints.values.md}px)`]: {
          display: 'block',
          '&::after': {
            content: '""',
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
      // Accent links (e.g. Privacy Policy) render in brand orange.
      '&[data-accent] a': {
        color: 'var(--accent-orange-60)',
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
      // MUI triples its hash class for (0,3,0) specificity; element+two-classes
      // gives (0,3,1) which wins. MuiNativeSelect-outlined is always present on
      // the select when rendered inside FormControl without an explicit variant.
      '& select.MuiNativeSelect-select.MuiNativeSelect-outlined': {
        color: 'var(--text-neutral-inverse)',
        paddingTop: '0.25rem',
        paddingBottom: '0.25rem',
        paddingLeft: '0.375rem',
        // Icon sits at insetInlineEnd: 0.25rem (4px); 1.25rem gives clearance.
        paddingRight: '1.25rem',
        fontSize: 'var(--font-size-body-xs)',
        minWidth: '8.5rem',
        '&:focus': {
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
        width: '8.5rem',
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
        '& select.MuiNativeSelect-select': {
          minWidth: 'unset',
          width: '100%',
          paddingRight: '1.25rem',
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
