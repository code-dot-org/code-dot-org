import {alpha, Components, Theme} from '@mui/material/styles';

export const FOOTER_OVERRIDES: Components<Theme>['MuiFooter'] = {
  styleOverrides: {
    root: ({theme}) => ({
      backgroundColor: theme.palette.common.black,
      paddingBlock: theme.spacing(5),
      paddingInline: theme.spacing(4),
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
    }),
    grid: ({theme}) => ({
      maxWidth: '1200px',
      margin: '0 auto',
      rowGap: theme.spacing(7),
    }),
    links: ({theme}) => ({
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'row',
      gap: theme.spacing(2),
      '& > li': {
        margin: 0,
        padding: 0,
        width: 'auto',
        borderInlineEnd: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
        paddingInlineEnd: theme.spacing(2),
        '&:last-of-type': {
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
  },
};
