'use client';
import {createTheme} from '@mui/material';

import {NOTO_FONT} from '@/themes/constants/fonts';

import {createFontStack} from '../common/constants';

import {BARLOW_FONT, FIGTREE_FONT} from './constants/fonts';
import {STYLE_OVERRIDES} from './styleOverrides';

const theme = createTheme({
  cssVariables: true,
  components: STYLE_OVERRIDES,
  typography: {
    fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
    h1: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '3rem', // 48px
      fontWeight: 500,
      lineHeight: 1.16,
    },
    h2: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '2.125rem', // 34px
      fontWeight: 500,
      lineHeight: 1.24,
    },
    h3: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '1.75rem', // 28px
      fontWeight: 500,
      lineHeight: 1.28,
    },
    h4: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
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
    body1: {
      fontSize: '1.25rem', // 20px
      fontWeight: 400,
      lineHeight: 1.4,
    },
    body2: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.48,
    },
    body3: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.54,
    },
    body4: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.43,
    },
    overline: {
      fontWeight: 600,
      letterSpacing: '0.03rem', // 0.48px
      lineHeight: 1.4,
    },
  },
});

export default theme;
