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
      surface: '#d4d0c8',
      'surface edge': '#41403c',
      'surface raised': '#e8e6e0',
      well: '#f4f2ee',
      field: '#ffffff',
      accent: '#2c4a86',
      'accent raised': '#3a5fa8',
      ink: '#14141a',
      'muted ink': '#6a6a72',
      muted: '#a8a49c',
      // Kept from the dark theme on purpose: a focus ring is an accessibility
      // answer before it is a style, and this one is high contrast on both.
      focus: LOOK.focus,
      danger: '#a01c20',
      positive: '#1c7a30',
      // …and the four numbers that are most of what "Classic" means.
      radius: 0,
      'radius tight': 0,
      'radius bar': 0,
      border: 2,
      'ring width': 1,
      'ring radius': 0,
    },
    styles: {
      surface: {
        fill: '$surface',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius',
        shadow: null,
        weight: 'normal',
      },
      'surface edge': {stroke: '$surface edge', strokeWidth: '$border'},
      well: {
        fill: '$well',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius tight',
        shadow: null,
      },
      floating: {
        fill: '$surface',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius',
        shadow: null,
      },
      field: {
        fill: '$field',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius tight',
        shadow: null,
      },
      // AN EDGE AND NO SHADOW, which is Modern's button turned inside out.
      'button face': {
        fill: '$surface',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius',
        shadow: null,
      },
      // …and its caption is INK on that surface rather than white on accent,
      // which is the other half of the same inversion.
      'button caption': {
        fill: '$ink',
        stroke: null,
        shadow: null,
        weight: 'normal',
      },
      menu: {
        fill: '$surface raised',
        stroke: '$surface edge',
        strokeWidth: '$border',
        corner: '$radius',
        shadow: null,
      },
      'chosen row': {fill: '$accent raised', stroke: null, shadow: null},
      'pointed row': {fill: '$surface raised', stroke: null, shadow: null},
      bar: {fill: '$accent', stroke: null, corner: '$radius bar', shadow: null},
      'bar track': {fill: '$muted', stroke: null, corner: '$radius bar'},
      knob: {
        fill: '$surface raised',
        stroke: '$surface edge',
        strokeWidth: 1,
        shadow: null,
      },
      'switch on': {fill: '$positive', stroke: null},
      'switch off': {fill: '$muted', stroke: null},
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
