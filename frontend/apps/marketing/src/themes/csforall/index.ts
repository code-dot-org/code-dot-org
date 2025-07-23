'use client';
import {createTheme} from '@mui/material';

import {NOTO_FONT} from '@/themes/constants/fonts';

import {createFontStack} from '../common/constants';

import {COLORS} from './constants/colors';
import {FIGTREE_FONT, ROBOTO_MONO_FONT} from './constants/fonts';
import {STYLE_OVERRIDES} from './styleOverrides';

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: COLORS.primary,
    },
    secondary: {
      main: COLORS.secondary,
    },
    text: {
      primary: COLORS.black,
    },
    divider: COLORS.black,
    common: {
      black: COLORS.black,
    },
  },
  components: STYLE_OVERRIDES,
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
    body1: {
      fontSize: '1.375rem', // 22px
      fontWeight: 400,
      lineHeight: 1.45,
    },
    body2: {
      fontSize: '1.125rem', // 18px
      fontWeight: 400,
      lineHeight: 1.44,
    },
    body3: {
      fontFamily: createFontStack(ROBOTO_MONO_FONT, NOTO_FONT),
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body4: {
      fontFamily: createFontStack(ROBOTO_MONO_FONT, NOTO_FONT),
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.57,
    },
    overline: {
      fontWeight: 400,
      lineHeight: 1.5,
      textTransform: 'none',
    },
  },
});

export default theme;
