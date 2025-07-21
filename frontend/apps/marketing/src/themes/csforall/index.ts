'use client';
import {createTheme} from '@mui/material';

import {NOTO_FONT} from '@/themes/constants/fonts';

import {createFontStack} from '../common/constants';

const FIGTREE_FONT = 'Figtree';
const ROBOTO_MONO_FONT = 'Roboto Mono';

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
        }),
      },
    },
  },
  typography: {
    fontFamily: createFontStack(ROBOTO_MONO_FONT, NOTO_FONT),
    h1: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '5rem', // 80px
      fontWeight: 800,
      lineHeight: 1.1,
    },
    h2: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '4rem', // 64px
      fontWeight: 800,
      lineHeight: 1.125,
    },
    h3: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '3.125rem', // 50px
      fontWeight: 800,
      lineHeight: 1.16,
    },
    h4: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '2.5rem', // 40px
      fontWeight: 800,
      lineHeight: 1.2,
    },
    h5: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '2rem', // 32px
      fontWeight: 800,
      lineHeight: 1.125,
    },
    h6: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1.5rem', // 24px
      fontWeight: 800,
      lineHeight: 1.25,
    },
  },
});

export default theme;
