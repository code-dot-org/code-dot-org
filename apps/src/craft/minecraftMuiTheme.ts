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
 * Applies to both MuiButton (GameButtons run/reset/finish) and
 * MuiIconButton (ArrowButtons).
 *
 * Replaces the old `.minecraft button` sprite-slice rules from
 * apps/style/craft/style.scss.
 */

// Light top-left edge, heavy bottom-right shade; inverted when pressed.
const BEVEL =
  'inset -4px -4px 0 rgba(0, 0, 0, 0.35), inset 4px 4px 0 rgba(255, 255, 255, 0.25)';
const BEVEL_PRESSED =
  'inset 4px 4px 0 rgba(0, 0, 0, 0.35), inset -4px -4px 0 rgba(255, 255, 255, 0.15)';
// Muted bevel so disabled buttons keep their shape without popping.
const BEVEL_DISABLED =
  'inset -4px -4px 0 rgba(0, 0, 0, 0.35), inset 4px 4px 0 rgba(255, 255, 255, 0.22)';

const MINECRAFT_CHROME = {
  borderRadius: 0,
  border: '2px solid var(--neutral-base-black)',
  boxShadow: BEVEL,
  transition: 'none',
  imageRendering: 'pixelated',
  // Same selector keys as the brand root styles so these win the merge
  // below; each re-states the brand declarations it would otherwise drop.
  '&:hover, a&:hover': {
    boxShadow: BEVEL,
    textDecoration: 'none',
  },
  // The brand styles clear box-shadow on focus, which flattens the bevel
  // on a clicked (still-focused) button. Declared before :active so the
  // pressed bevel wins while the button is held down.
  '&:focus, a&:focus': {
    boxShadow: BEVEL,
    textDecoration: 'none',
    outline: 'none',
  },
  '&:focus-visible, a&:focus-visible': {
    outline: '2px solid var(--borders-brand-teal-primary)',
    outlineOffset: '2px',
    borderRadius: 0,
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
    boxShadow: BEVEL_DISABLED,
    textShadow: 'none',
    opacity: 0.5,
  },
} as const;

const MINECRAFT_CONTAINED = {
  textShadow: '2px 2px rgba(0, 0, 0, 0.4)',
} as const;

// Outlined buttons sit on light backgrounds, where the bevel's white
// highlight is invisible. Composite a translucent darkening layer over
// whatever backgroundColor the brand variant supplies (including hover)
// so the highlight has contrast, without hardcoding a color.
const MINECRAFT_OUTLINED = {
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.28), rgba(0, 0, 0, 0.28))',
} as const;

type RootOverride = object | ((props: object) => object) | undefined;
type StyleProps = {ownerState?: {variant?: string}; variant?: string};

// Layer the Minecraft chrome over a brand root override. createTheme()
// replaces styleOverrides.root wholesale on merge (functions are not
// deep-merged), so the brand root styles are spread back in first.
// Variant is read from ownerState rather than matched with a class
// selector: MuiIconButton's `variant` is a design-system extension and
// gets no MuiIconButton-outlined utility class.
function withMinecraftChrome(outerRoot: RootOverride) {
  return (props: StyleProps) => {
    const variant = props.ownerState?.variant ?? props.variant;
    return {
      ...(typeof outerRoot === 'function' ? outerRoot(props) : outerRoot),
      ...MINECRAFT_CHROME,
      ...(variant === 'contained' ? MINECRAFT_CONTAINED : undefined),
      ...(variant === 'outlined' ? MINECRAFT_OUTLINED : undefined),
    };
  };
}

/**
 * Pass to a nested <ThemeProvider theme={minecraftMuiTheme}>; MUI calls it
 * with the outer theme. Variants (per-color styling) and defaultProps are
 * untouched by the merge and survive as-is.
 */
export default function minecraftMuiTheme(outerTheme: Theme): Theme {
  const outer = outerTheme.components;
  return createTheme(outerTheme, {
    components: {
      MuiButton: {
        styleOverrides: {
          root: withMinecraftChrome(
            outer?.MuiButton?.styleOverrides?.root as RootOverride
          ),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: withMinecraftChrome(
            outer?.MuiIconButton?.styleOverrides?.root as RootOverride
          ),
        },
      },
    },
  });
}
