import {createTheme} from '@mui/material';

import {
  NOTO_FONT,
  BARLOW_FONT,
  FIGTREE_FONT,
  createFontStack,
} from './constants/fonts';
import {STYLE_OVERRIDES} from './styleOverrides';

const theme = createTheme({
  cssVariables: true,
  components: STYLE_OVERRIDES,
  typography: {
    fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
    h1: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '3rem', // 48px
      fontWeight: 600,
      lineHeight: 1.16,
    },
    h2: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '2.125rem', // 34px
      fontWeight: 600,
      lineHeight: 1.24,
    },
    h3: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '1.75rem', // 28px
      fontWeight: 600,
      lineHeight: 1.28,
    },
    h4: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.32,
    },
    h5: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1rem', // 16px
      fontWeight: 600,
      lineHeight: 1.48,
    },
    body1: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1.25rem', // 20px
      fontWeight: 400,
      lineHeight: 1.4,
    },
    body2: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.48,
    },
    body3: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.54,
    },
    body4: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.813rem',
      fontWeight: 400,
      lineHeight: 1.64,
    },
    overline1: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.875rem', // 14px
      fontWeight: 600,
      letterSpacing: '0.04rem', // 0.64px
      lineHeight: 1.54,
      textTransform: 'uppercase',
    },
    overline2: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.813rem', // 13px
      fontWeight: 600,
      letterSpacing: '0.04rem', // 0.64px
      lineHeight: 1.64,
      textTransform: 'uppercase',
    },
    overline3: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.688rem', // 11px
      fontWeight: 600,
      letterSpacing: '0.04rem', // 0.64px
      lineHeight: 1.76,
      textTransform: 'uppercase',
    },
    figcaption: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.875rem', // 14px
      fontWeight: 600,
      lineHeight: 1.54,
      marginTop: '0.438rem', // 7px
    },
  },
});

export default theme;
