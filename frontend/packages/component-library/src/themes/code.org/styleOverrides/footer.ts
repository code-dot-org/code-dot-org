import {alpha, Components, Theme} from '@mui/material/styles';

/**
 * MuiFooter style overrides for the code.org theme.
 * Dark palette footer mirroring the marketing footer's visual approach;
 * social row omitted, AWS attribution image added.
 * All directional properties use CSS logical properties for RTL support.
 */
export const FOOTER_OVERRIDES: Components<Theme>['MuiFooter'] = {
  styleOverrides: {
    root: ({theme}) => ({
      backgroundColor: 'var(--background-neutral-primary-inverse)',
      paddingBlock: theme.spacing(5),
      paddingInline: theme.spacing(4),
      // Language dropdown
      '& .MuiFormControl-root': {
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
          width: '100%',
        },
      },
      '& .MuiInputBase-root': {
        color: theme.palette.common.white,
        fontSize: '0.875rem',
        border: `1px solid ${theme.palette.common.white}`,
        borderRadius: theme.shape.borderRadius,
        // Pin min-width to comfortably fit the widest locale label
        // (e.g. "Português (Portugal)" at ~21 chars + chevron + padding)
        minWidth: '14rem',
        '& .MuiSvgIcon-root, & i': {
          color: theme.palette.common.white,
          insetInlineEnd: 4,
          position: 'absolute',
          pointerEvents: 'none',
        },
      },
      '& .MuiNativeSelect-select': {
        paddingInlineStart: theme.spacing(1.5),
        paddingInlineEnd: theme.spacing(4),
        borderRadius: theme.shape.borderRadius,
        '& option': {
          background: theme.palette.common.white,
          color: theme.palette.text.primary,
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.common.white}`,
          outlineOffset: 4,
          borderRadius: theme.shape.borderRadius,
        },
      },
    }),
    grid: ({theme}) => ({
      maxWidth: '960px',
      margin: '0 auto',
      rowGap: theme.spacing(3),
    }),
    links: ({theme}) => ({
      margin: 0,
      padding: 0,
      height: 'min-content',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing(1.75),
      [`@media (max-width: ${theme.breakpoints.values.md}px)`]: {
        flexDirection: 'column',
      },
      '& > li': {
        margin: 0,
        padding: 0,
        width: 'auto',
        borderInlineEnd: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
        paddingInlineEnd: theme.spacing(1.75),
        '&:last-of-type': {
          borderInlineEnd: 'none',
        },
        [`@media (max-width: ${theme.breakpoints.values.md}px)`]: {
          borderInlineEnd: 'none',
        },
      },
    }),
    link: ({theme}) => ({
      color: theme.palette.common.white,
      textDecoration: 'none',
      '&:hover': {
        color: alpha(theme.palette.common.white, 0.8),
      },
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.common.white}`,
        outlineOffset: '2px',
      },
    }),
    localeSelect: () => ({}),
    copyright: ({theme}) => ({
      color: alpha(theme.palette.common.white, 0.8),
      fontSize: '0.875rem',
    }),
    fineprint: ({theme}) => ({
      color: alpha(theme.palette.common.white, 0.6),
      fontSize: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(0.5),
    }),
    imageLink: ({theme}) => ({
      display: 'inline-block',
      lineHeight: 1,
      '& img': {
        width: 175,
        height: 'auto',
        display: 'block',
      },
      '&:hover': {
        cursor: 'pointer',
        opacity: 0.9,
      },
      '&:focus-visible': {
        outline: `2px solid ${theme.palette.common.white}`,
        outlineOffset: '2px',
      },
    }),
  },
};
