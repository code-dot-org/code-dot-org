import {alpha, Components, Theme} from '@mui/material/styles';

export const FOOTER_OVERRIDES: Components<Theme>['MuiFooter'] = {
  styleOverrides: {
    root: ({theme}) => ({
      backgroundColor: theme.palette.common.black,
      paddingBlock: theme.spacing(5),
      paddingInline: theme.spacing(4),
      // Social icon styles
      '.social-icon': {
        color: theme.palette.common.white,
        fontSize: '1.5rem',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          color: alpha(theme.palette.common.white, 0.8),
        },
        '&:focus-visible': {
          outline: `1px solid ${theme.palette.common.white}`,
          outlineOffset: '2px',
          background: 'none',
        },
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
        borderRadius: 12,
        '& .MuiSvgIcon-root': {
          color: theme.palette.common.white,
          right: 'unset',
          insetInlineEnd: 4,
        },
      },
      '& .MuiNativeSelect-select': {
        paddingInlineStart: theme.spacing(1.5),
        paddingInlineEnd: theme.spacing(4),
        borderRadius: 12,
        '&:focus-visible': {
          outline: `1px solid ${theme.palette.common.white}`,
          outlineOffset: 4,
          borderRadius: 12,
        },
      },
      // Top section styles
      '.top-section': {
        [`@media (max-width: ${theme.breakpoints.values.lg}px)`]: {
          alignItems: 'start',
        },
      },
    }),
    grid: ({theme}) => ({
      maxWidth: '1200px',
      margin: '0 auto',
      rowGap: theme.spacing(7),
    }),
    links: ({theme}) => ({
      margin: 0,
      padding: 0,
      height: 'min-content',
      display: 'flex',
      flexDirection: 'row',
      gap: theme.spacing(2),
      [`@media (max-width: ${theme.breakpoints.values.lg}px)`]: {
        flexDirection: 'column',
      },
      '& > li': {
        margin: 0,
        padding: 0,
        width: 'auto',
        borderInlineEnd: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
        paddingInlineEnd: theme.spacing(2),
        '&:last-of-type': {
          borderInlineEnd: 'none',
        },
        [`@media (max-width: ${theme.breakpoints.values.lg}px)`]: {
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
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    }),
  },
};
