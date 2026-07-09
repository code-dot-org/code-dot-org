import {createTheme, Theme} from '@mui/material/styles';

/**
 * Minecraft-flavored MUI theme for craft levels.
 *
 * Extends the ambient brand theme (applied in createReactRoot) rather than
 * replacing it: button colors still come from the brand theme's variant
 * styles (contained/primary is the design-system purple, etc), so semantic
 * colors and light/dark theming keep working. This theme only adds the
 * Minecraft chrome: square corners, a thick outline, and an inner bevel
 * drawn with translucent black/white so it reads on any background color.
 *
 * Replaces the old `.minecraft button` sprite-slice rules from
 * apps/style/craft/style.scss.
 */

// Light top-left edge, heavy bottom-right shade; inverted when pressed.
const BEVEL =
  'inset -4px -4px 0 rgba(0, 0, 0, 0.35), inset 4px 4px 0 rgba(255, 255, 255, 0.25)';
const BEVEL_PRESSED =
  'inset 4px 4px 0 rgba(0, 0, 0, 0.35), inset -4px -4px 0 rgba(255, 255, 255, 0.15)';

const MINECRAFT_BUTTON = {
  borderRadius: 0,
  border: '2px solid var(--neutral-base-black)',
  boxShadow: BEVEL,
  transition: 'none',
  imageRendering: 'pixelated',
  '&.MuiButton-contained': {
    textShadow: '2px 2px rgba(0, 0, 0, 0.4)',
  },
  // Outlined buttons sit on light backgrounds, where the bevel's white
  // highlight is invisible. Composite a translucent darkening layer over
  // whatever backgroundColor the brand variant supplies (including hover)
  // so the highlight has contrast, without hardcoding a color.
  '&.MuiButton-outlined': {
    backgroundImage:
      'linear-gradient(rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.12))',
  },
  // Same selector keys as the brand root styles so these win the merge
  // below; each re-states the brand declarations it would otherwise drop.
  '&:hover, a&:hover': {
    boxShadow: BEVEL,
    textDecoration: 'none',
  },
  '&:active, a&:active': {
    border: '2px solid var(--neutral-base-black)',
    boxShadow: BEVEL_PRESSED,
    textDecoration: 'none',
  },
  '&.Mui-disabled, &[aria-disabled="true"]': {
    cursor: 'not-allowed',
    boxShadow: 'none',
    textShadow: 'none',
    backgroundImage: 'none',
  },
} as const;

/**
 * Pass to a nested <ThemeProvider theme={minecraftMuiTheme}>; MUI calls it
 * with the outer theme. createTheme() replaces styleOverrides.root wholesale
 * on merge (functions are not deep-merged), so the brand root styles are
 * spread back in before the Minecraft chrome. Variants (per-color styling)
 * and defaultProps are untouched by the merge and survive as-is.
 */
export default function minecraftMuiTheme(outerTheme: Theme): Theme {
  const outerRoot = outerTheme.components?.MuiButton?.styleOverrides?.root as
    | object
    | ((props: object) => object)
    | undefined;
  return createTheme(outerTheme, {
    components: {
      MuiButton: {
        styleOverrides: {
          root: (props: object) => ({
            ...(typeof outerRoot === 'function' ? outerRoot(props) : outerRoot),
            ...MINECRAFT_BUTTON,
          }),
        },
      },
    },
  });
}
