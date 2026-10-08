import {createTheme} from '@mui/material';

export type * from './muiAugmentation';

import {MAIN_FONT_STACK, HEADING_FONT_STACK} from './constants/fonts';
import {STYLE_OVERRIDES} from './styleOverrides';

const theme = createTheme({
  cssVariables: true,
  components: STYLE_OVERRIDES,
  typography: {
    fontFamily: MAIN_FONT_STACK,
    h1: {
      fontFamily: HEADING_FONT_STACK,
      fontSize: '3rem', // 48px
      fontWeight: 600,
      lineHeight: 1.08,
      letterSpacing: '-0.01em', // -1%
    },
    h2: {
      fontFamily: HEADING_FONT_STACK,
      fontSize: '2.375rem', // 38px
      fontWeight: 600,
      lineHeight: 1.05,
      letterSpacing: '-0.01em', // -1%
    },
    h3: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '1.75rem', // 28px
      fontWeight: 600,
      lineHeight: 1.29,
    },
    h4: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.33,
    },
    h5: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '1.375rem', // 22px
      fontWeight: 600,
      lineHeight: 1.36,
    },
    h6: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '1.125rem', // 18px
      fontWeight: 400,
      lineHeight: 1.44, // 26px
    },
    body2: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.5, // 24px
    },
    body3: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.57, // 22px
    },
    body4: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.5, // 18px
    },
    overline1: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '0.875rem', // 14px
      fontWeight: 600,
      letterSpacing: '0.06em', // 6%
      lineHeight: 1.57, // 22px
      textTransform: 'uppercase',
    },
    overline2: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '0.75rem', // 12px
      fontWeight: 600,
      letterSpacing: '0.06em', // 6%
      lineHeight: 1.5, // 18px
      textTransform: 'uppercase',
    },
    overline3: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '0.625rem', // 10px
      fontWeight: 600,
      letterSpacing: '0.06em', // 6%
      lineHeight: 1.6, // 16px
      textTransform: 'uppercase',
    },
    figcaption: {
      fontFamily: MAIN_FONT_STACK,
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
      fontFamily: MAIN_FONT_STACK,
      fontSize: '1rem', // 16px
      fontWeight: 600,
      lineHeight: 1.5, // 24px
    },
    label2: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '0.875rem', // 14px
      fontWeight: 600,
      lineHeight: 1.57, // 22px
    },
    label3: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '0.75rem', // 12px
      fontWeight: 600,
      lineHeight: 1.5, // 18px
    },
    label4: {
      fontFamily: MAIN_FONT_STACK,
      fontSize: '0.625rem', // 10px
      fontWeight: 600,
      lineHeight: 1.6, // 16px
    },
  },
});

export default theme;
