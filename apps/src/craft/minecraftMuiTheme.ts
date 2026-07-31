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
 * The bevel is painted only with the background *longhands*
 * (background-image/position/size/repeat), never the `background`
 * shorthand. The shorthand resets background-color to transparent, which
 * erased the variant's fill wherever it was declared at higher specificity
 * (notably `:active`). The longhands leave background-color untouched, so
 * the variant color shows through the bevel's transparent interior in every
 * state. Do not fold these back into `background:`.
 *
 * Applies to both MuiButton (GameButtons run/reset/finish) and
 * MuiIconButton (ArrowButtons).
 *
 * Replaces the old `.minecraft button` sprite-slice rules from
 * apps/style/craft/style.scss.
 */

const BEVEL_HIGHLIGHT = '0.35';
const BEVEL_DARK = '0.75';

type Layer = {image: string; position?: string; size?: string};

const WHITE = (alpha: string) => `rgba(255, 255, 255, ${alpha})`;
const BLACK = (alpha: string) => `rgba(0, 0, 0, ${alpha})`;

// 2px stripe of `color` on the leading (top/left) edge, transparent after.
const near = (deg: number, color: string) =>
  `linear-gradient(${deg}deg, ${color} 0px, ${color} 2px, transparent 2px, transparent 100%)`;
// 2px stripe of `color` on the trailing (bottom/right) edge, transparent before.
const far = (deg: number, color: string) =>
  `linear-gradient(${deg}deg, transparent 0px, transparent calc(100% - 2px), ${color} calc(100% - 2px), ${color} 100%)`;

// Eight-layer bevel: `lead` lights the top-left edges, `trail` shades the
// bottom-right ones. Swap the two to invert the bevel when pressed.
const bevelLayers = (lead: string, trail: string): Layer[] => [
  {image: near(90, lead)},
  {image: near(180, lead), position: '2px 0px', size: '100% 100%'},
  {image: far(90, trail)},
  {image: far(180, trail), position: '-2px 0px', size: '100% 100%'},
  {image: near(90, lead), position: '2px 2px', size: '100% calc(100% - 4px)'},
  {image: near(180, lead), position: '4px 2px', size: 'calc(100% - 6px) 100%'},
  {image: far(90, trail), position: '-2px 2px', size: '100% calc(100% - 4px)'},
  {image: far(180, trail), position: '2px -2px', size: 'calc(100% - 6px) 100%'},
];

// Resting bevel: light highlight on top-left, dark shade on bottom-right.
const bevel = (highlight: string, dark: string) =>
  bevelLayers(WHITE(highlight), BLACK(dark));
// Pressed bevel: the two edges trade places.
const bevelPressed = (highlight: string, dark: string) =>
  bevelLayers(BLACK(dark), WHITE(highlight));

// Serialize a layer stack to background longhands: one comma-separated list
// per property, aligned by index. The two edge-line layers carry no position
// or size and fall back to the initial `0 0` / `auto` (a full-box tile).
const toBackground = (layers: Layer[]) => ({
  backgroundImage: layers.map(l => l.image).join(', '),
  backgroundPosition: layers.map(l => l.position ?? '0 0').join(', '),
  backgroundSize: layers.map(l => l.size ?? 'auto').join(', '),
  backgroundRepeat: layers.map(() => 'no-repeat').join(', '),
});

const BEVEL = toBackground(bevel(BEVEL_HIGHLIGHT, BEVEL_DARK));
const BEVEL_PRESSED = toBackground(bevelPressed(BEVEL_HIGHLIGHT, BEVEL_DARK));
// Muted bevel so disabled buttons keep their shape without popping.
const BEVEL_DISABLED = toBackground(bevel('0.15', '0.15'));

