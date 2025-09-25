import {alpha, Components, Theme} from '@mui/material/styles';

export const FOOTER_OVERRIDES: Components<Theme>['MuiFooter'] = {
  styleOverrides: {
    root: ({theme}) => ({
      backgroundColor: 'var(--background-neutral-primary-inverse)',
      paddingBlock: theme.spacing(5),
      paddingInline: theme.spacing(4),
      // Social icon styles
      '& .MuiStack-root': {
        marginInlineStart: theme.spacing(-0.5),
      },
      '& .social-icon .MuiSvgIcon-root, .social-icon': {
        color: theme.palette.common.white,
        fontSize: '0.875rem',
        transition: 'opacity 0.2s ease-in-out',
        '&:hover': {
          opacity: 0.8,
        },
        '&:focus-visible': {
          outline: `1px solid ${theme.palette.common.white}`,
          outlineOffset: '2px',
          background: 'none',
        },
      },
      '& .MuiIcon-root': {
        width: 'auto',
      },
      // Language dropdown styles
      '& .MuiFormControl-root': {
        borderColor: theme.palette.common.white,
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
          width: '100%',
        },
      },
      '& .MuiFormLabel-root': {
        color: theme.palette.common.white,
        fontSize: '1rem',
      },
      '& .MuiInputBase-root': {
        color: theme.palette.common.white,
        fontSize: '0.875rem',
        border: `1px solid ${theme.palette.common.white}`,
        borderRadius: theme.shape.borderRadius,
        '& .MuiSvgIcon-root': {
          color: theme.palette.common.white,
          right: 'unset',
          insetInlineEnd: 4,
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
          outline: `1px solid ${theme.palette.common.white}`,
          outlineOffset: 4,
          borderRadius: theme.shape.borderRadius,
        },
      },
      // Top section styles
      '.top-section': {
        [`@media (max-width: ${theme.breakpoints.values.md}px)`]: {
          alignItems: 'start',
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
      margin: 0,
      textDecoration: 'none',
      '&:hover': {
        color: alpha(theme.palette.common.white, 0.8),
      },
      '&:focus-visible': {
        outline: `1px solid ${theme.palette.common.white}`,
        outlineOffset: '2px',
      },
    }),
    copyright: ({theme}) => ({
      color: alpha(theme.palette.common.white, 0.8),
    }),
    imageLink: ({theme}) => ({
      lineHeight: 1,
      '& img': {
        width: 175,
        height: 'auto',
      },
      '&:hover': {
        cursor: 'pointer',
      },
      '&:focus-visible': {
        outline: `1px solid ${theme.palette.common.white}`,
        outlineOffset: '2px',
      },
    }),
  },
};
