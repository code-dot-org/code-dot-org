// "Classic" — square, bordered, and flat.
//
// THE PROOF THAT THE SPLIT WORKS. This file and `modern` drive the SAME
// drawings: not one control changes, not one `use style` moves. What differs
// is four numbers and whether the shadows are there at all — which is exactly
// the claim, that a drawing which names a role stops encoding the look
// (specs/STYLES_PLAN.md).
//
// It is also the case tokens alone could not express. Modern's Button is
// borderless and raised; Classic's has an edge and casts nothing. With a
// drawing composing its own look, "border versus shadow" would have had to be
// a branch in the drawing; here it is two files.

import {LOOK} from '../../actors/stock/look';

export const classicStyle = JSON.stringify(
  {
    name: 'Classic',
    tokens: {
      // A LIGHTER PALETTE, because a bordered flat interface reads better as
      // one: shadows are what separated things on the dark one, and with none
      // the surfaces have to differ from each other by value instead.
      // …and the reason this token earns its place: the two themes expect to
      // be read against opposite backgrounds, and neither can say so in a
      // class, because no control paints the page. It is also why `well`
      // could not fold into THIS one and folded into `field` instead — a
      // Classic desktop is grey and a Classic text area is white.
      background: '#8a8a82',
      primary: '#d4d0c8',
      // The gentle end is lighter here and the strong end is DARKER, which is
      // the opposite of Modern and is the point of naming them by contrast
      // rather than by lightness.
      'primary light': '#e8e6e0',
      'primary strong': '#41403c',
      secondary: '#a8a49c',
      accent: '#2c4a86',
      'accent light': '#3a5fa8',
      ink: '#14141a',
      'ink light': '#6a6a72',
      field: '#ffffff',
      // Kept from the dark theme on purpose: a focus ring is an accessibility
      // answer before it is a style, and this one is high contrast on both.
      focus: LOOK.focus,
      danger: '#a01c20',
      positive: '#1c7a30',
      warning: '#9a6a10',
      // …and the four numbers that are most of what "Classic" means.
      radius: 0,
      'radius tight': 0,
      'radius bar': 0,
      border: 2,
      'ring width': 1,
      'ring radius': 0,
    },
    styles: {
      // THE SAME FIVE CLASSES, turned inside out. Nothing in any drawing
      // changes between this file and Modern; what changes is four numbers
      // and whether the shadows are there — which is the claim the two of
      // them exist to make (specs/STYLES_PLAN.md).
      //
      // The Button has an EDGE and casts NOTHING, where Modern's is
      // borderless and raised. That pair is the case a token could not
      // express: a drawing composing its own look would have needed a branch.
      button: {
        fill: '$primary',
        stroke: '$primary strong',
        strokeWidth: '$border',
        corner: '$radius',
        shadow: null,
      },
      surface: {
        fill: '$primary',
        stroke: '$primary strong',
        strokeWidth: '$border',
        corner: '$radius',
        shadow: null,
      },
      inset: {
        fill: '$field',
        stroke: '$primary strong',
        strokeWidth: '$border',
        corner: '$radius tight',
        shadow: null,
      },
      floating: {
        fill: '$primary light',
        stroke: '$primary strong',
        strokeWidth: '$border',
        corner: '$radius',
        shadow: null,
      },
      field: {
        fill: '$field',
        stroke: '$primary strong',
        strokeWidth: '$border',
        corner: '$radius tight',
        shadow: null,
      },

      // …and the parts. The caption is INK on a light surface rather than
      // white on accent, and NOT bold — the other half of the inversion, and
      // the case that found the bug this reshape fixed: `text color` used to
      // override this and a white caption sat on a light grey face.
      caption: {fill: '$ink', stroke: null, shadow: null, weight: 'normal'},
      hint: {fill: '$ink light', stroke: null, weight: 'normal'},
      ring: {
        fill: null,
        stroke: '$focus',
        strokeWidth: '$ring width',
        corner: '$ring radius',
        shadow: null,
      },
      track: {fill: '$secondary', stroke: null, corner: '$radius bar'},
      bar: {fill: '$accent', stroke: null, corner: '$radius bar', shadow: null},
      knob: {
        fill: '$primary light',
        stroke: '$primary strong',
        strokeWidth: 1,
        shadow: null,
      },
      chosen: {fill: '$accent light', stroke: null, shadow: null},
      pointed: {fill: '$primary light', stroke: null, shadow: null},
      on: {fill: '$positive', stroke: null},
      off: {fill: '$secondary', stroke: null},
      wrong: {fill: null, stroke: '$danger', strokeWidth: 2},
      // A pressed control on a flat interface goes DARKER, where a raised one
      // would sink. Defined and read by no drawing yet — see `STYLE_ROLES`.
      pressed: {fill: '$secondary', shadow: null},
    },
  },
  undefined,
  2,
);
