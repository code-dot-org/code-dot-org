'use client';
import {createTheme} from '@mui/material';

const BARLOW_FONT = 'Barlow Semi Condensed Semibold';
const FIGTREE_FONT = 'Figtree';
const NOTO_FONT =
  'Noto Sans, Noto Sans Math, Noto Sans Arabic, Noto Sans Armenian, Noto Sans Bengali, Noto Sans SC, Noto Sans TC, Noto Sans Devanagari, Noto Sans Georgian, Noto Sans Hebrew, Noto Sans JP, Noto Sans Kannada, Noto Sans Khmer, Noto Sans KR, Noto Sans Myanmar, Noto Sans Sinhala, Noto Sans Tamil, Noto Sans Telugu, Noto Sans Thai, Noto Sans Thaana';

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#0093A4', // Teal
    },
    secondary: {
      main: '#8C52BA', // Purple
    },
    text: {
      primary: '#292F36', // Dark Gray
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({theme}) => ({
          ['&.MuiButton-contained.MuiButton-colorPrimary']: {
            backgroundColor: theme.palette.secondary.main,
          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({theme}) => ({
          color: theme.palette.secondary.main,
          fontWeight: 500,
          textDecoration: 'underline',
          transition: 'color 0.2s ease-in-out',
          '&:hover': {
            color: theme.palette.secondary.dark,
            '& svg': {
              color: theme.palette.secondary.dark,
            },
          },
          ['& svg']: {
            transition: 'color 0.2s ease-in-out',
          },
        }),
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: ({theme}) => ({
          color: theme.palette.text.primary,
        }),
        gutterBottom: {
          '&.MuiTypography-h1': {
            marginBottom: '1.5rem', // 24px
          },
          '&.MuiTypography-h2': {
            marginBottom: '1.0625rem', // 17px
          },
          '&.MuiTypography-h3': {
            marginBottom: '0.875rem', // 14px
          },
          '&.MuiTypography-h4': {
            marginBottom: '0.75rem', // 12px
          },
          '&.MuiTypography-h5': {
            marginBottom: '0.625rem', // 10px
          },
          '&.MuiTypography-h6': {
            marginBottom: '0.5rem', // 8px
          },
          '&.MuiTypography-overline': {
            marginBottom: '1rem', // 16px
          },
        },
      },
    },
  },
  typography: {
    fontFamily: [FIGTREE_FONT, NOTO_FONT, 'sans-serif'].join(', '),
    h1: {
      fontFamily: [BARLOW_FONT, NOTO_FONT, 'sans-serif'].join(', '),
      fontSize: '3rem', // 48px
      fontWeight: 500,
      lineHeight: 1.16,
    },
    h2: {
      fontFamily: [BARLOW_FONT, NOTO_FONT, 'sans-serif'].join(', '),
      fontSize: '2.125rem', // 34px
      fontWeight: 500,
      lineHeight: 1.24,
    },
    h3: {
      fontFamily: [BARLOW_FONT, NOTO_FONT, 'sans-serif'].join(', '),
      fontSize: '1.75rem', // 28px
      fontWeight: 500,
      lineHeight: 1.28,
    },
    h4: {
      fontFamily: [BARLOW_FONT, NOTO_FONT, 'sans-serif'].join(', '),
      fontSize: '1.5rem', // 24px
      fontWeight: 500,
      lineHeight: 1.32,
    },
    h5: {
      fontSize: '1.25rem', // 20px
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.48,
    },
    overline: {
      fontSize: '0.75rem', // 12px
      fontWeight: 600,
      letterSpacing: '0.03rem', // 0.48px
      lineHeight: 1.64,
    },
  },
});

export default theme;
