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
    fontFamily:
      'Figtree, Noto Sans, Noto Sans Math, Noto Sans Arabic, Noto Sans Armenian, Noto Sans Bengali, Noto Sans SC, Noto Sans TC, Noto Sans Devanagari, Noto Sans Georgian, Noto Sans Hebrew, Noto Sans JP, Noto Sans Kannada, Noto Sans Khmer, Noto Sans KR, Noto Sans Myanmar, Noto Sans Sinhala, Noto Sans Tamil, Noto Sans Telugu, Noto Sans Thai, Noto Sans Thaana, sans-serif;',
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
