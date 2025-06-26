'use client';
import {createTheme} from '@mui/material';

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#000000',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          ['&.MuiButton-contained.MuiButton-colorPrimary']: {
            backgroundColor: 'var(--brand-purple-50)',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: 'var(--text-brand-purple-primary)',
          fontWeight: 500,
          textDecoration: 'underline',
          transition: 'color 0.2s ease-in-out',
          '&:hover': {
            color: 'var(--text-brand-purple-secondary)',
            '& svg': {
              color: 'var(--text-brand-purple-secondary)',
            },
          },
          ['& svg']: {
            color: 'var(--text-brand-purple-primary)',
            transition: 'color 0.2s ease-in-out',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: 'var(--text-neutral-primary)',
        },
      },
    },
  },
  typography: {
    fontFamily: ['Figtree', 'Noto Sans', 'sans-serif'].join(','),
    h6: {
      lineHeight: 1.4,
    },
    overline: {
      letterSpacing: '0.03rem',
      lineHeight: 1.4,
    },
  },
});

export default theme;
