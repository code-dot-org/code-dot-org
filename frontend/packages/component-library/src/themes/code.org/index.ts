import {createTheme} from '@mui/material';

export type * from './muiAugmentation';

import {
  NOTO_FONT,
  SPACE_GROTESK_FONT,
  GEIST_FONT,
  createFontStack,
} from './constants/fonts';
import {STYLE_OVERRIDES} from './styleOverrides';

const theme = createTheme({
  cssVariables: true,
  components: STYLE_OVERRIDES,
  typography: {
    fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
    h1: {
      fontFamily: createFontStack(SPACE_GROTESK_FONT, NOTO_FONT),
      fontSize: '3rem', // 48px
      fontWeight: 600,
      lineHeight: 1.08,
      letterSpacing: '-0.03rem',
      marginBottom: '0.5em',
    },
    h2: {
      fontFamily: createFontStack(SPACE_GROTESK_FONT, NOTO_FONT),
      fontSize: '2.375rem', // 38px
      fontWeight: 600,
      lineHeight: 1.05,
      letterSpacing: '-0.03rem',
      marginBottom: '0.5em',
    },
    h3: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '1.75rem', // 28px
      fontWeight: 600,
      lineHeight: 1.29,
      marginBottom: '0.5em',
    },
    h4: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.33,
      marginBottom: '0.5em',
    },
    h5: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '1.375rem', // 22px
      fontWeight: 600,
      lineHeight: 1.36,
      marginBottom: '0.5em',
    },
    h6: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '0.5em',
    },
    body1: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '1.25rem', // 20px
      fontWeight: 400,
      lineHeight: 1.4,
    },
    body2: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.48,
    },
    body3: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.54,
    },
    body4: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '0.813rem',
      fontWeight: 400,
      lineHeight: 1.64,
    },
    overline1: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '0.875rem', // 14px
      fontWeight: 600,
      letterSpacing: '0.04rem', // 0.64px
      lineHeight: 1.54,
      textTransform: 'uppercase',
    },
    overline2: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '0.813rem', // 13px
      fontWeight: 600,
      letterSpacing: '0.04rem', // 0.64px
      lineHeight: 1.64,
      textTransform: 'uppercase',
    },
    overline3: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '0.688rem', // 11px
      fontWeight: 600,
      letterSpacing: '0.04rem', // 0.64px
      lineHeight: 1.76,
      textTransform: 'uppercase',
    },
    figcaption: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '0.875rem', // 14px
      fontWeight: 600,
      lineHeight: 1.54,
      marginTop: '0.438rem', // 7px
    },
    strong: {
      fontWeight: 600,
    },
    em: {
      fontStyle: 'italic',
    },
    // Label typography variants for form labels and breadcrumbs
    label1: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '1rem', // 16px
      fontWeight: 600,
      lineHeight: 1.48,
    },
    label2: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '0.875rem', // 14px
      fontWeight: 600,
      lineHeight: 1.54,
    },
    label3: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '0.75rem', // 12px
      fontWeight: 600,
      lineHeight: 1.64,
    },
    label4: {
      fontFamily: createFontStack(GEIST_FONT, NOTO_FONT),
      fontSize: '0.625rem', // 10px
      fontWeight: 600,
      lineHeight: 1.8,
    },
  },
});

export default theme;