const MINECRAFT_CHROME = {
  borderRadius: 0,
  border: 'none',
  boxShadow: 'none',
  ...BEVEL,
  transition: 'none',
  textShadow: '2px 2px rgba(0, 0, 0, 0.4)',
  imageRendering: 'pixelated',
  // Same selector keys as the brand root styles so these win the merge
  // below; each re-states the brand declarations it would otherwise drop.
  '&:hover, a&:hover': {
    boxShadow: 'none',
    textDecoration: 'none',
  },
  // The brand styles clear box-shadow on focus, which flattens the bevel
  // on a clicked (still-focused) button. Declared before :active so the
  // pressed bevel wins while the button is held down.
  '&:focus, a&:focus': {
    boxShadow: 'none',
    textDecoration: 'none',
    outline: 'none',
  },
  '&:focus-visible, a&:focus-visible': {
    outline: '2px solid var(--borders-brand-teal-primary)',
    outlineOffset: '2px',
    borderRadius: 0,
    boxShadow: 'none',
    textDecoration: 'none',
  },
  '&:active, a&:active': {
    border: 'none',
    boxShadow: 'none',
    textDecoration: 'none',
    ...BEVEL_PRESSED,
  },
  '&.Mui-disabled, &[aria-disabled="true"], &[disabled]': {
    cursor: 'not-allowed',
    boxShadow: 'none',
    textShadow: 'none',
    opacity: 0.5,
    ...BEVEL_DISABLED,
  },
  '&.MuiButton-sizeExtraSmall': {
    textShadow: 'none',
  },
} as const;

// Outlined buttons sit on light backgrounds, where the bevel's white
// highlight is invisible. Composite a translucent darkening layer beneath
// the bevel (last layer = bottom of the stack) over whatever backgroundColor
// the brand variant supplies (including hover) so the highlight has
// contrast, without hardcoding a color.
const DARKEN: Layer = {
  image: 'linear-gradient(rgba(0, 0, 0, 0.28), rgba(0, 0, 0, 0.28))',
};

const MINECRAFT_OUTLINED = {
  ...toBackground([...bevel('0.60', '0.80'), DARKEN]),
  // The bevel *is* the outline, so drop the brand border. It comes from the
  // brand theme's `{variant:'outlined'}` component variant, which MUI emits
  // after styleOverrides.root; a plain `border:none` here ties its single
  // class and loses on source order. The `&&` doubles our class so we
  // out-specify it, in every state the variant restates the border.
  '&&': {
    border: 'none',
    textShadow: '1px 2px rgba(33, 33, 33, 0.4)',
  },
  '&&:hover, &&:active': {border: 'none'},
  '&&.Mui-disabled, &&[aria-disabled="true"]': {border: 'none'},
  '&:active, a&:active': {
    ...toBackground([...bevelPressed('0.60', '0.80'), DARKEN]),
  },
  '&.Mui-disabled, &[aria-disabled="true"]': {
    ...toBackground([...bevel('0.33', '0.33'), DARKEN]),
  },
} as const;

type RootOverride = object | ((props: object) => object) | undefined;
type StyleProps = {ownerState?: {variant?: string}; variant?: string};

// Layer the Minecraft chrome over a brand root override. createTheme()
// replaces styleOverrides.root wholesale on merge (functions are not
// deep-merged), so the brand root styles are spread back in first.
// Variant is read from ownerState rather than matched with a class
// selector: MuiIconButton's `variant` is a design-system extension and
// gets no MuiIconButton-outlined utility class.
function withMinecraftChrome(
  outerRoot: RootOverride,
  gameButtons: boolean = false
) {
  return (props: StyleProps) => {
    const variant = props.ownerState?.variant ?? props.variant;
    return {
      ...(typeof outerRoot === 'function' ? outerRoot(props) : outerRoot),
      ...MINECRAFT_CHROME,
      ...(gameButtons
        ? {
            '&.MuiButton-containedSizeMedium, &.MuiButton-outlinedSizeMedium': {
              fontSize: '200%',
              padding: '.375rem 1.5rem .375rem 1.5rem',
            },
            '&.MuiButton-containedSizeMedium:active, &.MuiButton-outlinedSizeMedium:active':
              {
                padding:
                  'calc(.375rem + 2px) calc(1.5rem - 2px) calc(.375rem - 2px) calc(1.5rem + 2px)',
                ...BEVEL_PRESSED,
              },
          }
        : {}),
      ...(variant === 'outlined' ? MINECRAFT_OUTLINED : undefined),
    };
  };
}

export function minecraftGameButtonMuiTheme(outerTheme: Theme): Theme {
  const outer = outerTheme.components;
  return createTheme(outerTheme, {
    components: {
      MuiButton: {
        styleOverrides: {
          root: withMinecraftChrome(
            outer?.MuiButton?.styleOverrides?.root as RootOverride,
            true
          ),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: withMinecraftChrome(
            outer?.MuiIconButton?.styleOverrides?.root as RootOverride,
            true
          ),
        },
      },
    },
  });
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
