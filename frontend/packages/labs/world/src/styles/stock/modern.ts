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
      // WHAT A CONTROL IS. Five classes cover every shape the kit paints;
      // everything below them is a part that any of the five may wear.
      //
      // The Button is borderless and RAISED, which is the pair Classic turns
      // inside out — it has an edge and casts nothing. That pair is the whole
      // reason a class holds a bundle rather than a colour.
      button: {
        fill: '$accent',
        stroke: null,
        corner: '$radius',
        shadow: cast(SHADOW),
      },
      // A sheet things sit ON: a Panel, a Dropdown's face, a List's face.
      surface: {
        fill: '$surface',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius',
        shadow: null,
      },
      // A recess things sit IN: a Viewport, a Scroll View.
      well: {
        fill: '$well',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius tight',
        shadow: null,
      },
      // A sheet OVER the page: a Speech Box, an open menu. The one
      // distinction colour alone cannot carry — a Viewport is the same dark
      // and is part of the page.
      floating: {
        fill: '$surface raised',
        stroke: null,
        corner: '$radius',
        shadow: cast(SHADOW_OVER),
      },
      // …and one you may put a caret in.
      field: {
        fill: '$field',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius tight',
        shadow: null,
      },

      // THE PARTS, shared by every control that has them. `caption` is the
      // one worth arguing about: a Button's words and a Panel's title look
      // the same here and looked different in the first cut. They can be the
      // same, because within one theme every surface is dark, so one ink
      // serves both. A theme that wants two defines a second class and the
      // drawing names it.
      caption: {fill: '$ink', stroke: null, shadow: null, weight: 'bold'},
      hint: {fill: '$muted ink', stroke: null, weight: 'normal'},
      // An outline and nothing else: the pen may be carrying a word's fill,
      // and a filled ring is a rectangle painted over the word.
      ring: {
        fill: null,
        stroke: '$focus',
        strokeWidth: '$ring width',
        corner: '$ring radius',
        shadow: null,
      },
      track: {fill: '$muted', stroke: null, corner: '$radius bar'},
      bar: {fill: '$accent', stroke: null, corner: '$radius bar', shadow: null},
      knob: {fill: '$ink', stroke: null, shadow: null},
      chosen: {fill: '$accent raised', stroke: null, shadow: null},
      pointed: {fill: '$surface raised', stroke: null, shadow: null},
      on: {fill: '$positive', stroke: null},
      off: {fill: '$muted', stroke: null},
      wrong: {fill: null, stroke: '$danger', strokeWidth: 2},
      // Defined, and read by no drawing yet — see `STYLE_ROLES`.
      pressed: {fill: '$accent raised', shadow: null},
    },
  },
  undefined,
  2,
);
