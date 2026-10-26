// The stock themes: what a control looks like, as a file rather than as code.
//
// A `.style` file holds TOKENS — named values — and STYLES, which are named
// bundles that refer to them. A drawing says `use style ⟨button face⟩` and a
// world says `use theme ⟨styles/modern⟩`, so the drawings name roles and one
// row decides what a role means (specs/STYLES_PLAN.md).
//
// TWO OF THEM, because one theme proves nothing. The whole claim is that a
// bordered Classic and a shadowed borderless Modern come out of the SAME
// drawings, and the only way to know that is true is to have both.
//
// EVERY THEME DEFINES EVERY ROLE. A drawing naming a style its theme lacks
// leaves the pen as it was (`CommandPen.useStyle`) — visible and wrong rather
// than absent, which is the right failure but still a failure. `stockStyles`
// is pinned to the list below by a test so a new role cannot be added to one
// theme and forgotten in the other.

import {classicStyle} from './classic';
import {dangerStyle} from './danger';
import {modernStyle} from './modern';

export interface StockStyle {
  /** File stem this is imported as — `modern` becomes `styles/modern.style`. */
  id: string;
  name: string;
  /** One line on what it is, for a menu. */
  description: string;
  /** The `.style` JSON, copied verbatim on import. */
  contents: string;
}

/**
 * The classes a theme must name, which is the vocabulary the kit draws with.
 *
 * NAMED FOR WHAT A THING IS rather than for which control it belongs to,
 * which is what lets one name serve six kinds. The first cut named them after
 * components — `button face`, `button caption`, `menu`, `chosen row` — which
 * is eighteen names for six ideas, grows with the kit, and gives a project no
 * way to say "this one button is the dangerous one" (specs/STYLES_PLAN.md).
 *
 * Read as a table: `surface` is a sheet things sit ON, `inset` is a recess
 * things sit IN, `field` is an inset you may put a caret in, and `floating`
 * is a sheet over the page.
 */
export const STYLE_ROLES = [
  // What a control IS.
  'button',
  'surface',
  // `inset`, not `well`: the one class name in the first cut that said
  // nothing to anybody who had not written it (specs/STYLES_PLAN.md).
  'inset',
  'floating',
  'field',
  // …and the parts every control shares.
  'caption',
  'hint',
  'ring',
  'track',
  'bar',
  'knob',
  'chosen',
  'pointed',
  'on',
  'off',
  'wrong',
  // Defined by every theme and read by no drawing yet: a control that looks
  // pressed needs `being pressed`, which is the Gestures rule's, which means
  // the Button starts pulling a rule granted two lessons after it. That is a
  // curriculum decision. The slot is here so that the day it is made, it is
  // one `if` per control (specs/STYLES_PLAN.md).
  'pressed',
] as const;

export const STOCK_STYLES: readonly StockStyle[] = [
  {
    id: 'modern',
    name: 'Modern',
    description:
      'Rounded corners, no borders, and a shadow under anything raised — the look a phone app has. The default the kit is drawn at.',
    contents: modernStyle,
  },
  {
    id: 'classic',
    name: 'Classic',
    description:
      'Square corners and a visible border on everything, with no shadows. The same controls, drawn the way a desktop program drew them.',
    contents: classicStyle,
  },
  {
    id: 'danger',
    name: 'Danger',
    description:
      'Modern with a red button, as four lines that say only what differs. Point one placement at it in the map editor to make that one button the dangerous one.',
    contents: dangerStyle,
  },
];
