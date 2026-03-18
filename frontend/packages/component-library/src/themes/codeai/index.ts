import {createTheme} from '@mui/material';

import {
  NOTO_FONT,
  BARLOW_FONT,
  FIGTREE_FONT,
  createFontStack,
} from '../code.org/constants/fonts';
import {STYLE_OVERRIDES} from '../code.org/styleOverrides';

/**
 * CodeAI MUI theme — visually distinct from the Code.org theme.
 *
 * Uses a hot-pink primary palette as a placeholder.  Swap the hex values
 * below once final brand colours are available.
 *
 * Typography and component-level style overrides are shared with the
 * Code.org theme so the two stay structurally identical; only the palette
 * differs.
 */
const theme = createTheme({
  cssVariables: true,
  components: STYLE_OVERRIDES,
  palette: {
    primary: {
      main: '#FF69B4', // hot pink — placeholder
      light: '#FF99CC',
      dark: '#CC5490',
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
    h1: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '3rem',
      fontWeight: 600,
      lineHeight: 1.16,
    },
    h2: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '2.125rem',
      fontWeight: 600,
      lineHeight: 1.24,
    },
    h3: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.28,
    },
    h4: {
      fontFamily: createFontStack(BARLOW_FONT, NOTO_FONT),
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.32,
    },
    h5: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.48,
    },
    body1: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1.25rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    body2: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1rem',
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
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.04rem',
      lineHeight: 1.54,
      textTransform: 'uppercase',
    },
    overline2: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.813rem',
      fontWeight: 600,
      letterSpacing: '0.04rem',
      lineHeight: 1.64,
      textTransform: 'uppercase',
    },
    overline3: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.688rem',
      fontWeight: 600,
      letterSpacing: '0.04rem',
      lineHeight: 1.76,
      textTransform: 'uppercase',
    },
    figcaption: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.54,
      marginTop: '0.438rem',
    },
    strong: {
      fontWeight: 600,
    },
    em: {
      fontStyle: 'italic',
    },
    label1: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.48,
    },
    label2: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.54,
    },
    label3: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.64,
    },
    label4: {
      fontFamily: createFontStack(FIGTREE_FONT, NOTO_FONT),
      fontSize: '0.625rem',
      fontWeight: 600,
      lineHeight: 1.8,
    },
  },
});

export default theme;
