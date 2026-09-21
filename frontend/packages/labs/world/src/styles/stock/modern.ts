// "Modern" — rounded, borderless, with a shadow under anything raised.
//
// What the kit is drawn at, and the same values `stock/look` holds: this file
// is where they go once a learner can change them (specs/STYLES_PLAN.md).

import {
  BORDER,
  LOOK,
  RADIUS,
  RADIUS_BAR,
  RADIUS_TIGHT,
  RING_WIDTH,
  SHADOW,
  SHADOW_OVER,
  ringRadius,
} from '../../actors/stock/look';

/** `[r, g, b, a]` floats as a theme writes a colour with an alpha. */
const cast = (shadow: {
  color: readonly [number, number, number, number];
  blur: number;
  down: number;
}) => ({
  color: `rgba(${Math.round(shadow.color[0] * 255)}, ${Math.round(
    shadow.color[1] * 255,
  )}, ${Math.round(shadow.color[2] * 255)}, ${shadow.color[3]})`,
  blur: shadow.blur,
  down: shadow.down,
});

export const modernStyle = JSON.stringify(
  {
    name: 'Modern',
    tokens: {
      // The palette, which is the kit's own and was already coherent — it was
      // just written thirty-nine times instead of once.
      // WHAT THE CONTROLS SIT ON. No style names it — a world paints its own
      // background, and this is not that block's business — but a theme that
      // could not say what it expects to be read against would be a theme
      // nobody could preview honestly (`editor/ThemePreview`).
      page: '#141826',
      surface: LOOK.surface,
      'surface edge': LOOK.surfaceEdge,
      'surface raised': LOOK.surfaceRaised,
      well: LOOK.well,
      field: LOOK.field,
      accent: LOOK.accent,
      'accent raised': LOOK.accentRaised,
      ink: LOOK.ink,
      'muted ink': LOOK.mutedInk,
      muted: LOOK.muted,
      focus: LOOK.focus,
      danger: LOOK.danger,
      positive: LOOK.positive,
      // …and the shape, which is most of what separates one theme from
      // another. Classic differs from this file in four numbers and the
      // presence of the shadows.
      radius: RADIUS,
      'radius tight': RADIUS_TIGHT,
      'radius bar': RADIUS_BAR,
      border: BORDER,
      'ring width': RING_WIDTH,
      'ring radius': ringRadius(RADIUS),
    },
    styles: {
      // A sheet things sit ON.
      surface: {
        fill: '$surface',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius',
        shadow: null,
        weight: 'normal',
      },
      'surface edge': {stroke: '$surface edge', strokeWidth: '$border'},
      // A recess things sit IN — a Viewport, a Scroll View, a Speech Box.
      well: {
        fill: '$well',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius tight',
        shadow: null,
      },
      // A sheet that is OVER the page rather than in it — a Speech Box. The
      // pair `well`/`floating` is the one distinction the kit needs that
      // colour alone cannot carry: both are dark recesses, and only one of
      // them is in front of the scene.
      floating: {
        fill: '$well',
        stroke: null,
        corner: '$radius',
        shadow: cast(SHADOW_OVER),
      },
      // …and a well you may put a caret in.
      field: {
        fill: '$field',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius tight',
        shadow: null,
      },
      // The one colour that means "press this". BORDERLESS AND RAISED, which
      // is the pair Classic inverts: it has an edge and casts nothing.
      'button face': {
        fill: '$accent',
        stroke: null,
        corner: '$radius',
        shadow: cast(SHADOW),
      },
      'button caption': {
        fill: '$ink',
        stroke: null,
        shadow: null,
        weight: 'bold',
      },
      // A menu is over the page rather than on it, so it casts further.
      menu: {
        fill: '$surface raised',
        stroke: null,
        corner: '$radius',
        shadow: cast(SHADOW_OVER),
      },
      'chosen row': {fill: '$accent raised', stroke: null, shadow: null},
      'pointed row': {fill: '$surface raised', stroke: null, shadow: null},
      bar: {fill: '$accent', stroke: null, corner: '$radius bar', shadow: null},
      'bar track': {fill: '$muted', stroke: null, corner: '$radius bar'},
      knob: {fill: '$ink', stroke: null, shadow: null},
      'switch on': {fill: '$positive', stroke: null},
      'switch off': {fill: '$muted', stroke: null},
      // An outline and nothing else: the pen may be carrying a word's fill,
      // and a filled ring is a rectangle painted over the word.
      'focus ring': {
        fill: null,
        stroke: '$focus',
        strokeWidth: '$ring width',
        corner: '$ring radius',
        shadow: null,
      },
      'wrong edge': {fill: null, stroke: '$danger', strokeWidth: 2},
      hint: {fill: '$muted ink', stroke: null, weight: 'normal'},
    },
  },
  undefined,
  2,
);
