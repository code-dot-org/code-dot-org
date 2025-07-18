'use client';
import {createTheme} from '@mui/material';

const FIGTREE_FONT = 'Figtree';
const ROBOTO_MONO_FONT = 'Roboto Mono';
const NOTO_FONT =
  'Noto Sans, Noto Sans Math, Noto Sans Arabic, Noto Sans Armenian, Noto Sans Bengali, Noto Sans SC, Noto Sans TC, Noto Sans Devanagari, Noto Sans Georgian, Noto Sans Hebrew, Noto Sans JP, Noto Sans Kannada, Noto Sans Khmer, Noto Sans KR, Noto Sans Myanmar, Noto Sans Sinhala, Noto Sans Tamil, Noto Sans Telugu, Noto Sans Thai, Noto Sans Thaana';

const COLORS = {
  black: '#15092C',
};

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#D401F2',
    },
    secondary: {
      main: '#2C079F',
    },
    text: {
      primary: COLORS.black,
    },
    divider: COLORS.black,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({theme}) => ({
          ['&.MuiButton-contained.MuiButton-colorPrimary']: {
            backgroundColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({theme}) => ({
          ['&.MuiDivider-root.divider--color-primary']: {
            borderColor: theme.palette.divider,
          },
          ['&.MuiDivider-root.divider--color-strong']: {
            borderColor: theme.palette.divider,
            borderStyle: 'dashed',
          },
          ['&.MuiDivider-root.divider--margin-none']: {
            marginTop: 0,
            marginBottom: 0,
          },
          ['&.MuiDivider-root.divider--margin-xs']: {
            marginTop: theme.spacing(3),
            marginBottom: theme.spacing(3),
          },
          ['&.MuiDivider-root.divider--margin-s']: {
            marginTop: theme.spacing(5),
            marginBottom: theme.spacing(5),
          },
          ['&.MuiDivider-root.divider--margin-m']: {
            marginTop: theme.spacing(7),
            marginBottom: theme.spacing(7),
          },
          ['&.MuiDivider-root.divider--margin-l']: {
            marginTop: theme.spacing(8),
            marginBottom: theme.spacing(8),
          },
        }),
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: ({theme}) => ({
          color: theme.palette.text.primary,
          ['&.MuiTypography-h1.heading--color-white']: {
            color: theme.palette.common.white,
          },
        }),
      },
    },
  },
  typography: {
    fontFamily: [ROBOTO_MONO_FONT, NOTO_FONT, 'sans-serif'].join(', '),
    h1: {
      fontFamily: [FIGTREE_FONT, NOTO_FONT, 'sans-serif'].join(', '),
      fontSize: '13rem', // 208px
      fontWeight: 800,
      lineHeight: 1,
    },
    h2: {
      fontFamily: [FIGTREE_FONT, NOTO_FONT, 'sans-serif'].join(', '),
      fontSize: '11.125rem', // 178px
      fontWeight: 800,
      lineHeight: 1,
    },
    h3: {
      fontFamily: [FIGTREE_FONT, NOTO_FONT, 'sans-serif'].join(', '),
      fontSize: '6.75rem', // 108px
      fontWeight: 800,
      lineHeight: 1,
    },
    h4: {
      fontFamily: [FIGTREE_FONT, NOTO_FONT, 'sans-serif'].join(', '),
      fontSize: '4.25rem', // 68px
      fontWeight: 800,
      lineHeight: 1,
    },
    h5: {
      fontFamily: [FIGTREE_FONT, NOTO_FONT, 'sans-serif'].join(', '),
      fontSize: '2.625rem', // 42px
      fontWeight: 800,
      lineHeight: 1.1,
    },
    h6: {
      fontFamily: [FIGTREE_FONT, NOTO_FONT, 'sans-serif'].join(', '),
      fontSize: '1.5rem', // 24px
      fontWeight: 800,
      lineHeight: 1.1,
    },
  },
});

export default theme;
